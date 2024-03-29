const options = {
    theme: 'default',
    collapsed: 0,
    css: `/**Write your CSS style **/
  .property{
      /*color:#994c9e;*/
   }

  .json-literal-numeric{
      /*color:#F5B041;*/
   }

   .json-literal-url {
      /*color: #34a632;*/
   }

   .json-literal-string{
      /*color:#0642b0;*/
   }

   .json-literal{
      /*color:#b568de;*/
   }

   .json-literal-boolean{
      /*color: #f23ebb;*/
   }`,
};

var selectors = {
    tabActionButton: '.tab-action-btn',
    urlInput: '#url',
    urlSaveBtn: '#url-save-btn',
    urlItemsContainer: '.url-items',
    noURLMessage: '.no-urls-msg',
    urlDelete: '.url-delete',
    tostMessage: '.tost-message',
};

const dbName = 'rb-awesome-json-viewer-options';

async function sendMessage(action, message) {
    const messageObj = {
        action: action,
    };

    if (message) {
        messageObj.data = message;
    }

    const tabs = await chrome.tabs.query({});
    tabs.forEach(async (tab) => {
        try {
            await chrome.tabs.sendMessage(tab.id, messageObj);
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
            [dbName]: value
        });
    } catch (e) {
        console.error("chrome storage api error:", e);
    }
};

const migrateOptions = async () => {
    try {
        const data = await chrome.storage.local.get([dbName]);
        const existingData = data[dbName];
        if (existingData && typeof existingData === 'string') {
            try {
                const parsedData = JSON.parse(existingData);
                if (parsedData && Object.keys(parsedData).length > 0) {
                    await saveOptions(parsedData);
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

const initCodeMirror = () => {
    window.cssEditor = CodeMirror.fromTextArea(
        document.getElementById('code'),
        {
            lineNumbers: true,
            mode: 'css',
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            theme: 'dracula',
        },
    );
};

const initOptions = async () => {
    if (!window.cssEditor) {
        initCodeMirror();
    }

    // Need a backward compatibility check for the old options
    // Previous we stored in the localstorage as string
    // now we are storing as object.
    // So old options saved as string object needs to be re-saved as object

    await migrateOptions()

    const currentOptions = await getOptions(dbName);

    if (!currentOptions) {
        await saveOptions(options);
    }

    const savedOptions = await getOptions(dbName);
    document.getElementById('theme').value = savedOptions.theme;
    window.cssEditor.setValue(savedOptions.css);
    if (savedOptions.collapsed == 1) {
        document.getElementById('collapsed').setAttribute('checked', 'checked');
    } else {
        document.getElementById('collapsed').checked = false;
    }

    document.getElementById('save-options').addEventListener(
        'click',
        async (e) => {
            e.preventDefault();
            const newOption = {
                theme: 'default',
            };
            const theme = document.getElementById('theme').value;
            if (theme) {
                newOption.theme = theme;
            }
            newOption.css = window.cssEditor.getValue();
            newOption.collapsed = document.getElementById('collapsed').checked ? 1 : 0;
            await saveOptions(newOption);
            await sendMessage('settings_updated');
            notify('Changes have been saved');
        },
        false,
    );

    document.getElementById('reset-options').addEventListener(
        'click',
        async (e) => {
            e.preventDefault();
            await saveOptions(options);
            await sendMessage('settings_updated');
            document.getElementById('theme').value = options.theme;
            document.getElementById('code').value = options.css;
            window.cssEditor.setValue(options.css);
            document.getElementById('collapsed').checked = false;
            notify('Default settings have been saved', 'info', 2000);
        },
        false,
    );
};

var listner = {
    activateTab: function (event) {
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
    const extensionOptions = await getOptions(dbName);
    const urlItems = urls || (extensionOptions || {}).filteredURL;
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
            var urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(:[0-9]{1,5})?(\/.*)?$/;
            if (url && urlPattern.test(url)) {
                url = url.trim();
                var options = await getOptions(dbName);
                if (options) {
                    if (options.filteredURL) {
                        options.filteredURL.push(url);
                    } else {
                        options.filteredURL = [url];
                    }
                    await saveOptions(options);
                    document.querySelector(selectors.urlInput).value = '';
                    await updateURLView(options.filteredURL);
                    await sendMessage('settings_updated');
                    notify(
                        'URL has been saved in filtered list',
                        'success',
                        2000,
                    );
                }
            } else {
                notify('Please enter a valid URL', 'error', 2000);
            }
        });
}

async function deleteURL(event) {
    event.preventDefault();
    var deletableURL = event.currentTarget.getAttribute('data-url');
    var options = await getOptions(dbName);
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
    await updateURLView()
    initEventListener();
};
