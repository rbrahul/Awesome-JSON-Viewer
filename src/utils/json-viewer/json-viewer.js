/**
 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
 * @return boolean
 */
function isCollapsable(arg) {
    return arg instanceof Object && Object.keys(arg).length > 0;
}

/**
 * Check if a string represents a valid url
 * @return boolean
 */
function isUrl(string) {
    var regexp =
        /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(string);
}

const getJsonToggleClassNames = (isCollapsed) => {
    let classNames = 'json-toggle';
    return isCollapsed ? classNames + ' collapsed' : classNames;
};

const getToggleStyle = (isCollapsed) => {
    return isCollapsed ? 'style="display:none;"' : '';
};

const createPlaceHolderNode = (isCollapsed, count) => {
    return isCollapsed && count > 0
        ? `<a href class="json-placeholder">${count} item${
              count > 1 ? 's' : ''
          }</a>`
        : '';
};

/**
 * Transform a json object into html representation
 * @return string
 */
function json2html(json, options, nestedLevel = []) {
    var html = '';
    const isCollapsed = options.collapsed && nestedLevel.length > 0;
    if (typeof json === 'string') {
        // Escape tags
        json = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        if (isUrl(json))
            html +=
                '<a href="' +
                json +
                '" class="json-literal-url">"' +
                json +
                '"</a>';
        else html += '<span class="json-literal-string">"' + json + '"</span>';
    } else if (typeof json === 'number') {
        html += '<span class="json-literal-numeric">' + json + '</span>';
    } else if (typeof json === 'boolean') {
        html += '<span class="json-literal-boolean">' + json + '</span>';
    } else if (json === null) {
        html += '<span class="json-literal">null</span>';
    } else if (json instanceof Array) {
        if (json.length > 0) {
            html += `[<ol class="json-array" ${getToggleStyle(isCollapsed)}>`;
            for (var i = 0; i < json.length; ++i) {
                html += '<li>';
                // Add toggle button if item is collapsable
                if (isCollapsable(json[i])) {
                    html += `<a href class="${getJsonToggleClassNames(
                        options.collapsed,
                    )}"></a>`;
                }
                nestedLevel.push(1);
                html += json2html(json[i], options, nestedLevel);
                // Add comma if item is not last
                if (i < json.length - 1) {
                    html += ',';
                }
                html += '</li>';
            }
            html += `</ol>${createPlaceHolderNode(isCollapsed, json.length)}]`;
        } else {
            html += '[]';
        }
    } else if (typeof json === 'object') {
        var key_count = Object.keys(json).length;
        if (key_count > 0) {
            html += `{<ul class="json-dict" ${getToggleStyle(isCollapsed)}>`;
            for (var key in json) {
                if (json.hasOwnProperty(key)) {
                    html += '<li>';
                    var keyRepr = options.withQuotes
                        ? '<span class="property">"' + key + '"</span>'
                        : key;
                    // Add toggle button if item is collapsable
                    if (isCollapsable(json[key])) {
                        html +=
                            `<a href class="${getJsonToggleClassNames(
                                options.collapsed,
                            )}">` +
                            keyRepr +
                            '</a>';
                    } else {
                        html += keyRepr;
                    }
                    nestedLevel.push(1);
                    html += ': ' + json2html(json[key], options, nestedLevel);
                    // Add comma if item is not last
                    if (--key_count > 0) html += ',';
                    html += '</li>';
                }
            }
            html += `</ul>${createPlaceHolderNode(
                isCollapsed,
                Object.keys(json).length,
            )}}`;
        } else {
            html += '{}';
        }
    }
    return html;
}

/**
 * jQuery plugin method
 * @param json: a javascript object
 * @param options: an optional options hash
 */
export const initPlugin = function (node, jQuery, json, option) {
    (function ($, node, json, options) {
        options = options || { collapsed: false };
        // jQuery chaining
        return $(node).each(function () {
            // Transform to HTML
            var html = json2html(json, options, []);
            if (isCollapsable(json))
                html = `<a href class="json-toggle"></a>` + html;

            // Insert HTML in target DOM element
            $(this).html(html);

            // Bind click on toggle buttons
            $(this).off('click');
            $(this).on('click', 'span.property', function (e) {
                $('li').removeClass('copyable');
                $(this).parents('li').first().addClass('copyable');
            });

            // Simulate click on toggle button when placeholder is clicked
            $(this).on('click', 'a.json-placeholder', function () {
                $(this).siblings('a.json-toggle').click();
                return false;
            });
        });
    })(jQuery, node, json, option);
};
