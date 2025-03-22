const dbName = 'rb-awesome-json-viewer-options';

chrome.action.onClicked.addListener(async (tab) => {
    const extensionOptions = await getBackwardCompatibleOptions(dbName);
    let queryParam = '';
    if (extensionOptions && extensionOptions.theme) {
        queryParam = `?options=${encodeURIComponent(JSON.stringify(extensionOptions))}`;
    }
    const url = chrome.runtime.getURL('index.html');
    chrome.tabs.create(
        { url: queryParam ? url + queryParam : url},
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

const createContextMenu = async () => {
    try {
        await chrome.contextMenus.removeAll();
    } catch (error) {
        console.log('Context Menu related Error Found:', error);
    } finally {
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
    }
};


const getBackwardCompatibleOptions = async (key) => {
    try {
        const data = await chrome.storage.local.get([key]);
        const existingData = data[key];
        if (existingData && typeof existingData === 'string') {
            try {
                const parsedData = JSON.parse(existingData);
                if (parsedData && Object.keys(parsedData).length > 0) {
                    return parsedData
                }
            } catch (error) {
                console.log('Error while parsing the existing options:', error);
                return;
            }
        }
        return existingData;
    } catch (e) {
        console.error("Your browser doesn't support chrome storage api", e);
    }
    return;
};

const sendOptions = async () => {
    let options = await getBackwardCompatibleOptions(dbName);
    if (!options) {
        options = {};
    }

    options = {
        ...{
            theme: 'default',
            css: '',
            collapsed: 0,
            filteredURL: [],
        },
        ...options
    };

    options.optionPageURL = chrome.runtime.getURL('options.html');
    options.optionIconURL = chrome.runtime.getURL('/images/icons/gear.png');

    try {
        const tabs = await chrome.tabs.query({});
        tabs.forEach(async (tab) => {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'options_received',
                    options: options,
                });
            } catch (error) {}
        });
    } catch (error) {
        console.log('Error Found while sending options from background.js:', error);
    }
};

chrome.runtime.onMessage.addListener(async (message) => {
    switch (message.action) {
        case 'give_me_options':
            try {
                await sendOptions();
            } catch (error) {
                console.log('Error Found:', error);
            }
            break;
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (['install', 'update'].includes(details.reason)) {
        createContextMenu();
    }
});
