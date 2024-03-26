import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';

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

        if (
            window.location.href.includes('chrome-extension://') &&
            window.location.search.includes('options')
        ) {
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

(async () => {
    try {
        const content = document.body.textContent;
        const jsonData = JSON.parse(content.trim());
        window.json = jsonData;
        window.extensionOptions = await getOptions();
        const root = document.createElement('div');
        root.setAttribute('id', 'rbrahul-awesome-json');
        document.body.innerHTML = '';
        document.body.appendChild(root);
        ReactDOM.render(
            <App json={jsonData} />,
            document.getElementById('rbrahul-awesome-json'),
        );
    } catch (e) {
        console.error('Something went wrong at Awesome JSON Viewer Pro', e);
    }
})();
