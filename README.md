# JSON Viewer Pro (Completely Free)

A browser extension to visualize JSON response in awesome Tree and Chart view with great user experience and options.

# Welcome to the JSON Viewer Pro. It is absolutely free and has no annoying advertisements.

[![](https://raw.githubusercontent.com/rbrahul/Awesome-JSON-Viewer/master/chrome-web-store.png)](https://chrome.google.com/webstore/detail/json-viewer-pro/eifflpmocdbdmepbjaopkkhbfmdgijcc)

## Features

-   ✅ Beautify JSON response from API
-   ✅ Visual representation of JSON
-   ✅ Depth traversing of JSON property using breadcrumbs
-   ✅ Write custom JSON in Input area
-   ✅ Access JSON response via Path navigation prompt with Auto-completion
-   ✅ Import local JSON file
-   ✅ Download JSON file using Context Menu
-   ✅ URL black listing to ignore on certain websites
-   ✅ Change Themes
-   ✅ Custom CSS
-   ✅ Cool User Interface.
-   ✅ Copy property and value
-   ✅ Access JSON in your console using only `json` keyword

## Screen Shots

![Awesome JSON](https://raw.githubusercontent.com/rbrahul/Awesome-JSON/master/awesome-json-slideshow.gif 'Awesome JSON an awesome Chrome extension to assist development')

# Your donation is appreciated

### Your small contribution inspires us.

[![](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=VQLQGCRJAAF3L)

## Online JSON viewer(without any installation needed):

[Awesome JSON View Online Editor with very limited features](https://rbrahul.github.io/Awesome-JSON-Viewer/# 'Awesome JSON Viewer')

## Change Log:

### Version 1.0.0 on 04-10-2020

**New Feature**

-   All the essential features of JSON Viewer

### Version 1.0.1 on 20-10-2021

**New Feature**

-   Added ContentType application/json detection before initialising JSON Viewer Pro extension to webpage.

**Bug Fix**

-   Fixed bug for NextJS framework implemented sites and Twitter Cards.
-   Added support for _localhost (http://localhost:port)_ sites blocking in Manage URL settings.

### Version 1.0.2 on 27-03-2024

**Improvements:**

-   Upgraded to Manifest v3
-   Fixed the issue with missing gear icon.
-   Fixed issue with the reloading all tabs when settings are saved or set to default.
-   Collapse nested items settings was not working once the extension was opened via clicking on the extension icon.
-   Minor UI improvements in Toast Message and Buttons on the Setting page.

### Version 1.0.3 on 31-03-2024

**Bug Fixes:**

-   JSON Viewer Pro doesn't recognize local JSON files once opened via browser.

### Version 1.0.4 on 28-03-2025

**New Features**

-   New Improved UI and Theme
-   Faster JSON Tree and Chart Rendering
-   Besides JSON, YAML and XML file can be imported inside editor and Parse as JSON
-   Access JSON via path navigation prompt with auto-completion support
-   Improved JSON Editor
-   Custom font-size can be configured. (To have this "Restore Default" needs to be clicked at least once to get the updated default custom-css. And change the font-size you prefer).

**Bug Fixes:**

-   Any Number greater than Number.MAX_SAFE_INTEGER was rendered as wrong value
-   Sometimes Chart disappears while clicking on the nodes
-   Flickering effect in the JSON Tree view once auto-collapsed is turned on
-   Settings and Custom CSS were not applied properly.

### Version 1.0.5 on 31-03-2025

**Bug Fixes:**

- Sometimes the JSON tree collapse icon was not working after clicking
- JSON Chart sometimes goes outside the visible area
- First few lines in JSON Tree view were getting covered by the Menu for longer texts.
- Menu Icons were turned into black for the very first installation as the default settings were not properly applied.



**Note:**
Besides these above mentioned points, there were lot of improvements made in the build process and development practices. I have mroe plans to improve the code quality and the performance of the application rendering in upcoming days.

Enjoy the JSON Viewer Pro.

**Developed with ♥ using ReactJS and D3**
