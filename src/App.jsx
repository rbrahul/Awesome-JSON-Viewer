import React, { Component } from 'react';
import Menus from './Menus.jsx';
import Tooltip from './vendor/tooltip';
import TreeView from './TreeView.jsx';
import ChartViews from './ChartView.jsx';
import Editor from './components/Editor';
import downloadFile from './utils/dowloadFile';
import {currentDateTime} from './utils/datetime';

//import './css/style.css';
import './css/dark-pro.css';
import SearchBar from './components/Searchbar/index.jsx';

class App extends Component {
    constructor(props) {
        super(props);
        window.json = props.json;
        this.state = {
            selectedTab: 'tree',
            json: props.json,
            selectedJSON: props.json,
            isExtensionPopupVisible: false,
            isSearchBarVisible: false,
        };
        this.showLogInConsole();
        this.locationHashChanged = this.locationHashChanged.bind(this);
        this.showSearchBar = this.showSearchBar.bind(this);
        this.hideSearchBar = this.hideSearchBar.bind(this);
        this.tooltip = React.createRef();
        this.intervalIdRef = React.createRef();
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
        downloadFile(JSON.stringify(window.json, null, 2), 'text/json', `data-${currentDateTime()}.json`)
    }

    bodyClickHandler = (e) => {
        const target = e.target;
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
                    showSearchBar={this.showSearchBar}
                    hideSearchBar={this.hideSearchBar}
                    isSearchBarVisible={this.state.isSearchBarVisible}
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
                        <Editor
                            json={this.state.json}
                            changeJSON={this.changeJSON.bind(this)}
                        />
                    )}
                </div>
                {this.state.isExtensionPopupVisible && (
                    <MoreExtensionsByDeveloperOverlay />
                )}
                {this.state.isSearchBarVisible && this.state.selectedTab !== 'jsonInput' && <SearchBar />}
            </div>
        );
    }
}

export default App;
