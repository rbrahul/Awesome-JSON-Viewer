const options = {
  theme: "default",
  collapsed: true,
  css: `\/*You may write your own css here *\/
body {

}`,
};

var selectors = {
  tabActionButton: ".tab-action-btn",
  urlInput: "#url",
  urlSaveBtn: "#url-save-btn",
  urlItemsContainer: ".url-items",
  noURLMessage: ".no-urls-msg",
  urlDelete: ".url-delete",
  tostMessage: '.tost-message'
};

const dbName = "rb-awesome-json-viewer-options";


function notify(message, type, duration) {
    var messageType = type || 'success';
    var maxVisibleTime = duration || 3000;
    var tostMessageElement = document.querySelector(selectors.tostMessage);
    ['success', 'error', 'info', 'warning'].forEach((className) => {
        tostMessageElement.classList.remove(className);
    });
    tostMessageElement.querySelector('p.text').textContent = message;
    tostMessageElement.classList.add(messageType, 'active');

    setTimeout(() => {
        tostMessageElement.classList.remove('active');
    }, maxVisibleTime);
}

const saveOptions = (value) => {
  const data = JSON.stringify(value);
  try {
    localStorage.setItem(dbName, data);
  } catch (e) {
    console.error("Your browser support localStorage", e.message);
  }
};

const getOptions = (key) => {
  try {
    const data = localStorage.getItem(key);
    return JSON.parse(data);
  } catch (e) {
    console.error("Your browser doesn't support localStorage", e.message);
  }
  return null;
};

const initCodeMirror = () => {
  window.cssEditor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: "css",
    extraKeys: { "Ctrl-Space": "autocomplete" },
    theme: "dracula",
  });
};

const initOptions = () => {
  if (!window.cssEditor) {
    initCodeMirror();
  }
  if (!getOptions(dbName)) {
    saveOptions(options);
  }

  const savedOptions = getOptions(dbName);
  document.getElementById("theme").value = savedOptions.theme;
  window.cssEditor.setValue(savedOptions.css);
  if (savedOptions.collapsed) {
    document.getElementById("collapsed").setAttribute("checked", "checked");
  } else {
    document.getElementById("collapsed").removeAttribute("checked");
  }

  document.getElementById("save-options").addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      const newOption = {
        theme: "default",
      };
      const theme = document.getElementById("theme").value;
      if (theme) {
        newOption.theme = theme;
      }
      newOption.css = window.cssEditor.getValue();
      newOption.collapsed = document.getElementById("collapsed").checked;
      saveOptions(newOption);
      notify("Changes have been saved");
    },
    false
  );

  document.getElementById("reset-options").addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      saveOptions(options);
      document.getElementById("theme").value = options.theme;
      document.getElementById("code").value = options.css;
      document.getElementById("collapsed").setAttribute("checked", "checked");
      notify("Default settings have been saved","info", 2000);
    },
    false
  );
};

var listner = {
  activateTab: function (event) {
    var url = event.currentTarget.href;
    var tabView = url.substring(url.indexOf("#") + 1);
    var allTabs = document.querySelectorAll(`[data-tab-view]`);
    if (allTabs && allTabs.length) {
      Array.from(allTabs).forEach((item) => {
        if (item.classList && item.classList.contains("active")) {
          item.classList.remove("active");
        }
        item.classList.add("hidden");
      });
    }
    var active = document.querySelector(`[data-tab-view="${tabView}"]`);
    if (active) {
      active.classList.remove("hidden");
      active.classList.add("active");
    }
  },
};

function emptyNode(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function updateURLView(urls) {
  var urlItems = urls || (getOptions(dbName) || {}).filteredURL;
  if (urlItems) {
    var urlItemsContainer = document.querySelector(selectors.urlItemsContainer);
    emptyNode(urlItemsContainer);
    var nodeStr = "";
    urlItems.forEach((url) => {
      var urlItem = '<div class="url-items">';
      urlItem += '<div class="url-item">';
      urlItem += '<div class="url m10">';
      urlItem +=
        '<img class="icon sm" src="/images/icons/seo-and-web.png" alt="">';
      urlItem += '<a href="' + url + '"  target="_blank">' + url + "</a>";
      urlItem += "</div>";
      urlItem += '<div class="action-menu m2">';
      urlItem +=
        '<a href="#" class="btn btn-sm url-delete danger" onClick="deleteURL(\'' + url + '\')">Delete</a>';
      urlItem += "</div>";
      urlItem += "</div>";

      nodeStr += urlItem;
    });
    urlItemsContainer.innerHTML = nodeStr;
    document
      .querySelector(selectors.noURLMessage)
      .classList.toggle("hidden", urlItems.length > 0);
  }
}

function initilizeTab() {
  var tabActionButtons = document.querySelectorAll(selectors.tabActionButton);
  if (tabActionButtons) {
    Array.from(tabActionButtons).forEach((button) => {
      button.addEventListener("click", listner.activateTab);
    });
  }
}

function intializeURLInput() {
  document.querySelector(selectors.urlSaveBtn).addEventListener("click", () => {
    var url = document.querySelector(selectors.urlInput).value;
    var urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
    if (url && urlPattern.test(url)) {
      url = url.trim();
      var options = getOptions(dbName);
      if (options) {
        if (options.filteredURL) {
          options.filteredURL.push(url);
        } else {
          options.filteredURL = [url];
        }
        saveOptions(options);
        document.querySelector(selectors.urlInput).value = "";
        updateURLView(options.filteredURL);
        notify("URL has been saved in filtered list","success", 2000);
      }
    } else {
        notify("Please enter a valid URL","error", 2000);
    }
  });
}


function deleteURL(deletableURL) {
    var options = getOptions(dbName);
    var filteredURL = (options || {}).filteredURL;
    options.filteredURL = filteredURL.filter(function (url) {
      return url !== deletableURL;
    });


    saveOptions(options);
    updateURLView(options.filteredURL);
  }

function initializeURLDeleteEventListner() {
  Array.from(document.querySelectorAll(selectors.urlDelete)).forEach(
    (element) => {
      element.addEventListener("click", deleteURL);
    }
  );
}



function initEventListener() {
  initilizeTab();
  updateURLView();
  intializeURLInput();
  //initializeURLDeleteEventListner();
}

initOptions();

document.body.onload = function () {
  initEventListener();
};
