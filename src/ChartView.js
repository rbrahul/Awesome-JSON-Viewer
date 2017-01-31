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
    createValidPath(path) {
        const arrayIndexBracketStartAt = path.lastIndexOf("[");
        const arrayIndexBracketEndAt = path.lastIndexOf("]");
        if(arrayIndexBracketStartAt > -1) {
            let indexPart = path.substring(arrayIndexBracketStartAt+1,arrayIndexBracketEndAt);
            console.log(indexPart);
            return indexPart; // return 10 from xyz[10]
        }
        return path;
    }
    createNewNodeValue(depthPath) {
        let nodeData = this.props.data;
        let pathSequence = [...depthPath];
        if(pathSequence.length==1) {
            return this.state.rootState;
        }
        pathSequence.reverse().splice(0,1);
        pathSequence.forEach((path,index) => {
            console.log("path is :"+path);
            const arrayIndexBracketStartAt = path.lastIndexOf("[");
            const arrayIndexBracketEndAt = path.lastIndexOf("]");
            if(arrayIndexBracketStartAt > -1) {
                let indexPart = path.substring(arrayIndexBracketStartAt+1,arrayIndexBracketEndAt);
                console.log(nodeData+" "+indexPart);
                nodeData= nodeData[indexPart];
                console.clear();
                console.group("NODE DATA");
                console.log(pathSequence);
                console.info(nodeData);
                console.groupEnd();
                return nodeData;
            }
            nodeData = nodeData[path];
            console.clear();
            console.log(pathSequence);
            console.group("NODE DATA");
            console.info(nodeData);
            console.groupEnd();
        });
       return nodeData;
    }
    createNewNodeValueFromCurrentState(path, depth) {
        if(depth == 0) {
            return this.state.rootState;
        }
        const arrayIndexBracketStartAt = path.lastIndexOf("[");
        const arrayIndexBracketEndAt = path.lastIndexOf("]");
        if(arrayIndexBracketStartAt > -1) {
            let indexPart = path.substring(arrayIndexBracketStartAt+1,arrayIndexBracketEndAt);
              const nodeData= this.props.data[indexPart];
            console.clear();
            console.group("NODE DATA");
            console.info(nodeData);
            console.groupEnd();
            return nodeData;
        } else {
            return this.props.data[path]
        }
    }
    renderIngChart() {
        const config = {
            state: this.props.data,
            rootKeyName: 'response',
            onClickText: (data) => {
                const targetNode = data;
                let hirarchy;
                let updateTargetPath = false;
                let selectedNodeName= this.createValidPath(data.name);//data.value || data.object || data.children;
            if((this.state.breadcrumbs[this.state.breadcrumbs.length-1] !== targetNode.name && targetNode.depth !==1) ||
                (this.state.breadcrumbs[this.state.breadcrumbs.length-1] !== targetNode.name && targetNode.depth ==1)
            ) {
                updateTargetPath = true;
                 hirarchy = [data.name];
                while(data.hasOwnProperty('parent')) {
                    if(data.parent.hasOwnProperty('name')) {
                        hirarchy.push(this.createValidPath(data.parent.name));
                        data = data.parent;
                    }else {
                        break;
                    }
                }

            } else {
                hirarchy = this.state.breadcrumbs;
            }
                let paths= hirarchy;
               const newNodeData = this.createNewNodeValue(paths);// this.createNewNodeValueFromCurrentState(targetNode.name,targetNode.depth);//
                console.warn(newNodeData);
                let newNode = {};
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
        this.renderChart(nextProps.data || nextProps.state);

    }
    prepareComponentState(props) {
        this.setState({
            chartData: props.data
        });
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
