window.this = window;

import React, { Component } from 'react';
import { tree } from './vendor/d3-state-visualizer';
const DEFAULT_CHART_OPTION = {
    state: undefined,
    rootKeyName: 'state',
    pushMethod: 'push',
    tree: undefined,
    id: 'd3svg',
    chartStyles: {},
    nodeStyleOptions: {
        colors: {
            default: '#ccc',
            collapsed: 'lightsteelblue',
            parent: 'white',
        },
        radius: 7,
    },
    textStyleOptions: {
        colors: {
            default: 'black',
            hover: 'skyblue',
        },
    },
    linkStyles: {
        stroke: '#000',
        fill: 'none',
    },
    size: 500,
    aspectRatio: 1.0,
    initialZoom: 1,
    margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 50,
    },
    isSorted: false,
    heightBetweenNodesCoeff: 2,
    widthBetweenNodesCoeff: 1,
    transitionDuration: 750,
    blinkDuration: 100,
    onClickText: () => {
        // noop
    },
    tooltipOptions: {
        disabled: false,
        left: undefined,
        top: undefined,
        offset: {
            left: 0,
            top: 0,
        },
        styles: undefined,
    },
};
class ChartView extends Component {
    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
        this.renderChartFn = null;
        this.state = {
            breadcrumbs: ['response'],
            rootState: props.rootData,
            chartData: props.data,
            positionTop: window.innerHeight / 2,
        };
    }

    createValidPath(path) {
        console.log('Path:', path);
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

    generateDataFromBreadcumb(breadcrumbs) {
        let currentData = this.state.rootState;
        breadcrumbs.forEach((item, index) => {
            currentData = currentData[item];
        });
        return currentData;
    }

    gotToChart(index) {
        const chartData = this.generateDataFromBreadcumb(this.state.breadcrumbs);
        let newNode = {};
        if (index === 0) {
            newNode = { ...chartData };
        } else {
            newNode[this.state.breadcrumbs[this.state.breadcrumbs.length - 1]] = chartData;
        }

        this.setState({
            breadcrumbs: this.state.breadcrumbs.slice(0, index + 1),
        });
        this.props.changeTargetNodeOnChart(newNode);
    }



    renderChart() {
        console.log("Going to render chart:", this.state.chartData)
        const config = {
            state: this.state.chartData,
            rootKeyName: 'response',
            onClickText: (targetNode) => {
                const lastPath = this.state.breadcrumbs[this.state.breadcrumbs.length - 1];
                // already added to the breadcrumbs
                if (targetNode.data.name === lastPath && targetNode.height === 0) {
                    return;
                }

                // clicked on the root node
                if (!targetNode.parent) {
                    return this.setState({
                        chartData: this.state.rootState,
                        breadcrumbs: ['response']
                    })
                }

                // retrive path index striping down brackets
                let selectedNodeName = this.createValidPath(
                    targetNode.data.name,
                );

                this.setState((prevState) => {
                    let  newChartData = prevState.chartData;
                    if (prevState.breadcrumbs.length > 1) {
                        const lastPath = prevState.breadcrumbs[prevState.breadcrumbs.length - 1];
                        newChartData = {[selectedNodeName]: prevState.chartData[lastPath][selectedNodeName]};
                    } else {
                        newChartData = {[selectedNodeName]: prevState.chartData[selectedNodeName]}
                    }
                    return {
                        chartData: newChartData,
                        breadcrumbs: [
                            ...prevState.breadcrumbs,
                            selectedNodeName,
                        ]
                    };
                });
            },
            id: 'treeExample',
            size: window.innerWidth - 100,
            aspectRatio: 0.8,
            isSorted: false,
            margin: {
                top: 0,
                left: 100,
            },
            widthBetweenNodesCoeff: 1.5,
            heightBetweenNodesCoeff: 2,
            nodeStyleOptions: {
                colors: {
                    collapsed: 'red',
                    parent: '#01ff70',
                    default: '#1FB3D5',
                },
                stroke: 'white',
            },
            textStyleOptions: {
                colors: {
                    default: '#A15AEC',
                    hover: '#3DAAE0',
                },
                'font-size': '12px',
            },
            linkStyles: {
                stroke: '#188E3F',
                fill: 'none',
            },

            tooltipOptions: {
                offset: {
                    left: 50,
                    top: 10,
                },
                indentationSize: 2,
                styles: {
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
        this.renderChartFn = tree(this.wrapperRef.current, config);
        this.renderChartFn();
    }

    componentWillUpdate(prevProps, prevState) {
        if (prevState.chartData !== this.state.chartData) {
            console.log('Component will update now. Render the ui', "prevChartdata:",prevState.chartData, "current state:",this.state.chartData);
            this.renderChartFn(prevState.chartData);
        }
    }

    componentDidMount() {
        this.renderChart();
    }

    render() {
        console.log('breadcrumbs:', this.state.breadcrumbs);
        return (
            <div ref={this.wrapperRef}>
                <div className="breadcumb">
                    <div
                        className="copy-breadcumb-btn"
                        data-tooltip="Copy"
                        data-direction="bottom"
                    >
                        <img
                            src="images/icons/copy.svg"
                            className="sm-icon"
                            alt=""
                        />
                    </div>
                    <ul className="breadcumb-items">
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
