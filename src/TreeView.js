import React, { Component } from 'react';
import ReactDOM from 'react-dom';
var $ = require('jquery');
var jQuery = $;
import { initPlugin } from './utils/json-viewer/jquery.json-viewer.js';
import  './utils/json-viewer/jquery.json-viewer.css';

class TreeView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.$node = $(this.refs.jsonRenderer);
        if ($) {
            initPlugin(this.$node, $, this.props.data, {
                collapsed: false,
                withQuotes: true
            });
        }
    }

    render() {
        return (
            <pre ref="jsonRenderer">
        </pre>
        );
    }
}

export default TreeView;
