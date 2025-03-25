import { basicSetup, EditorView } from 'codemirror';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import { css } from '@codemirror/lang-css';

import { DEFAULT_OPTIONS } from '../../constants/options';

var selectors = {
    tabActionButton: '.tab-action-btn',
    urlInput: '#url',
    urlSaveBtn: '#url-save-btn',
    urlItemsContainer: '.url-items',
    noURLMessage: '.no-urls-msg',
    urlDelete: '.url-delete',
    tostMessage: '.tost-message',
};

const DB_NAME = 'rb-awesome-json-viewer-options';

async function sendMessage(action, message) {
    const messageObj = {
        action: action,
    };

    if (message) {
        messageObj.data = message;
    }

    const tabs = await chrome.tabs.query({ active: false });
    tabs.forEach(async (tab) => {
        try {
            if (tab.url) {
                console.log('has tab url:', tab.url);
                await chrome.tabs.sendMessage(tab.id, messageObj);
            } else {
                chrome.tabs.remove(tab.id);
            }
        } catch (error) {}
    });
}

function notify(message, type, duration) {
    var messageType = type || 'success';
    var maxVisibleTime = duration || 3000;
    var tostMessageElement = document.querySelector(selectors.tostMessage);
    ['success', 'error', 'info', 'warning'].forEach((className) => {
        tostMessageElement.classList.remove(className);
    });
    tostMessageElement.querySelector('.text').textContent = message;
    tostMessageElement.classList.add(messageType, 'active');

    setTimeout(() => {
        tostMessageElement.classList.remove('active');
    }, maxVisibleTime);
}

const saveOptions = async (value) => {
    try {
        await chrome.storage.local.set({
            [DB_NAME]: value,
        });
    } catch (e) {
        console.error('chrome storage api error:', e);
    }
};

const migrateOptions = async () => {
    try {
        const data = await chrome.storage.local.get([DB_NAME]);
        const existingData = data[DB_NAME];
        if (existingData && typeof existingData === 'string') {
            try {
                const parsedData = JSON.parse(existingData);
                if (parsedData && Object.keys(parsedData).length > 0) {
                    const optionsToSave = {
                        ...DEFAULT_OPTIONS,
                        ...parsedData,
                    };
                    await saveOptions(optionsToSave);
                }
            } catch (error) {
                console.log('Error while parsing the existing options:', error);
            }
        }
    } catch (e) {
        console.error("Your browser doesn't support chrome storage api", e);
    }
};

const getOptions = async (key) => {
    try {
        const data = await chrome.storage.local.get([key]);
        return data[key];
    } catch (e) {
        console.error("Your browser doesn't support localStorage", e);
    }
    return null;
};

const initCodeMirror = (doc = DEFAULT_OPTIONS.css) => {
    if (window.cssEditor) {
        window.cssEditor.destroy();
    }
    window.cssEditor = new EditorView({
        doc,
        extensions: [
            basicSetup,
            githubDarkInit({
                settings: {
                    background: '#070707',
                    gutterBackground: '#111111',

                    // background: '#fff',
                    // gutterBackground: '#efefef',
                },
            }),
            css(),
        ],
        parent: document.getElementById('code'),
    });
    window.cssEditor.dom.style.height = '400px';
};

const initOptions = async () => {
    // Need a backward compatibility check for the old options
    // Previously, we stored in the localstorage as string
    // now we are storing as object.
    // So old options saved as string needs to be re-saved as object

    await migrateOptions();

    const savedOptions = await getOptions(DB_NAME);

    // If it's a fresh installation and options is missing in DB then just save the DEFAULT_OPTIONS
    let optionsToSave = DEFAULT_OPTIONS;
    if (savedOptions) {
        // If options exists already in the DB then merge with DEFAULT_OPTIONS and save
        optionsToSave = {
            ...DEFAULT_OPTIONS,
            ...savedOptions,
        };
    }

    await saveOptions(optionsToSave);

    document.getElementById('theme').value = optionsToSave?.theme;

    if (optionsToSave.collapsed == 1) {
        document.getElementById('collapsed').setAttribute('checked', 'checked');
    } else {
        document.getElementById('collapsed').checked = false;
    }

    initCodeMirror(optionsToSave.css || DEFAULT_OPTIONS.css);

    document.getElementById('save-options').addEventListener(
        'click',
        async (e) => {
            try {
                e.preventDefault();
                const newOption = DEFAULT_OPTIONS;
                const theme = document.getElementById('theme').value;
                if (theme) {
                    newOption.theme = theme;
                }
                newOption.css = window.cssEditor.state.doc.toString().trim();
                newOption.collapsed = document.getElementById('collapsed')
                    .checked
                    ? 1
                    : 0;
                await saveOptions(newOption);
                await sendMessage('settings_updated');
                notify('Changes have been saved');
            } catch (error) {}
        },
        false,
    );

    document.getElementById('reset-options').addEventListener(
        'click',
        async (e) => {
            try {
                e.preventDefault();
                await saveOptions(DEFAULT_OPTIONS);
                await sendMessage('settings_updated');
                document.getElementById('theme').value = DEFAULT_OPTIONS.theme;
                initCodeMirror();
                document.getElementById('collapsed').checked = false;
                notify('Default settings have been saved', 'info', 2000);
            } catch (error) {}
        },
        false,
    );
};

