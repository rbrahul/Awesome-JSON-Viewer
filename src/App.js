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
            selectedJSON: props.json
        };
        this.notify();
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

    notify(){
        console.log('%cYou can have access to JSON in console as follows:\n %cjson.property_name %cor %cjson[\'property-name\']', 'font-size:16px; color: green;', 'font-size:16px;color:orange;font-family:monospace;font-weight:bold','font-size:16px;color:blue;font-family:monospace;font-weight:bold','font-size:16px;color:orange;font-family:monospace;font-weight:bold');
    }

    componentDidMount(){
        window.json_data = this.props.json;
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
                            rootData={this.state.json}
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
                <a href={window.optionPageURL} target="_blank" className='option-menu' id="option-menu" title="Options" style={{padding: '0px'}}><img role="presentation" id="option-menu-icon" src="images/icons/gear.png"/></a>
            </div>
        );
    }
}

export default App;
