import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';

const content = document.body.textContent;

try {
    const jsonData = JSON.parse(content.trim());
    window.json = jsonData;
    const extensionOptionsAsJSON = document.querySelector('meta[name="extension-options"]').getAttribute('content');
    window.extensionOptions = JSON.parse(extensionOptionsAsJSON);
    const root = document.createElement('div');
    root.setAttribute('id', 'rbrahul-awesome-json');
    document.body.innerHTML = '';
    document.body.appendChild(root);
    ReactDOM.render(
        <App json={jsonData} />,
        document.getElementById('rbrahul-awesome-json'),
    );
} catch (e) {
    // console.error('JSON parsing failed');
}
