import React, { Component } from 'react';
import ReactDOM from 'react-dom';
var $ = require('jquery');
var jQuery = $;
import { initPlugin } from './utils/json-viewer/jquery.json-viewer.js';
import  './utils/json-viewer/jquery.json-viewer.css';

class TreeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            showCopier: false,
            actualPath: null,
            value: null
        }
    }

    copy(event,type) {
        event.preventDefault();
        let context;
        if(type === 'path') {
            context= this.state.actualPath;
        } else {
            context= this.state.value;
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
        this.findPath(self,e);
        self.setState({
            top: $(e.target).offset().top,
            showCopier: true
        })
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
            if(index === 0) {
               path = path.concat(item);
            } else {
                if(item.indexOf('-')> -1) {
                    path = `${path}['${item}']`
                }else if(isNaN(item) === false) {
                    path = `${path}[${item}]`
                } else {
                    path = path.concat('.').concat(item);
                }
            }
        });
        return path;
    }
    findPath(self,e) {
            var keys=[];
            e.preventDefault();
            let spansText= $(e.target).text().replace(/\"+/g,'');
            let nodes =$(e.target).parentsUntil("#codes");
            $(nodes).each(function(i,node) {

                if($(node).get(0).tagName == "LI" && $(node).parent()[0].tagName == "UL") {
                    let parentKey = $(node).find("span.property").eq(0).text();
                    keys.push(self.getArrayIndex(parentKey.replace(/\"+/g,'')));
                }

                if($(node).get(0).tagName == "LI" && $(node).parent()[0].tagName == "OL") {
                    var parentKey = $(node).parent("OL").parent("li").find("span.property").eq(0).text()+'['+$(node).index()+']';
                    keys.push(self.getArrayIndex(parentKey.replace(/\"+/g,'')));
                }

            });
        self.setState({'actualPath':self.createValidPath(keys.reverse())});
    }
    componentDidMount() {
        var self = this;
        $(document).on("click", "span.property", this.changeCopyIconLocation.bind(self));
        this.$node = $(this.refs.jsonRenderer);
        if ($) {
            initPlugin(this.$node, $, this.props.data, {
                collapsed: false,
                withQuotes: true
            });
        }
    }

    componentWillUnmount() {
        $(document).off("click", "span.property", this.changeCopyIconLocation);
    }

    render() {
        return (
            <div>
                <a className="copier" style={ {top : this.state.top, display: this.state.showCopier ? 'block':'none'} }>
                    <ul className="copyMenu">
                        <li><a onClick={this.copy.bind(this,event,'path')}>Copy path</a></li>
                        <li><a onClick={this.copy.bind(this,event,'value')}>Copy Value</a></li>
                    </ul>
                </a>
             <pre ref="jsonRenderer" id="codes">
              </pre>
            </div>
        );
    }
}

export default TreeView;
