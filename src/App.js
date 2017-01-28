import React, { Component } from 'react';
import Menus from './Menus';
import TreeView from './TreeView';
import ChartViews from './ChartView.js';
import JSONInput from './JSONInput.js';
import './css/App.css';
import './css/style.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'tree',
            json:props.json
        };
    }
    changeTabSelection(tab) {
        this.setState({selectedTab: tab});
    }
    changeJSON(json) {
        this.setState({json},() => {
            this.changeTabSelection('tree');
        });
    }
    render() {
        return (
            <div className="App">
                <Menus changeTabSelection={this.changeTabSelection.bind(this)} selectedTab={this.state.selectedTab}/>
                <div className="tab-container">
                    {
                        this.state.selectedTab === 'tree' &&
                        <TreeView data={this.state.json}/>
                    }
                    {
                        this.state.selectedTab === 'chart' &&
                        <ChartViews data={this.state.json}/>
                    }
                    {
                        this.state.selectedTab === 'jsonInput' &&
                        <JSONInput
                            json={this.state.json}
                            changeJSON={this.changeJSON.bind(this)}
                        />
                    }

                </div>
            </div>
        );
    }
}

export default App;
