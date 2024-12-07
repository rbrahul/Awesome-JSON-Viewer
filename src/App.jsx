import React, { Component } from 'react';
import Menus from './Menus.jsx';
import Tooltip from './vendor/tooltip';
import TreeView from './TreeView.jsx';
import ChartViews from './ChartView.jsx';
import JSONInput from './JSONInput.jsx';
import MoreExtensionsByDeveloperOverlay from './MoreExtensionsByDeveloperOverlay';
//import './css/style.css';
import './css/dark-pro.css';

class App extends Component {
    constructor(props) {
        super(props);
        window.json = props.json;
        this.state = {
            selectedTab: 'tree',
            json: props.json,
            selectedJSON: props.json,
            isExtensionPopupVisible: false,
        };
        this.showLogInConsole();
        this.locationHashChanged = this.locationHashChanged.bind(this);
        this.tooltip = React.createRef();
        this.intervalIdRef = React.createRef();
    }

    changeTabSelection(tab) {
        this.setState({ selectedTab: tab });
    }

    onExtensionMenuClick =(e) => {
        console.log("E:",e)
        e.stopPropagation();
        this.setState((prevState) => {
            return { isExtensionPopupVisible: !prevState.isExtensionPopupVisible }
        });
    };

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

    bodyClickHandler = (e) => {
        const target = e.target;
        console.log("target:", target)
        if (!!target?.closest('.extension-list-overlay')) {
            return;
        }

        this.setState((prevState) => {
            if (prevState.isExtensionPopupVisible) {
                console.log("hiding");
                return { isExtensionPopupVisible: false };
            }
        });
    };



    componentDidMount() {
        if (!this.tooltip.current) {
            this.tooltip.current = new Tooltip();
        } else {
            this.tooltip.current.initialiseTooltip();
        }

        this.intervalIdRef.current = window.setInterval(() => {
            this.tooltip.current?.initialiseTooltip();
        }, 3_000);

        window.addEventListener('hashchange', this.locationHashChanged, false);
        document.body.addEventListener('click', this.bodyClickHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener(
            'hashchange',
            this.locationHashChanged,
            false,
        );
        document.body.removeEventListener(
            'click',
            this.bodyClickHandler,
            false,
        );

        if (this.tooltip.current) {
            this.tooltip.current.destroy();
        }
        if (this.intervalIdRef.current) {
            clearInterval(this.intervalIdRef.current);
        }
    }

    showLogInConsole() {
        console.log(
            '%cTo access the JSON data just write: %cjson',
            'font-size:14px; color: #4fdee5;background:black;padding:8px;padding-right:0px',
            'font-size:14px;color:orange;font-weight:bold;background:black;padding:8px;padding-left:0px',
        );
    }

    render() {
        return (
            <div className="App">
                <Menus
                    changeTabSelection={this.changeTabSelection.bind(this)}
                    selectedTab={this.state.selectedTab}
                    onExtensionMenuClick={this.onExtensionMenuClick}
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
                {this.state.isExtensionPopupVisible && (
                    <MoreExtensionsByDeveloperOverlay />
                )}
            </div>
        );
    }
}

export default App;
