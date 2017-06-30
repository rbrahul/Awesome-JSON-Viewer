chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({ 'url': chrome.extension.getURL('index.html') }, function (tab) {
    });
});

const dbName = 'rb-awesome-json-viewer-options';
const sendOptions = () => {
    let options = JSON.parse(localStorage.getItem(dbName));
    if (!options) {
        options = {};
        options.theme = 'default';
        options.css = '';
        options.collapsed = true;
    }
        options.optionPageURL = chrome.extension.getURL('options.html'),
        options.optionIconURL = chrome.extension.getURL('/images/icons/gear.png'),
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                const data = {
                    action: 'options_received',
                    options: options,
                };
                chrome.tabs.sendMessage(tab.id, data);
            });
        });
};

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case 'give_me_options':
            sendOptions();
            break;

        default:
            break;
    }
});
