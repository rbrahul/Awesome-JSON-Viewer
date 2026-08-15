/* On extension pages contentscript is not getting executed, for example: chrome-extension:// protocol pages.
 ** So we are using appscript.js to act as contentscript for these pages. And we receive messages from Background script or options page and
 ** send it to main.jsx which is the main script for extension pages. It's only a UI layer that does not rely on any extension APIs.
 */

const messageReceiver = () => {
    chrome.runtime.onMessage.addListener((message) => {
        let customEvent;

        switch (message.action) {
            case 'options_received':
                customEvent = new CustomEvent(
                    'rb_json_viewer_pro_appscript_options_received',
                    { detail: message.options },
                );
                window.dispatchEvent(customEvent);
                break;

            case 'settings_updated':
                customEvent = new CustomEvent(
                    'rb_json_viewer_pro_appscript_options_updated',
                    { detail: message.options },
                );
                window.dispatchEvent(customEvent);
                break;

            default:
                break;
        }
    });
};


(() => {
    if (!chrome || !chrome.runtime || !chrome.runtime.onMessage) {
        console.log(
            'chrome.runtime.onMessage is not available. This script should only run in the context of a Chrome extension page.',
        );
        return;
    }

    messageReceiver();

    // alternative to DOMContentLoaded event
    document.onreadystatechange = function () {
        if (document.readyState === 'interactive') {
            chrome.runtime.sendMessage({ action: 'give_me_options' });
        }
    };
})();
