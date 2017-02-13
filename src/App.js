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
        window.json = props.json;
        this.state = {
            selectedTab: 'tree',
            json: props.json,
            selectedJSON: props.json
        };
    }
    changeTabSelection(tab) {
        this.setState({selectedTab: tab});
    }
    changeJSON(json) {
        this.setState({
            json,
            selectedJSON: json
        },() => {
            window.json = json;
            this.changeTabSelection('tree');
        });
    }
    changeTargetNodeOnChart(json) {
        this.setState({
            selectedJSON: json
        });
    }
    render() {
        window.json = this.state.json;
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
                        <ChartViews
                            rootData = {this.state.json}
                            data={this.state.selectedJSON}
                            changeTargetNodeOnChart={this.changeTargetNodeOnChart.bind(this)}
                        />
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
