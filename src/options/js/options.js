import { basicSetup, EditorView } from 'codemirror';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import { css } from '@codemirror/lang-css';

import {
    DEFAULT_OPTIONS,
    DEFAULT_SELECTED_CONTENT_TYPES,
    DETECTION_METHOD_CONTENT_TYPE,
} from '../../constants/options';
import Switch from '../../vendor/switch/switch';

var selectors = {
    tabActionButton: '.tab-action-btn',
    urlInput: '#url',
    urlSaveBtn: '#url-save-btn',
    urlItemsContainer: '.url-items',
    noURLMessage: '.no-urls-msg',
    urlDelete: '.url-delete',
    tostMessage: '.tost-message',
    detectionOptionTile: '.detection-option-tile',
    contentTypeOptionsSwitch: '.switch',
    selectAllContentTypeSwitch: '.select-all-options',
    saveContentDetectionBtn: '.save-json-detection',
    resetContentDetectionBtn: '.reset-json-detection',
    jsonDetectionSettingsForm: '#json-detection-settings-form',
    contentTypeCheckboxGroup: '.contenttypes-checkbox-group',
};

const DB_NAME = 'rb-awesome-json-viewer-options';

async function sendMessage(action, message) {
    const messageObj = {
        action: action,
    };

    if (message) {
        messageObj.options = message;
    }

    const tabs = await chrome.tabs.query({ active: false });
    tabs.forEach(async (tab) => {
        try {
            if (tab.url) {
                await chrome.tabs.sendMessage(tab.id, messageObj);
            } else {
                chrome.tabs.remove(tab.id);
            }
        } catch (error) {}
    });
}

