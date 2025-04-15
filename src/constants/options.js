export const DETECTION_METHOD_CONTENT_TYPE = 'contentType';
export const DETECTION_METHOD_JSON_CONTENT = 'jsonContent';

export const DEFAULT_SELECTED_CONTENT_TYPES = [
    'application/json',
    'text/json',
    'application/javascript',
];

export const DEFAULT_OPTIONS = {
    theme: 'default',
    collapsed: 0,
    css: `
/**Write your CSS style **/
#json-viewer {
    font-size: 15px;
}

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
    jsonDetection: {
        method: DETECTION_METHOD_CONTENT_TYPE, // contentType | jsonContent
        selectedContentTypes: DEFAULT_SELECTED_CONTENT_TYPES,
    },
};

export const DARK_THEMES = ['default', 'dark-pro'];
