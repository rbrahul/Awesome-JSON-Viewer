import React from 'react';
if (typeof window !== 'undefined') {
    window.React = React;
}
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
let json = {
    "status": 200,
    "success": {
        "identity": {
                'contact': {
                    'phone': '08801718894836',
                    'email': 'rahulbaruri@gamail.com'
                    }
                },
        "gender": false
    }
};
window.addEventListener("DOMContentLoaded", function () {
    const content = document.body.textContent;
    try {
        const json = window.json = JSON.parse(content);
        let root = document.createElement("div");
        root.setAttribute("id", "rbrahul-awesome-json");
        document.body.innerHTML = "";
        document.body.appendChild(root);
        ReactDOM.render(
            <App json={json}/>,
            document.getElementById('rbrahul-awesome-json')
        );
    } catch (e) {
       // console.error('JSON parsing failed');
    }
}, false);


