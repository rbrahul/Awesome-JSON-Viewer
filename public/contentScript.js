function initApplication() {
    var styleTag = document.createElement('link');
    var cssFilePath = chrome.extension.getURL('/static/css/main.css');
    var jsFilePath = chrome.extension.getURL('/static/js/main.js');
    styleTag.setAttribute('href',cssFilePath);
    styleTag.rel="stylesheet";
    styleTag.type="text/css";
    if(document.querySelector('head')) {
        document.querySelector('head').appendChild(styleTag);
    }else {
        var headNode = document.createElement('head');
        document.querySelector('html').insertBefore(headNode,document.querySelector('body'))
    }
    document.head.appendChild(styleTag);
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('src',jsFilePath);
    if(document.querySelector('body')) {
        document.querySelector('body').appendChild(scriptTag);
    }else {
        var body = document.createElement('body');
        document.querySelector('html').appendChild(body)
    }
};

function isJSONResponsePageOnly() {
    var content = document.body.textContent;
    try {
        var jsonData = JSON.parse(content);
        window.jsonData = jsonData;
        return true;
    }catch(e) {
        return false;
    }
}
// alternative to DOMContentLoaded event
document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        if(isJSONResponsePageOnly()) {
            initApplication();
        }
    }
};
