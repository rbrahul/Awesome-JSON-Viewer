const options = {
    theme: 'default',
    collapsed: true,
    css: `\/*You may write your own css here *\/
body {

}`,

};
const dbName = 'rb-awesome-json-viewer-options';

const saveOptions = (value) => {
    const data = JSON.stringify(value);
    try {
        localStorage.setItem(dbName, data);
    } catch (e) {
        console.error('Your browser support localStorage', e.message);
    }
};

const getOptions = (key) => {
    try {
        const data = localStorage.getItem(key);
        return JSON.parse(data);
    } catch (e) {
        console.error('Your browser doesn\'t support localStorage', e.message);
    }
    return null;
};

const initCodeMirror = () => {
    window.cssEditor = CodeMirror.fromTextArea(document.getElementById('code'), {
        lineNumbers: true,
        mode: 'css',
        extraKeys: { "Ctrl-Space": "autocomplete" },
        theme: 'dracula'
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
    document.getElementById('theme').value = savedOptions.theme;
    window.cssEditor.setValue(savedOptions.css);
    if (savedOptions.collapsed) {
        document.getElementById('collapsed').setAttribute('checked', 'checked');
    } else {
        document.getElementById('collapsed').removeAttribute('checked');
    }


    document.getElementById('save-options').addEventListener('click', (e) => {
        e.preventDefault();
        const newOption = {
            theme: 'default'
        };
        const theme = document.getElementById('theme').value;
        if (theme) {
            newOption.theme = theme;
        }
        newOption.css = window.cssEditor.getValue();
        newOption.collapsed = document.getElementById('collapsed').checked;
        saveOptions(newOption);
        alert('Changes have been saved');
    }, false);

    document.getElementById('reset-options').addEventListener('click', (e) => {
        e.preventDefault();
        saveOptions(options);
        document.getElementById('theme').value = options.theme;
        document.getElementById('code').value = options.css;
        document.getElementById('collapsed').setAttribute('checked', 'checked');
        alert('Changes have been saved');
    }, false);
};

initOptions();