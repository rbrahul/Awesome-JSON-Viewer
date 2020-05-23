import React, { Component } from 'react';
import Menus from './Menus';
import TreeView from './TreeView';
import ChartViews from './ChartView.js';
import JSONInput from './JSONInput.js';
import './css/style.css';

class App extends Component {
    constructor(props) {
        super(props);
        window.json = props.json;
        this.state = {
            selectedTab: 'tree',
            json: props.json,
            selectedJSON: props.json,
        };
        this.showLogInConsole();
        this.locationHashChanged = this.locationHashChanged.bind(this);
    }

    sendJSONToContentScript() {
        try {
            //chrome.runtime.send
        } catch (error) {}
    }

    changeTabSelection(tab) {
        this.setState({ selectedTab: tab });
    }

    changeJSON(json) {
        this.setState(
            {
                json,
                selectedJSON: json,
            },
            () => {
                window.json = json;
                this.changeTabSelection('tree');
            },
        );
    }

    changeTargetNodeOnChart(json) {
        this.setState({
            selectedJSON: json,
        });
    }

    locationHashChanged() {
        if (window.location.href.includes('downloadJSON=true')) {
            this.downloadAsJSON();
            setTimeout(() => {
                window.location.hash = '';
            }, 2000);
        }
    }

    downloadAsJSON() {
        const date = new Date();
        const downloadBtn = document.createElement('a');
        downloadBtn.id = 'rb-download-json';
        downloadBtn.download = `data-${date.getFullYear()}${date.getMonth()}${
            date.getDate() + 1
        }${date.getHours()}${date.getMinutes()}${date.getSeconds()}.json`;
        downloadBtn.style = 'display:none;';
        downloadBtn.href =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(window.json, null, 2));
        document.body.appendChild(downloadBtn);
        downloadBtn.click();
        setTimeout(() => {
            document.body.removeChild(downloadBtn);
        }, 200);
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.locationHashChanged, false);
    }

    componentWillUnmount() {
        window.removeEventListener(
            'hashchange',
            this.locationHashChanged,
            false,
        );
    }

    showLogInConsole() {
        console.log(
            "%cYou have access to JSON data in the console now : %cjson.property_name %cor %cjson['property-name']",
            'font-size:14px; color: #4fdee5;background:black;padding:8px;',
            'font-size:14px;color:orange;font-family:monospace;font-weight:bold;background:black;padding:8px;',
            'font-size:14px;color:white;font-family:monospace;font-weight:bold;background:black;padding:8px;',
            'font-size:14px;color:orange;font-family:monospace;font-weight:bold;background:black;padding:8px;',
        );
    }

    render() {
        return (
            <div className="App">
                <Menus
                    changeTabSelection={this.changeTabSelection.bind(this)}
                    selectedTab={this.state.selectedTab}
                />
                <div className="tab-container">
                    {this.state.selectedTab === 'tree' && (
                        <TreeView data={this.state.json} />
                    )}
                    {this.state.selectedTab === 'chart' && (
                        <ChartViews
                            rootData={this.state.json}
                            data={this.state.selectedJSON}
                            changeTargetNodeOnChart={this.changeTargetNodeOnChart.bind(
                                this,
                            )}
                        />
                    )}
                    {this.state.selectedTab === 'jsonInput' && (
                        <JSONInput
                            json={this.state.json}
                            changeJSON={this.changeJSON.bind(this)}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default App;
