'use strict';

const BASE_STYLE_LINK_TAG_ID = 'main-css';
const COLOR_THEME_LINK_TAG_ID = 'color-theme-css';
const CUSTOM_CSS_STYLE_TAG_ID = 'custom-css';
const MAINJS_SCRIPT_TAG_ID = 'main-script';

const isJSONResponse = () => document.contentType === 'application/json';
const isJsonViewerLoaded = () =>
    !!document.getElementById('rbrahul-awesome-json');

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

    setTimeout(
        (options) => {
            if (!!document.getElementById('option-menu')) {
                document
                    .getElementById('option-menu')
                    .setAttribute('href', options.optionPageURL);
            }
        },
        1 * 1000,
        options,
    );
};

const renderApplicationWithURLFiltering = (options) => {
    const urls = (options || {}).filteredURL || [];
    const isURLBlocked = urls.some((url) =>
        window.location.href.startsWith(url),
    );

    if (isURLBlocked || !isJSONResponse()) return;

    initApplication(options);
    applyOptions(options);
};

const messageReceiver = () => {
    chrome.runtime.onMessage.addListener((message) => {
        switch (message.action) {
            case 'options_received':
                window.extensionOptions = message.options;
                renderApplicationWithURLFiltering(message.options);
                break;

            case 'settings_updated':
                if (isJSONResponse() || isJsonViewerLoaded()) {
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
        if (isJSONResponse()) {
            chrome.runtime.sendMessage({ action: 'give_me_options' });
        }
    }
};
