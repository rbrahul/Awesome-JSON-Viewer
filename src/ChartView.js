import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { tree } from 'd3-state-visualizer';

class ChartView extends Component {
    constructor(props) {
        super(props);
        this.state= {
            breadcrumbs: ['response'],
            rootState: props.rootData,
            chartData: props.data
        };
    }
    createNewNodeValue(depthPath) {
        let nodeData = this.state.rootState;
        let pathSequence = [...depthPath];
        if(pathSequence.length==1) {
            return this.state.rootState;
        }
        pathSequence.reverse().splice(0,1);
        pathSequence.forEach((path) => {
            nodeData = nodeData[path];
            console.group("path is "+ path);
            console.info(nodeData);
            console.groupEnd();
        });
       return nodeData;
    }
    renderIngChart() {
        const config = {
            state: this.state.chartData,
            rootKeyName: 'response',
            onClickText: (data) => {
                const targetNode = data;
                let hirarchy;
                let updateTargetPath = false;
                let selectedNodeName= data.name;//data.value || data.object || data.children;
            if((this.state.breadcrumbs[this.state.breadcrumbs.length-1] !== targetNode.name && targetNode.depth !==1) ||
                (this.state.breadcrumbs[this.state.breadcrumbs.length-1] !== targetNode.name && targetNode.depth ==1)
            ) {
                updateTargetPath = true;
                 hirarchy = [data.name];
                while(data.hasOwnProperty('parent')) {
                    if(data.parent.hasOwnProperty('name')) {
                        hirarchy.push(data.parent.name);
                        data = data.parent;
                    }else {
                        break;
                    }
                }


            } else {
                hirarchy = this.state.breadcrumbs;
            }


                let paths= hirarchy;
               const newNodeData = this.createNewNodeValue(paths);

                console.info("node name is "+ selectedNodeName);
                let newNode = {};
                console.log(targetNode);
               if(targetNode.depth==0){
                   newNode = {...newNodeData};
                } else {
                   newNode[selectedNodeName] = newNodeData;
               }
                this.props.changeTargetNodeOnChart(newNode);
                if(updateTargetPath) {
                    this.setState({
                        'breadcrumbs': hirarchy.reverse()
                    });
                }
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

    componentWillMount () {
        this.prepareComponentState(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.prepareComponentState(nextProps);
        this.renderChart(nextProps.data);

    }
    prepareComponentState(props) {
        this.setState({
            chartData: props.data
        });
    }
componentDidUpdate() {
    this.renderIngChart();
}
    componentDidMount() {
       this.renderIngChart();
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
