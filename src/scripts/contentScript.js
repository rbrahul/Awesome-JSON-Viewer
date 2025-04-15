'use strict';

const BASE_STYLE_LINK_TAG_ID = 'main-css';
const COLOR_THEME_LINK_TAG_ID = 'color-theme-css';
const CUSTOM_CSS_STYLE_TAG_ID = 'custom-css';
const MAINJS_SCRIPT_TAG_ID = 'main-script';
const ALLOWED_CONTENT_TYPES = [
    'application/json',
    'text/json',
    'application/javascript',
    'application/x-javascript',
    'application/vnd.api+json',
    'text/x-json',
    'text/x-javascript',
];

function getCleanTextContent() {
    const clonedDom = document.documentElement.cloneNode(true);
    clonedDom.querySelectorAll('script, style').forEach((el) => el.remove());
    let bodyInnerText = clonedDom.innerText;
    if (typeof bodyInnerText === 'string') {
        return bodyInnerText.trim();
    }
    return bodyInnerText;
}

const isDocumentContentTypeJSON = () =>
    ALLOWED_CONTENT_TYPES.includes(document.contentType);

const isJsonViewerLoaded = () =>
    !!document.getElementById('rbrahul-awesome-json') ||
    window.JSON_VIEWER_PRO_INITIALISED;

const addBodyTagIfMissing = () => {
    if (!document.querySelector('body')) {
        const body = document.createElement('body');
        document.querySelector('html').appendChild(body);
    }
};

const addHeadTagIfMissing = () => {
    if (!document.querySelector('head')) {
        const headNode = document.createElement('head');
        document
            .querySelector('html')
            .insertBefore(headNode, document.querySelector('body'));
    }
};

const injectStyleSheet = (stylesheetUrl, idSelector) => {
    const styleTag = document.createElement('link');
    styleTag.setAttribute('href', stylesheetUrl);
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.id = idSelector;
    document.head.appendChild(styleTag);
    return styleTag;
};

const injectCssUrlAndStyleTag = () => {
    if (!!document.getElementById(BASE_STYLE_LINK_TAG_ID)) {
        return;
    }
    const baseStyleCssFilePath = chrome.runtime.getURL('/css/style.css');
    injectStyleSheet(baseStyleCssFilePath, BASE_STYLE_LINK_TAG_ID);

    const colorThemeCssFilePath = chrome.runtime.getURL(
        '/css/color-themes/dark-pro.css',
    );
    injectStyleSheet(colorThemeCssFilePath, COLOR_THEME_LINK_TAG_ID);

    const customStyleTag = document.createElement('style');
    customStyleTag.id = CUSTOM_CSS_STYLE_TAG_ID;
    document.head.appendChild(customStyleTag);
};

const injectScriptTag = () => {
    if (!!document.getElementById(MAINJS_SCRIPT_TAG_ID)) {
        return;
    }
    const scriptTag = document.createElement('script');
    scriptTag.id = MAINJS_SCRIPT_TAG_ID;
    const jsFilePath = chrome.runtime.getURL('/js/main.js');
    scriptTag.setAttribute('src', jsFilePath);
    document.querySelector('body').appendChild(scriptTag);
};

// In Manifest V3 we can't use inline scripts so as a work around we pass options by exposing into meta content
const injectOptionsAsMetaContent = (extensionOptions = {}) => {
    const meta = document.createElement('meta');
    meta.name = 'extension-options';
    meta.content = JSON.stringify(extensionOptions);
    document.head.appendChild(meta);
};

const initApplication = (options = {}) => {
    addBodyTagIfMissing();
    addHeadTagIfMissing();
    injectCssUrlAndStyleTag();
    injectScriptTag();
    injectOptionsAsMetaContent(options);
};

const applyOptions = (options) => {
    const themes = {
        default: 'dark-pro.css',
        mdn: 'mdn-light.css',
    };
    const styleNode = document.getElementById(COLOR_THEME_LINK_TAG_ID);
    const colorThemeStylesheetUrl = themes[options.theme] || themes['default'];
    const cssURL = chrome.runtime.getURL(
        '/css/color-themes/' + colorThemeStylesheetUrl,
    );

    if (styleNode.href.indexOf(colorThemeStylesheetUrl) < 0) {
        styleNode.setAttribute('href', cssURL);
    }
    document.getElementById('custom-css').textContent = options.css || '';
};

const renderApplicationWithURLFiltering = (options) => {
    const urls = (options || {}).filteredURL || [];
    const isURLBlocked = urls.some((url) =>
        window.location.href.startsWith(url),
    );

    if (
        !isURLBlocked &&
        (matchesContentType(options) ||
            (isJSONContentDetectionEnabled(options) &&
                doesPageContainsValidJSON()))
    ) {
        initApplication(options);
        applyOptions(options);
        window.JSON_VIEWER_PRO_INITIALISED = true;
    }
};

const matchesContentType = (extensionOptions) => {
    return (
        extensionOptions.jsonDetection.method === 'contentType' &&
        extensionOptions.jsonDetection.selectedContentTypes.includes(
            document.contentType,
        )
    );
};

const isJSONContentDetectionEnabled = (extensionOptions) => {
    return extensionOptions.jsonDetection.method === 'jsonContent';
};

const doesPageContainsValidJSON = () => {
    try {
        const textContent = getCleanTextContent();
        JSON.parse(textContent);
        return true;
    } catch (error) {
        return false;
    }
};

const isContentTypeDetectionEnabled = (extensionOptions) => {
    return extensionOptions.jsonDetection.method === 'contentType';
};

const messageReceiver = () => {
    chrome.runtime.onMessage.addListener((message) => {
        switch (message.action) {
            case 'options_received':
                window.extensionOptions = message.options;
                renderApplicationWithURLFiltering(message.options);
                break;

            case 'settings_updated':
                const previousOptions = window.extensionOptions;
                const newOptions = message.options;

                const contentTypeDetectionEnabled =
                    (isContentTypeDetectionEnabled(previousOptions) ||
                        isContentTypeDetectionEnabled(newOptions)) &&
                    isDocumentContentTypeJSON();

                const jsonContentDetectionEnabled =
                    isJSONContentDetectionEnabled(previousOptions) ||
                    isJSONContentDetectionEnabled(newOptions);

                // window.extensionOptions is the previsous state once options are updated
                // Previsously rendered page needs to be reloaded to reflect updated options
                if (
                    isJsonViewerLoaded() ||
                    contentTypeDetectionEnabled ||
                    jsonContentDetectionEnabled
                ) {
                    window.location.reload();
                }
                break;

            case 'rb_download_json':
                location.hash = 'downloadJSON=true';
                break;

            default:
                break;
        }
    });
};

messageReceiver();

// alternative to DOMContentLoaded event
document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {
        chrome.runtime.sendMessage({ action: 'give_me_options' });
    }
};
