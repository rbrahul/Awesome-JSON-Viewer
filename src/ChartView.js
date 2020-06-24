import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';https://github.com/rbrahul/Awesome-JSON-Viewer/pull/15/conflict?name=src%252FJSONInput.js&ancestor_oid=d578a746fc6a193fb068fb4b4f0228452b8a3eb8&base_oid=d9ea2f1f43a0d2e78925b81184047f72caf5897d&head_oid=885fdf1dda86149e429e842ec1810aa859e3f4f1
import { tree } from 'd3-state-visualizer';

class ChartView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breadcrumbs: ['response'],
            rootState: props.rootData,
            chartData: props.data,
            positionTop: window.innerHeight / 2,
        };
    }

    createValidPath(path) {
        const arrayIndexBracketStartAt = path.lastIndexOf('[');
        const arrayIndexBracketEndAt = path.lastIndexOf(']');
        if (arrayIndexBracketStartAt > -1) {
            let indexPart = path.substring(
                arrayIndexBracketStartAt + 1,
                arrayIndexBracketEndAt,
            );
            return indexPart; // return 10 from xyz[10]
        }
        return path;
    }

    createNewNodeValue(depthPath) {
        let nodeData = this.props.data;
        let pathSequence = [...depthPath];
        if (pathSequence.length === 1) {
            return this.state.rootState;
        }
        pathSequence.reverse().splice(0, 1);
        pathSequence.forEach((path, index) => {
            const arrayIndexBracketStartAt = path.lastIndexOf('[');
            const arrayIndexBracketEndAt = path.lastIndexOf(']');
            if (arrayIndexBracketStartAt > -1) {
                let indexPart = path.substring(
                    arrayIndexBracketStartAt + 1,
                    arrayIndexBracketEndAt,
                );
                nodeData = nodeData[indexPart];
                return nodeData;
            }
            nodeData = nodeData[path];
        });
        return nodeData;
    }
    generateDataFromBreadcumb(breadcumbs) {
        let currentData = this.state.rootState;
        breadcumbs.forEach((item, index) => {
            currentData = currentData[item];
        });
        return currentData;
    }

    gotToChart(index) {
        let breadcumbs = this.state.breadcrumbs.slice(1, index + 1);
        const chartData = this.generateDataFromBreadcumb(breadcumbs);
        let newNode = {};
        if (index === 0) {
            newNode = { ...chartData };
        } else {
            newNode[breadcumbs[breadcumbs.length - 1]] = chartData;
        }

        this.setState({
            breadcrumbs: this.state.breadcrumbs.slice(0, index + 1),
        });
        this.props.changeTargetNodeOnChart(newNode);
    }

    renderIngChart() {
        const config = {
            state: this.props.data,
            rootKeyName: 'response',
            onClickText: (data) => {
                const targetNode = data;
                let hirarchy;
                let updateTargetPath = false;
                let selectedNodeName = this.createValidPath(data.name); //data.value || data.object || data.children;
                if (
                    (this.state.breadcrumbs[
                        this.state.breadcrumbs.length - 1
                    ] !== targetNode.name &&
                        targetNode.depth !== 1) ||
                    (this.state.breadcrumbs[
                        this.state.breadcrumbs.length - 1
                    ] !== targetNode.name &&
                        targetNode.depth == 1)
                ) {
                    updateTargetPath = true;
                    hirarchy = [data.name];
                    while (data.hasOwnProperty('parent')) {
                        if (data.parent.hasOwnProperty('name')) {
                            hirarchy.push(
                                this.createValidPath(data.parent.name),
                            );
                            data = data.parent;
                        } else {
                            break;
                        }
                    }
                } else {
                    hirarchy = this.state.breadcrumbs;
                }
                let paths = hirarchy;
                const newNodeData = this.createNewNodeValue(paths);
                let newNode = {};
                if (targetNode.depth === 0) {
                    newNode = { ...newNodeData };
                } else {
                    newNode[selectedNodeName] = newNodeData;
                }

                this.props.changeTargetNodeOnChart(newNode);
                if (updateTargetPath) {
                    if (targetNode.depth === 0) {
                        this.setState({
                            breadcrumbs: ['response'],
                        });
                    } else {
                        const keys = this.state.breadcrumbs;
                        let newKeys = [];
                        paths.forEach((key, index) => {
                            if (keys.indexOf(key) === -1) {
                                let property = this.createValidPath(key);
                                newKeys.push(property);
                            }
                        });
                        this.setState({
                            breadcrumbs: this.state.breadcrumbs.concat(
                                newKeys.reverse(),
                            ),
                        });
                    }
                }
            },
            id: 'treeExample',
            size: window.innerWidth - 100,
            aspectRatio: 0.8,
            isSorted: false,
            margin: {
                top: 50,
                left: 100,
            },
            widthBetweenNodesCoeff: 1.5,
            heightBetweenNodesCoeff: 2,
            style: {
                node: {
                    colors: {
                        collapsed: 'red',
                        parent: '#01ff70',
                        default: '#1FB3D5',
                    },
                    stroke: 'white',
                },
                text: {
                    colors: {
                        default: '#A15AEC',
                        hover: '#3DAAE0',
                    },
                    'font-size': '12px',
                },
                link: {
                    stroke: '#188E3F',
                    fill: 'none',
                },
            },
            tooltipOptions: {
                offset: {
                    left: 50,
                    top: 10,
                },
                indentationSize: 2,
                style: {
                    background: '#222',
                    padding: '8px',
                    color: '#4FDEE5',
                    'border-radius': '2px',
                    'box-shadow': '0 7px 7px 0 #111',
                    'font-size': '13px',
                    'line-height': '1.3',
                },
            },
        };
        this.renderChart = tree(findDOMNode(this), config);
        this.renderChart();
    }

    componentWillMount() {
        this.prepareComponentState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.prepareComponentState(nextProps);
        this.renderChart(nextProps.data || nextProps.state);
    }

    prepareComponentState(props) {
        this.setState({
            chartData: props.data,
        });
    }

    componentDidMount() {
        this.renderIngChart();
    }

    render() {
        return (
            <div>
                <div className="breadcumb">
                    <ul>
                        {this.state.breadcrumbs.map((item, i) => {
                            return (
                                <li key={i}>
                                    <a
                                        href="#"
                                        onClick={this.gotToChart.bind(this, i)}
                                    >
                                        {' '}
                                        {item}{' '}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="chart-holder"></div>
            </div>
        );
    }
}

export default ChartView;
