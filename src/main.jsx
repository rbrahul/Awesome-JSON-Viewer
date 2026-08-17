import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { getURL, parseJson } from './utils/common';
import { DARK_THEMES, DEFAULT_OPTIONS } from './constants/options.js';
import { useOptions } from './hooks/useOptions.jsx'; // Import the useTheme hook to ensure it is included in the bundle

const codeMirrorStyleSheetId = 'codemirror-css';
const COLOR_THEME_LINK_TAG_ID = 'color-theme-css';
const CUSTOM_CSS_STYLE_TAG_ID = 'custom-css';

const isJSONViewerProExtensionPage = () => {
    return (
        window.location.protocol === 'chrome-extension:' && window.location.hostname === chrome.runtime.id && window.location.pathname === '/index.html'
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

        const chrome = window.chrome;
        if (chrome && chrome.storage && chrome.storage.local) {
            const data = await chrome.storage.local.get([
                'rb-awesome-json-viewer-options',
            ]);
            // console.log('getOptions:Fetched options from chrome storage', data?.['rb-awesome-json-viewer-options']);
            return data?.['rb-awesome-json-viewer-options'] ?? DEFAULT_OPTIONS;
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
    document.addEventListener('securitypolicyviolation', function (e) {
        if (e.violatedDirective === 'style-src-elem') {
            injectCodeMirrorStylesheet();
        }
    });
};


const handleThemeChange = (event) => {
    const updatedOptions = event.detail ?? DEFAULT_OPTIONS;
    window.extensionOptions = updatedOptions;
    applyOptionsIfChromeExtensionPage(updatedOptions);
};

// listen for events from appscript.js which is injected into the page for extension page as contentscript is not getting executed on chrome-extension:// protocol pages.
// So we are using appscript.js to listen for events and send it to content script which will then send it to background.js
const listenForAppscriptEvents = () => {
    if (!isJSONViewerProExtensionPage()) {
        return;
    }
    window.addEventListener('rb_json_viewer_pro_appscript_options_received', handleThemeChange);
    window.addEventListener('rb_json_viewer_pro_appscript_options_updated', handleThemeChange);
}

const ExtensionApp = ({json}) => {
    const options = useOptions(window.extensionOptions || DEFAULT_OPTIONS);
    const theme = options.theme || 'dark-pro';

    return (
        <App
            json={json}
            isDarkMode={DARK_THEMES.includes(theme)}
            collapsed={options?.collapsed || 0}
            optionPageURL={options?.optionPageURL}
        />
    );
};

(async () => {
    detectCSPViolation();
    listenForAppscriptEvents();
    try {
        let content = document.body?.innerText;
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
            <ExtensionApp
                json={jsonData}
            />,
        );
    } catch (e) {
        console.error('Something went wrong at Awesome JSON Viewer Pro', e);
    }
})();
