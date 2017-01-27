import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { tree } from 'd3-state-visualizer';

class ChartView extends Component {
    constructor(props) {
        super(props);
        this.state= {
            breadcrumbs: ['Response']
        };
    }

    componentDidMount() {
        const config = {
            state: this.props.data,
            rootKeyName: 'Response',
            onClickText: (data) => {
                let hirarchy = [data.name];
                console.log(data);
                let currentNode = data;
                while(data.hasOwnProperty('parent')) {
                    if(data.parent.hasOwnProperty('name')) {
                        hirarchy.push(data.parent.name);
                        data = data.parent;
                    }else {
                        break;
                    }
                }
                this.setState({
                    breadcrumbs: hirarchy.reverse()
                });
                console.info(hirarchy.reverse().join(">"));
            },
            id: 'treeExample',
            size: window.innerWidth - 100,
            aspectRatio: 0.8,
            isSorted: false,
            margin: {
                top:40,
                left: 100
            },
            widthBetweenNodesCoeff: 1.5,
            heightBetweenNodesCoeff: 2,
            style: {
                'node' : {
                   colors: {
                       collapsed: 'red',
                       parent: '#01ff70',
                       default: '#1FB3D5'
                   },
                    stroke: 'white'
                },
                'text': {
                    colors: {
                        default: '#A15AEC',
                        hover: '#3DAAE0'
                    },
                    'font-size': '12px'
                },
                link: {
                    stroke: '#188E3F',
                    fill: 'none'
                }


            },
            tooltipOptions: {
                offset: {
                    left: 50,
                    top: 10
                },
                indentationSize: 2,
                style: {
                    background: '#222',
                    padding: '8px',
                    color: '#4FDEE5',
                    'border-radius': '2px',
                    'box-shadow': '0 7px 7px 0 #111',
                    'font-size': '13px',
                    'line-height':'1.3'
                }
            }
        };
        this.renderChart = tree(findDOMNode(this), config);
        this.renderChart();
    }

    render() {
        return (
            <div>
                <div className="breadcumb">
                    <ul>{
                        this.state.breadcrumbs.map((item,i) => {
                            return  <li key={i}><a> {item} </a></li>
                        })
                    }
                    </ul>
                </div>
                <div className="chart-holder">
                </div>
            </div>);

    }
}

export default ChartView;
