chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create(
        { url: chrome.extension.getURL('index.html') },
        function (tab) {},
    );
});

const RB_DOWNLOAD_JSON_MENU = 'RB_DOWNLOAD_JSON_MENU';
const RB_OPEN_SETTINGS = 'RB_OPEN_SETTINGS';

const createContextMenu = () => {
    let alreadyInvoked = false;
    return () => {
        if (alreadyInvoked) return;

        chrome.contextMenus.create({
            id: RB_DOWNLOAD_JSON_MENU,
            title: 'Download JSON',
            contexts: ['all'],
            type: 'normal',
            documentUrlPatterns: ['*://*/*'],
            onclick: function (info, tab) {
                if (info.menuItemId !== RB_DOWNLOAD_JSON_MENU) {
                    return;
                }
                chrome.tabs.sendMessage(tab.id, { action: 'rb_download_json' });
            },
        });

        chrome.contextMenus.create({
            id: RB_OPEN_SETTINGS,
            title: 'Settings',
            contexts: ['all'],
            type: 'normal',
            documentUrlPatterns: ['*://*/*'],
            onclick: function (info, tab) {
                if (info.menuItemId !== RB_OPEN_SETTINGS) {
                    return;
                }
                chrome.tabs.create({
                    url: chrome.extension.getURL('options.html'),
                });
            },
        });
        alreadyInvoked = true;
    };
};

const createContextMenuOnce = createContextMenu();

const dbName = 'rb-awesome-json-viewer-options';
const sendOptions = () => {
    let options = JSON.parse(localStorage.getItem(dbName));
    if (!options) {
        options = {};
        options.theme = 'default';
        options.css = '';
        options.collapsed = true;
    }
    (options.optionPageURL = chrome.extension.getURL('options.html')),
        (options.optionIconURL = chrome.extension.getURL(
            '/images/icons/gear.png',
        )),
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
            createContextMenuOnce();
            break;

        default:
            break;
    }
});
