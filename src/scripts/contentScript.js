'use strict';

const isJSONResponse = () => document.contentType === 'application/json';
const isJsonViewerLoaded = () => !!document.querySelector('rbrahul-awesome-json');

const addBodyTagIfMissing  = () => {
    if (!document.querySelector('body')) {
        const body = document.createElement('body');
        document.querySelector('html').appendChild(body);
    }
}

const addHeadTagIfMissing = () => {
    if (!document.querySelector('head')) {
        const headNode = document.createElement('head');
        document
            .querySelector('html')
            .insertBefore(headNode, document.querySelector('body'));
    }
}

const injectCssUrlAndStyleTag = () => {
    const styleTag = document.createElement('link');
    const cssFilePath = chrome.runtime.getURL('/css/main.css');
    styleTag.setAttribute('href', cssFilePath);
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.id = 'main-css';
    document.head.appendChild(styleTag);

    const customStyleTag = document.createElement('style');
    customStyleTag.id = 'custom-css';
    document.head.appendChild(customStyleTag);
}

const injectScriptTag = () => {
    const scriptTag = document.createElement('script');
    const jsFilePath = chrome.runtime.getURL('/js/main.js');
    scriptTag.setAttribute('src', jsFilePath);
    document.querySelector('body').appendChild(scriptTag);
}

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
        default: 'main.css',
        mdn: 'mdn.css',
    };
    const styleNode = document.getElementById('main-css');
    let cssURL = '';
    if (options.theme === 'default') {
        cssURL = chrome.runtime.getURL('/css/' + themes[options.theme]);
    } else {
        cssURL = chrome.runtime.getURL('/css/themes/' + themes[options.theme]);
    }

    if (styleNode.href.indexOf(themes[options.theme] < 0)) {
        styleNode.setAttribute('href', cssURL);
    }
    document.getElementById('custom-css').innerHTML = options.css;

    setTimeout(
        (options) => {
            if (!!document.getElementById('option-menu')) {
                document
                    .getElementById('option-menu')
                    .setAttribute('href', options.optionPageURL);
                document
                    .getElementById('option-menu-icon')
                    .setAttribute('src', options.optionIconURL);
                document.getElementById('option-menu-icon').style.display =
                    'block';
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