var listner = {
    activateTab: (event) => {
        var url = event.currentTarget.href;
        var tabView = url.substring(url.indexOf('#') + 1);
        var allTabs = document.querySelectorAll(`[data-tab-view]`);
        if (allTabs && allTabs.length) {
            Array.from(allTabs).forEach((item) => {
                if (item.classList && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
                item.classList.add('hidden');
            });
        }
        var active = document.querySelector(`[data-tab-view="${tabView}"]`);
        if (active) {
            active.classList.remove('hidden');
            active.classList.add('active');
        }
    },
};

function emptyNode(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

async function updateURLView(urls) {
    const extensionOptions = await getOptions(DB_NAME);
    const urlItems = urls || extensionOptions?.filteredURL;
    if (urlItems) {
        var urlItemsContainer = document.querySelector(
            selectors.urlItemsContainer,
        );
        emptyNode(urlItemsContainer);
        var nodeStr = '';
        urlItems.forEach((url) => {
            var urlItem = '<div class="url-items">';
            urlItem += '<div class="url-item">';
            urlItem += '<div class="url m10">';
            urlItem +=
                '<img class="icon sm" src="/images/icons/seo-and-web.png" alt="">';
            urlItem += '<a href="' + url + '"  target="_blank">' + url + '</a>';
            urlItem += '</div>';
            urlItem += '<div class="action-menu m2">';
            urlItem +=
                '<a href="#" class="btn btn-sm url-delete danger" data-url="' +
                url +
                '">Delete</a>';
            urlItem += '</div>';
            urlItem += '</div>';

            nodeStr += urlItem;
        });
        urlItemsContainer.innerHTML = nodeStr;
        initializeURLDeleteEventListner();
        document
            .querySelector(selectors.noURLMessage)
            .classList.toggle('hidden', urlItems.length > 0);
    }
}

function initilizeTab() {
    var tabActionButtons = document.querySelectorAll(selectors.tabActionButton);
    if (tabActionButtons) {
        Array.from(tabActionButtons).forEach((button) => {
            button.addEventListener('click', listner.activateTab);
        });
    }
}

function intializeURLInput() {
    document
        .querySelector(selectors.urlSaveBtn)
        .addEventListener('click', async () => {
            var url = document.querySelector(selectors.urlInput).value;
            var urlPattern =
                /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(:[0-9]{1,5})?(\/.*)?$/;
            if (url && urlPattern.test(url)) {
                url = url.trim();
                var options = await getOptions(DB_NAME);
                if (options) {
                    if (options.filteredURL) {
                        options.filteredURL.push(url);
                    } else {
                        options.filteredURL = [url];
                    }
                    try {
                        await saveOptions(options);
                        document.querySelector(selectors.urlInput).value = '';
                        await updateURLView(options.filteredURL);
                        await sendMessage('settings_updated');
                        notify(
                            'URL has been saved in filtered list',
                            'success',
                            2000,
                        );
                    } catch (error) {}
                }
            } else {
                notify('Please enter a valid URL', 'error', 2000);
            }
        });
}

async function deleteURL(event) {
    event.preventDefault();
    var deletableURL = event.currentTarget.getAttribute('data-url');
    var options = await getOptions(DB_NAME);
    var filteredURL = (options || {}).filteredURL;
    options.filteredURL = filteredURL.filter(function (url) {
        return url !== deletableURL;
    });

    await saveOptions(options);
    await updateURLView(options.filteredURL);
    await sendMessage('settings_updated');
}

function initializeURLDeleteEventListner() {
    Array.from(document.querySelectorAll(selectors.urlDelete)).forEach(
        (element) => {
            element.addEventListener('click', deleteURL);
        },
    );
}

function initEventListener() {
    initilizeTab();
    intializeURLInput();
    initializeURLDeleteEventListner();
}

(async () => {
    await initOptions();
})();

document.body.onload = async function () {
    await updateURLView();
    initEventListener();
};
