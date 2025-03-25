import React, { Component } from 'react';
import Menus from './Menus.jsx';
import Tooltip from './vendor/tooltip';
import TreeView from './TreeView.jsx';
import ChartViews from './ChartView.jsx';
import Editor from './components/Editor';
import downloadFile from './utils/dowloadFile';
import { currentDateTime } from './utils/datetime';

import './vendor/tooltip/style.css';
import './css/style.scss';

class App extends Component {
    constructor(props) {
        super(props);
        window.json = props.json;
        this.state = {
            selectedTab: 'tree',
            json: props.json,
            selectedJSON: props.json,
            isSearchBarVisible: false,
        };
        this.showLogInConsole();
        this.locationHashChanged = this.locationHashChanged.bind(this);
        this.showSearchBar = this.showSearchBar.bind(this);
        this.hideSearchBar = this.hideSearchBar.bind(this);
        this.changeJSON = this.changeJSON.bind(this);
        this.restoreOriginalJSON = this.restoreOriginalJSON.bind(this);
        this.tooltip = React.createRef();
        this.intervalIdRef = React.createRef();
        this.originalJSONRef = React.createRef(props.json);
    }

    changeTabSelection(tab) {
        this.setState({ selectedTab: tab });
    }

    showSearchBar() {
        this.setState({ isSearchBarVisible: true });
    }

    hideSearchBar() {
        this.setState({ isSearchBarVisible: false });
    }

    changeJSON(json, openTreeView = true) {
        this.setState(
            {
                json,
                selectedJSON: json,
            },
            () => {
                window.json = json;
                if (openTreeView) {
                    this.changeTabSelection('tree');
                }
            },
        );
    }

    mutateOriginalJSONAndRender(json) {
        this.originalJSONRef.current = json;
        window.json = json;
        this.changeJSON(this.originalJSONRef.current);
    }

    restoreOriginalJSON() {
        this.changeJSON(this.originalJSONRef.current, false);
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
        downloadFile(
            JSON.stringify(window.json, null, 2),
            'text/json',
            `data-${currentDateTime()}.json`,
        );
    }

    componentDidMount() {
        if (this.props.json !== this.originalJSONRef.current) {
            this.originalJSONRef.current = this.props.json;
        }

        if (!this.tooltip.current) {
            this.tooltip.current = new Tooltip();
        } else {
            this.tooltip.current.initialiseTooltip();
        }

        this.intervalIdRef.current = window.setInterval(() => {
            this.tooltip.current?.initialiseTooltip();
        }, 3_000);

        window.addEventListener('hashchange', this.locationHashChanged, false);
    }

    componentWillUnmount() {
        window.removeEventListener(
            'hashchange',
            this.locationHashChanged,
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
                    showSearchBar={this.showSearchBar}
                    hideSearchBar={this.hideSearchBar}
                    isSearchBarVisible={this.state.isSearchBarVisible}
                    isDarkMode={this.props.isDarkMode}
                />
                <div className="tab-container">
                    {this.state.selectedTab === 'tree' && (
                        <TreeView
                            data={this.state.json}
                            isSearchBarVisible={this.state.isSearchBarVisible}
                            isDarkMode={this.props.isDarkMode}
                        />
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
                        <Editor
                            json={this.originalJSONRef.current}
                            renderJSON={this.mutateOriginalJSONAndRender.bind(
                                this,
                            )}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default App;
