chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create(
        { url: chrome.runtime.getURL('index.html') },
        function (tab) {},
    );
});

const RB_DOWNLOAD_JSON_MENU = 'RB_DOWNLOAD_JSON_MENU';
const RB_OPEN_SETTINGS = 'RB_OPEN_SETTINGS';

function genericOnClick(info, tab) {
    switch (info.menuItemId) {
      case RB_DOWNLOAD_JSON_MENU:
        chrome.tabs.sendMessage(tab.id, { action: 'rb_download_json' });
        break;
      case RB_OPEN_SETTINGS:
        chrome.tabs.create({
            url: chrome.runtime.getURL('options.html'),
        });
        break;
    }
  }

  chrome.contextMenus.onClicked.addListener(genericOnClick);


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
        });

        chrome.contextMenus.create({
            id: RB_OPEN_SETTINGS,
            title: 'Settings',
            contexts: ['all'],
            type: 'normal',
            documentUrlPatterns: ['*://*/*'],
        });
        alreadyInvoked = true;
    };
};

const createContextMenuOnce = createContextMenu();

const dbName = 'rb-awesome-json-viewer-options';
const sendOptions = async () => {
    let result = await chrome.storage.local.get([dbName]);
    var options = result[dbName];

    if (!options) {
        options = {};
        options.theme = 'default';
        options.css = '';
        options.collapsed = 0;
    } else {
        options = JSON.parse(options);
    }
    options.optionPageURL = chrome.runtime.getURL('options.html');
    options.optionIconURL = chrome.runtime.getURL(
            '/images/icons/gear.png'
        );

    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    await chrome.tabs.sendMessage(tab.id, {
        action: 'options_received',
        options: options,
    });
};

chrome.runtime.onMessage.addListener(async(message) => {
    switch (message.action) {
        case 'give_me_options':
            try {
                await sendOptions();
            } catch (error) {
                console.log("Error Found:",error);
            }
            break;
    }
});

createContextMenuOnce();
