import React, { Component, createRef } from 'react';
import $ from 'jquery';
var jQuery = $;
import { initPlugin } from './utils/json-viewer/json-viewer.js';
import { iconFillColor } from './utils/common';
import SearchBar from './components/Searchbar';
import CopyIcon from './components/Icons/Copy';

import './utils/json-viewer/json-viewer.css';

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
        this.jsonRenderer = createRef();
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
        selElement = document.createElement('span');
        selRange = document.createRange();
        selElement.innerText = context;
        document.body.appendChild(selElement);
        selRange.selectNodeContents(selElement);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selRange);
        document.execCommand('Copy');
        document.body.removeChild(selElement);
    }

    changeCopyIconLocation(e) {
        const self = this;
        this.findPath(self, e);
        self.setState({
            top: $(e.target).offset().top,
            showCopier: true,
        });
        return false;
    }

    getArrayIndex(path) {
        const arrayIndexBracketStartAt = path.lastIndexOf('[');
        const arrayIndexBracketEndAt = path.lastIndexOf(']');
        if (arrayIndexBracketStartAt > -1) {
            return path.substring(
                arrayIndexBracketStartAt + 1,
                arrayIndexBracketEndAt,
            );
        }
        return path;
    }

    createValidPath(pathArray) {
        let path = '';
        pathArray.forEach((item, index) => {
            if (index === 0) {
                path = path.concat(item);
            } else {
                if (item.indexOf('-') > -1 || item.indexOf(' ') > -1) {
                    path = `${path}['${item}']`;
                } else if (isNaN(item) === false) {
                    path = `${path}[${item}]`;
                } else {
                    path = path.concat('.').concat(item);
                }
            }
        });
        return path;
    }

    findPath(self, e) {
        let keys = [];
        let keyValueString = $(e.target).parents('li').first().text();
        let firstIndexOfColone = keyValueString.indexOf(':');
        let value = keyValueString.substring(firstIndexOfColone + 1);
        let nodes = $(e.target).parentsUntil('#json-viewer');
        $(nodes).each(function (i, node) {
            if (
                $(node).get(0).tagName == 'LI' &&
                $(node).parent()[0].tagName == 'UL'
            ) {
                let parentKey = $(node).find('span.property').eq(0).text();
                keys.push(self.getArrayIndex(parentKey.replace(/\"+/g, '')));
            }

            if (
                $(node).get(0).tagName == 'LI' &&
                $(node).parent()[0].tagName == 'OL'
            ) {
                var parentKey =
                    $(node)
                        .parent('OL')
                        .parent('li')
                        .find('span.property')
                        .eq(0)
                        .text() +
                    '[' +
                    $(node).index() +
                    ']';
                keys.push(self.getArrayIndex(parentKey.replace(/\"+/g, '')));
            }
        });

        if (value[value.length - 1] === ',') {
            value = value.substring(0, value.length - 1);
        }
        self.setState({
            actualPath: self.createValidPath(keys.reverse()),
            value,
        });
    }

    toggleSection(e) {
        e.preventDefault();
        e.stopPropagation();
        const carretIcon = $(e.currentTarget);
        const collapsibleNode = carretIcon.siblings('ul.json-dict, ol.json-array');


        // Going to toggle the class and visibility of the carret icon
        // Class will be set to 'collapsed' and collapsibleNode will have style display none since it's visible
        const isVislbe = collapsibleNode.get(0).checkVisibility();
        if (isVislbe) {
            const count = collapsibleNode.children('li').length;
            const placeholder = count + (count > 1 ? ' items' : ' item');
            collapsibleNode.after(
                '<a href class="json-placeholder">' + placeholder + '</a>',
            );
        } else {
            collapsibleNode.siblings('.json-placeholder').remove();
        }

        collapsibleNode.toggle();
        carretIcon.toggleClass('collapsed');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.reRenderTree();
        }
    }

    reRenderTree(json) {
        this.cleanUpEventListeners();
        this.renderJSONTree(json);
        window.scrollTo(0, 0);
        if (this.state.showCopier) {
            this.setState({
                showCopier: false,
            });
        }
    }

    restoreOriginalJSON() {
        this.reRenderTree(this.props.data);
    }

    renderJSONTree(json) {
        const data = json ?? this.props.data;
        this.$node = $(this.jsonRenderer.current);
        if ($) {
            const pluginOptions = {
                collapsed: window.extensionOptions?.collapsed === 1,
                withQuotes: true,
            };
            initPlugin(this.$node, $, data, pluginOptions);
            $(document).on(
                'click',
                'span.property',
                this.changeCopyIconLocation,
            );
            $(document).off('click', 'a.json-toggle');
            $(document).on('click', 'a.json-toggle', this.toggleSection);
        }
    }

    componentDidMount() {
        this.renderJSONTree();
    }

    cleanUpEventListeners() {
        $(document).off('click', 'span.property', this.changeCopyIconLocation);
        $(document).off('click', 'a.json-toggle', this.toggleSection);
    }

    componentWillUnmount() {
        this.cleanUpEventListeners();
    }

    render() {
        window.json = this.props.data;
        return (
            <div>
                <a
                    className="copier"
                    style={{
                        top: this.state.top,
                        display: this.state.showCopier ? 'block' : 'none',
                    }}
                >
                    <CopyIcon
                        className="sm-icon copy-btn"
                        {...iconFillColor(this.props.isDarkMode)}
                    />
                    <ul className="copyMenu">
                        <li>
                            <a onClick={this.copy.bind(this, event, 'path')}>
                                Copy path
                            </a>
                        </li>
                        <li>
                            <a onClick={this.copy.bind(this, event, 'value')}>
                                Copy Value
                            </a>
                        </li>
                    </ul>
                </a>
                <pre ref={this.jsonRenderer} id="json-viewer"></pre>
                {this.props.isSearchBarVisible && (
                    <SearchBar
                        json={this.props.data}
                        renderJSON={this.reRenderTree.bind(this)}
                        restoreOriginalJSON={this.restoreOriginalJSON.bind(
                            this,
                        )}
                    />
                )}
            </div>
        );
    }
}

export default TreeView;
