import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { getURL, parseJson } from './utils/common';
import { DARK_THEMES, DEFAULT_OPTIONS } from './constants/options.js';

const codeMirrorStyleSheetId = 'codemirror-css';
const COLOR_THEME_LINK_TAG_ID = 'color-theme-css';
const CUSTOM_CSS_STYLE_TAG_ID = 'custom-css';

const isJSONViewerProExtensionPage = () => {
    return (
        window.location.href.includes('chrome-extension://') &&
        window.location.search.includes('options')
    );
};

const injectStyleSheet = (stylesheetUrl, idSelector) => {
    const linkTag = document.createElement('link');
    linkTag.setAttribute('href', stylesheetUrl);
    linkTag.rel = 'stylesheet';
    linkTag.type = 'text/css';
    linkTag.id = idSelector;
    document.head.appendChild(linkTag);
    return linkTag;
};

const applyOptionsIfChromeExtensionPage = (options) => {
    if (!isJSONViewerProExtensionPage()) {
        return;
    }
    const themes = {
        default: 'dark-pro.css',
        mdn: 'mdn-light.css',
    };
    let colorThemeStyleSheetLinkElement = document.getElementById(
        COLOR_THEME_LINK_TAG_ID,
    );
    const colorThemeStylesheetUrl = themes[options.theme] || themes['default'];
    const cssURL = getURL('css/color-themes/' + colorThemeStylesheetUrl);

    if (!colorThemeStyleSheetLinkElement) {
        injectStyleSheet(cssURL, COLOR_THEME_LINK_TAG_ID);
    } else if (
        colorThemeStyleSheetLinkElement &&
        colorThemeStyleSheetLinkElement.href.indexOf(colorThemeStylesheetUrl) <
            0
    ) {
        colorThemeStyleSheetLinkElement.setAttribute('href', cssURL);
    }

    let customStyleElement = document.getElementById(CUSTOM_CSS_STYLE_TAG_ID);
    if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = CUSTOM_CSS_STYLE_TAG_ID;
        document.head.appendChild(customStyleElement);
    }

    customStyleElement.textContent = options.css || '';
};

const getOptions = async () => {
    try {
        const metaDataElement = document.querySelector(
            'meta[name="extension-options"]',
        );
        const options =
            metaDataElement && metaDataElement.getAttribute('content');

        if (options) {
            return JSON.parse(options);
        }

        if (isJSONViewerProExtensionPage()) {
            return JSON.parse(
                decodeURIComponent(
                    new URLSearchParams(window.location.search).get('options'),
                ),
            );
        }

        const chrome = window.chrome;
        if (chrome && chrome.storage && chrome.storage.local) {
            return await chrome.storage.local.get([
                'rb-awesome-json-viewer-options',
            ]);
        }
    } catch (error) {
        console.error('Error while fetching options', error);
    }
    return DEFAULT_OPTIONS;
};

const injectCodeMirrorStylesheet = () => {
    if (!!document.querySelector('#' + codeMirrorStyleSheetId)) {
        document.querySelector('#' + codeMirrorStyleSheetId).remove();
    }

    const cssFilePath = getURL('css/codemirror.css');
    injectStyleSheet(cssFilePath, codeMirrorStyleSheetId);
};

/*
 ** Some webistes for example: api.github.com rejects Style tag creation if following CSP is set in the Server Response Headers
 ** Content-Security-Policy: default-src 'none'
 ** CodeMirror 6 Does not provide external CSS file. It only injects styles in the style tag dynamicaly as it was developed
 ** based on CSS in JS.
 **/
const detectCSPViolation = () => {
    window.addEventListener('message', (message) => {
        console.log('message received:', message);
    });

    document.addEventListener('securitypolicyviolation', function (e) {
        if (e.violatedDirective === 'style-src-elem') {
            injectCodeMirrorStylesheet();
        }
    });
};

(async () => {
    detectCSPViolation();
    try {
        let content = document.body?.textContent;
        content = content?.trim();
        const jsonData = parseJson(content);
        window.json = jsonData;
        window.extensionOptions = await getOptions();
        applyOptionsIfChromeExtensionPage(window.extensionOptions);

        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'rbrahul-awesome-json');
        document.body.innerHTML = '';
        document.body.appendChild(rootElement);
        const root = createRoot(rootElement);
        root.render(
            <App
                json={jsonData}
                isDarkMode={DARK_THEMES.includes(
                    window.extensionOptions?.theme,
                )}
            />,
        );
    } catch (e) {
        console.error('Something went wrong at Awesome JSON Viewer Pro', e);
    }
})();