function notify(message, messageType = 'success', duration = 3000) {
    var tostMessageElement = document.querySelector(selectors.tostMessage);
    ['success', 'error', 'info', 'warning'].forEach((className) => {
        tostMessageElement.classList.remove(className);
    });
    tostMessageElement.querySelector('.text').textContent = message;
    tostMessageElement.classList.add(messageType, 'active');

    setTimeout(() => {
        tostMessageElement.classList.remove('active');
    }, duration);
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

    new Switch({
        selector: '.collapsed-switch',
    });

    const collapsedSwitch = document.getElementById('collapsed');

    if (optionsToSave.collapsed == 1) {
        collapsedSwitch.checked = true;
        collapsedSwitch.setAttribute('checked', 'checked');
        collapsedSwitch.dispatchEvent(new CustomEvent('change'));
    } else {
        collapsedSwitch.checked = false;
        collapsedSwitch.removeAttribute('checked');
        collapsedSwitch.dispatchEvent(new CustomEvent('change'));
    }

    initCodeMirror(optionsToSave.css || DEFAULT_OPTIONS.css);

    document.getElementById('save-options').addEventListener(
        'click',
        async (e) => {
            try {
                e.preventDefault();
                let newOption = { ...DEFAULT_OPTIONS };
                const extensionOptions = (await getOptions(DB_NAME)) || {};
                newOption = {
                    ...newOption,
                    ...extensionOptions,
                };
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
                await sendMessage('settings_updated', newOption);
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
                document.getElementById('theme').value = DEFAULT_OPTIONS.theme;
                document.getElementById('collapsed').checked = false;
                initCodeMirror();
                sendMessage('settings_updated', DEFAULT_OPTIONS);
                notify('Default settings restored', 'info', 2000);
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
                '<a href="#" class="btn btn-sm danger url-delete" data-url="' +
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
                        await sendMessage('settings_updated', options);
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
    await sendMessage('settings_updated', options);
}

function initializeURLDeleteEventListner() {
    Array.from(document.querySelectorAll(selectors.urlDelete)).forEach(
        (element) => {
            element.addEventListener('click', deleteURL);
        },
    );
}

const getAllConentTypeOptionCards = () =>
    document.querySelectorAll(selectors.detectionOptionTile);

const onContentTypeOptionCardClick = (e) => {
    document
        .querySelectorAll(`input[name="detectionmethod"]`)
        .forEach((item) => {
            item.checked = false;
            item.removeAttribute('checked');
        });
    const targetedOption = e.currentTarget.querySelector('input[type="radio"]');
    targetedOption.checked = true;
    targetedOption.setAttribute('checked', 'checked');
    targetedOption.dispatchEvent(new Event('change'));
};

function initialiseSelectAllContentTypeEventListener(contentTypeOptionSwitch) {
    const selectAllSwitch = document.querySelector(
        selectors.selectAllContentTypeSwitch,
    );
    selectAllSwitch.addEventListener('change', (e) => {
        const checked = e.currentTarget.checked;
        if (checked) {
            contentTypeOptionSwitch.checkAll();
        } else {
            contentTypeOptionSwitch.uncheckAll();
        }
    });
}

const saveContentDetectionSettings = async (e) => {
    try {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const method = data.get('detectionmethod');
        const selectedContentTypes = data.getAll('contenttypes');
        const savedOptions = (await getOptions(DB_NAME)) || {};
        const newOptions = {
            ...savedOptions,
            jsonDetection: {
                method,
                selectedContentTypes,
            },
        };
        await saveOptions(newOptions);
        await sendMessage('settings_updated', newOptions);
        notify('Settings have been saved');
    } catch (error) {
        notify('Failed to save options', 'error');
        console.log('Failed to save:', error);
    }
};

const restoreDefaultContentDetectionSettings = async (e) => {
    try {
        const savedOptions = (await getOptions(DB_NAME)) || {};
        savedOptions.jsonDetection = DEFAULT_OPTIONS.jsonDetection;
        initialiseContentDetectionForm(DEFAULT_OPTIONS);

        await saveOptions(savedOptions);
        await sendMessage('settings_updated', savedOptions);
        notify('Settings have been restored');
    } catch (error) {
        notify('Failed to restore options', 'error');
        console.log('Failed to restore content detection form:', error);
    }
};

function initialiseContentDetectionFormEventListener() {
    const form = document.querySelector(selectors.jsonDetectionSettingsForm);
    form.addEventListener('submit', saveContentDetectionSettings);
    form.addEventListener('reset', restoreDefaultContentDetectionSettings);
}

function initialiseContentTypeOptionsChangeEventListener() {
    document.querySelectorAll('input[name="contenttypes"]').forEach((item) => {
        item.addEventListener(
            'change',
            udpateSelectAllSwitchBasedOnSelectedCheckboxes,
        );
    });
}

function initialiseContentDetectionMethodRadioInputChangeEventListener() {
    const detectionMethodInputs = document.querySelectorAll(
        `input[name="detectionmethod"]`,
    );
    detectionMethodInputs.forEach((item) => {
        item.addEventListener('change', (e) => {
            detectionMethodInputs.forEach((item) => {
                if (e.currentTarget !== item) {
                    item.checked = false;
                    item.removeAttribute('checked');
                }
            });
            const selectedDetectionMethod =
                document.querySelector(`input[name="detectionmethod"]:checked`)
                    ?.value ?? DETECTION_METHOD_CONTENT_TYPE;
            onJSONDetectionInputChange(selectedDetectionMethod);
        });
    });
}

function initializeContentDetectionEventListeners(contentTypeOptionSwitch) {
    const optionTiles = getAllConentTypeOptionCards();
    optionTiles.forEach((item) => {
        item.addEventListener('click', onContentTypeOptionCardClick, false);
    });

    initialiseSelectAllContentTypeEventListener(contentTypeOptionSwitch);
    initialiseContentDetectionFormEventListener();
    initialiseContentTypeOptionsChangeEventListener();
    initialiseContentDetectionMethodRadioInputChangeEventListener();
}

const udpateSelectAllSwitchBasedOnSelectedCheckboxes = () => {
    const contentTypeSwitches = document.querySelectorAll(
        'input[name="contenttypes"]',
    );
    const allSelected = Array.from(contentTypeSwitches).every(
        (input) => !!input.checked,
    );

    const allSelectionSwitch = document.querySelector(
        selectors.selectAllContentTypeSwitch,
    );
    if (allSelected) {
        allSelectionSwitch.checked = true;
        allSelectionSwitch.setAttribute('checked', 'checked');
    } else {
        allSelectionSwitch.checked = false;
        allSelectionSwitch.removeAttribute('checked');
    }
};

const onJSONDetectionInputChange = (detectionMethod) => {
    const contentTypeCheckboxGroup = document.querySelector(
        selectors.contentTypeCheckboxGroup,
    );
    if (detectionMethod !== DETECTION_METHOD_CONTENT_TYPE) {
        if (!contentTypeCheckboxGroup.classList.contains('hidden')) {
            contentTypeCheckboxGroup.classList.add('hidden');
        }
    } else {
        if (contentTypeCheckboxGroup.classList.contains('hidden')) {
            contentTypeCheckboxGroup.classList.remove('hidden');
        }
    }
};

const initialiseContentDetectionForm = (options) => {
    // set content detection radio to checked
    const detectionMethod =
        options.jsonDetection?.method ?? DETECTION_METHOD_CONTENT_TYPE;
    const targetedOption = document.querySelector(
        `input[value="${detectionMethod}"]`,
    );
    targetedOption.checked = true;
    targetedOption.setAttribute('checked', 'checked');

    onJSONDetectionInputChange(detectionMethod);

    // reset all the content type options chekboxes
    document.querySelectorAll('input[name="contenttypes"]').forEach((item) => {
        item.checked = false;
        item.removeAttribute('checked');
    });

    // check selected content types checkboxes to checked
    const selectedContentTypes =
        options?.jsonDetection?.selectedContentTypes ||
        DEFAULT_SELECTED_CONTENT_TYPES;

    selectedContentTypes.forEach((item) => {
        const targetedOption = document.querySelector(`input[value="${item}"]`);
        if (targetedOption) {
            targetedOption.checked = true;
            targetedOption.setAttribute('checked', 'checked');
        }
    });

    // if all the content types are checked then set selectAll checkbox to checked,
    // set to unchecked otherwise
    udpateSelectAllSwitchBasedOnSelectedCheckboxes();
};

const initialiseContentDetectionOptions = async () => {
    try {
        const savedOptions = (await getOptions(DB_NAME)) || {};
        initialiseContentDetectionForm(savedOptions);
    } catch (error) {
        console.log('Error while initialising content type options', error);
    }
};

const initializeContentDetection = async () => {
    const contentTypeOptionSwitch = new Switch({
        selector: selectors.contentTypeOptionsSwitch,
    });
    new Switch({
        selector: selectors.selectAllContentTypeSwitch,
    });
    initialiseContentDetectionOptions();
    initializeContentDetectionEventListeners(contentTypeOptionSwitch);
};

function bootstrap() {
    initilizeTab();
    initializeContentDetection();
    updateURLView();
    intializeURLInput();
    initializeURLDeleteEventListner();
}

document.body.onload = async function () {
    await initOptions();
    bootstrap();
};
