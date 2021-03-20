import React, { Component } from 'react';
var $ = require('jquery');
var jQuery = $;
import { initPlugin } from './utils/json-viewer/jquery.json-viewer.js';
import './utils/json-viewer/jquery.json-viewer.css';

class TreeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            showCopier: false,
            actualPath: null,
            value: null,
            data: props.data,
        };
        this.changeCopyIconLocation = this.changeCopyIconLocation.bind(this);
        this.toggleSection = this.toggleSection.bind(this);
    }

    copy(event, type) {
        event.preventDefault();
        let context;
        if (type === 'path') {
            context = this.state.actualPath;
        } else {
            context = this.state.value;
        }
        let selElement, selRange, selection;
        selElement = document.createElement("span");
        selRange = document.createRange();
        selElement.innerText = context;
        document.body.appendChild(selElement);
        selRange.selectNodeContents(selElement);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selRange);
        document.execCommand("Copy");
        document.body.removeChild(selElement);
    }

    changeCopyIconLocation(e) {
        const self = this;
        this.findPath(self, e);
        self.setState({
            top: $(e.target).offset().top,
            showCopier: true
        });
        return false;
    }

    getArrayIndex(path) {
        const arrayIndexBracketStartAt = path.lastIndexOf("[");
        const arrayIndexBracketEndAt = path.lastIndexOf("]");
        if (arrayIndexBracketStartAt > -1) {
            return path.substring(arrayIndexBracketStartAt + 1, arrayIndexBracketEndAt);
        }
        return path;
    }

    createValidPath(pathArray) {
        let path = '';
        pathArray.forEach((item, index) => {
            if (index === 0) {
                path = path.concat(item);
            } else {
                if (item.indexOf('-') > -1) {
                    path = `${path}['${item}']`
                } else if (isNaN(item) === false) {
                    path = `${path}[${item}]`
                } else {
                    path = path.concat('.').concat(item);
                }
            }
        });
        return path;
    }

    findPath(self, e) {
        var keys = [];
        //   e.preventDefault();
        let keyValueString = $(e.target).parents("li").first().text();
        let firstIndexOfColone = keyValueString.indexOf(':');
        let value = keyValueString.substring(firstIndexOfColone + 1);
        let nodes = $(e.target).parentsUntil("#json-rb");
        $(nodes).each(function (i, node) {

            if ($(node).get(0).tagName == "LI" && $(node).parent()[0].tagName == "UL") {
                let parentKey = $(node).find("span.property").eq(0).text();
                keys.push(self.getArrayIndex(parentKey.replace(/\"+/g, '')));
            }

            if ($(node).get(0).tagName == "LI" && $(node).parent()[0].tagName == "OL") {
                var parentKey = $(node).parent("OL").parent("li").find("span.property").eq(0).text() + '[' + $(node).index() + ']';
                keys.push(self.getArrayIndex(parentKey.replace(/\"+/g, '')));
            }

        });

        if (value[value.length - 1] === ',') {
            value = value.substring(0, value.length - 1);
        }
        self.setState({
            'actualPath': self.createValidPath(keys.reverse()),
            value
        });
    }

    toggleSection(e) {
        e.preventDefault();
        var target = $(e.target).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
        target.toggle();
        if (target.is(':visible')) {
            target.siblings('.json-placeholder').remove();
        }
        else {
            var count = target.children('li').length;
            var placeholder = count + (count > 1 ? ' items' : ' item');
            target.after('<a href class="json-placeholder">' + placeholder + '</a>');
        }
    }

    componentDidMount() {
        window.json = this.props.data;
        this.$node = $(this.refs.jsonRenderer);

        if ($) {
            const pluginOptions = {
                collapsed: 0,
                withQuotes: true
            };
            initPlugin(this.$node, $, this.props.data, pluginOptions);
            $(document).on("click", "span.property", this.changeCopyIconLocation);
            $(document).on("click", "a.json-toggle", this.toggleSection);

          setTimeout(() => {
                if ((window.extensionOptions || {}).collapsed == 1) {
                $.each($('a.json-toggle'), function (index, item) {
                    if (index > 0) {
                        $(item).trigger('click');
                    }
                });
            }
          }, 1000);
        }
    }

    componentWillUnmount() {
        $(document).off("click", "span.property", this.changeCopyIconLocation);
        $(document).off("click", "a.json-toggle", this.toggleSection);
    }

    render() {
        window.json = this.props.data;
        return (
            <div>
                <a className="copier" style={{ top: this.state.top, display: this.state.showCopier ? 'block' : 'none' }}>
                    <ul className="copyMenu">
                        <li><a onClick={this.copy.bind(this, event, 'path')}>Copy path</a></li>
                        <li><a onClick={this.copy.bind(this, event, 'value')}>Copy Value</a></li>
                    </ul>
                </a>
                <pre ref="jsonRenderer" id="json-rb">
                </pre>
            </div>
        );
    }
}

export default TreeView;
