import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';

const codeMirrorStyleSheetId = 'codemirror-css';
const COLOR_THEME_LINK_TAG_ID = 'color-theme-css';
const CUSTOM_CSS_STYLE_TAG_ID = 'custom-css';



//import toast from "./vendor/toast"
//import "./vendor/toast/dist/style.css";

/* Copied from the Options.js */

const DEFAULT_OPTIONS = {
    theme: 'default',
    collapsed: 0,
    css: `/**Write your CSS style **/
      .property{
          /*color:#994c9e;*/
       }

      .json-literal-numeric{
          /*color:#F5B041;*/
       }

       .json-literal-url {
          /*color: #34a632;*/
       }

       .json-literal-string{
          /*color:#0642b0;*/
       }

       .json-literal{
          /*color:#b568de;*/
       }

       .json-literal-boolean{
          /*color: #f23ebb;*/
       }`,
};

const isJSONViewerProExtensionPage = () => {
    return window.location.href.includes('chrome-extension://') && window.location.search.includes('options');
};

const getURL = (assetPath) => {
    const optionUrl = window.extensionOptions?.optionPageURL ?? '';
    try {
        const url = new URL(optionUrl);
        return `${url.origin}/${assetPath}`;
    } catch (error) {
        return assetPath;
    }
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
        mdn: 'color-themes/mdn-light.css',
    };
    let colorThemeStyleSheetLinkElement = document.getElementById(COLOR_THEME_LINK_TAG_ID);
    const colorThemeStylesheetUrl = themes[options.theme] || themes['default'];
    const cssURL = getURL('/css/' + colorThemeStylesheetUrl);

    if (!colorThemeStyleSheetLinkElement) {
        injectStyleSheet(cssURL, COLOR_THEME_LINK_TAG_ID);
    } else if (colorThemeStyleSheetLinkElement && colorThemeStyleSheetLinkElement.href.indexOf(colorThemeStylesheetUrl) < 0) {
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
    window.addEventListener('message',(message) => {
        console.log("message received:", message)
    });

    document.addEventListener('securitypolicyviolation', function (e) {
        if (
            e.violatedDirective === 'style-src-elem'
        ) {
            injectCodeMirrorStylesheet();
        }
    });
};

(async () => {
    detectCSPViolation();
    try {
        let content = document.body?.textContent;
        content = content?.trim();
        const jsonData = JSON.parse(content);
        window.json = jsonData;
        window.extensionOptions = await getOptions();
        applyOptionsIfChromeExtensionPage(window.extensionOptions);

        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'rbrahul-awesome-json');
        document.body.innerHTML = '';
        document.body.appendChild(rootElement);
        const root = createRoot(rootElement);
        root.render(<App json={jsonData} />);
    } catch (e) {
        console.error('Something went wrong at Awesome JSON Viewer Pro', e);
    }
})();
