import React from 'react';
if (typeof window !== 'undefined') {
    window.React = React;
}
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

window.addEventListener("DOMContentLoaded", function () {
    const content = document.body.textContent;
    try {
        const jsonData = JSON.parse(content);
        window.json = jsonData;
        let root = document.createElement("div");
        root.setAttribute("id", "rbrahul-awesome-json");
        document.body.innerHTML = "";
        document.body.appendChild(root);
        ReactDOM.render(
            <App json={jsonData}/>,
            document.getElementById('rbrahul-awesome-json')
        );
    } catch (e) {
       // console.error('JSON parsing failed');
    }
}, false);


