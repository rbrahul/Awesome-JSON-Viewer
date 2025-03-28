import React, { Component } from 'react';
import toast from 'honey-toast';
import { tree } from './vendor/d3-state-visualizer';
import { getAppliedTransformation } from './utils/chart';
import { FiCopy } from 'react-icons/fi';
import { getURL } from './utils/common';

import 'honey-toast/dist/style.css';

const ROOT_NODE_LABEL = 'ROOT';
const TREE_NODE_ID = 'json-viewer-pro-tree';

const isInt = (text) => /^\d+$/.test(text);

class ChartView extends Component {
    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
        this.renderChartFn = null;
        this.state = {
            breadcrumbs: [ROOT_NODE_LABEL],
            rootState: props.rootData,
            chartData: props.data,
        };
    }

    createValidPath = (path) => {
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
    };

    generateDataFromBreadcumb = (breadcrumbs) => {
        return breadcrumbs.reduce(
            (accum, curr) => {
                return accum[curr];
            },
            { ...this.state.rootState },
        );
    };

    gotToChart = (index) => () => {
        const isRootOnly = index === 0 && this.state.breadcrumbs.length === 1;
        const isLastOne = index === this.state.breadcrumbs.length - 1;
        if (isRootOnly || isLastOne) {
            return;
        }
        let newBreadcrumbs = this.state.breadcrumbs;
        let chartData = this.state.rootState;
        if (this.state.breadcrumbs.length > 1) {
            newBreadcrumbs = [...this.state.breadcrumbs].slice(1, index + 1);
            chartData = this.generateDataFromBreadcumb(newBreadcrumbs);
        }
        let newNode = {};
        if (typeof chartData === 'object' || Array.isArray(chartData)) {
            newNode = { ...chartData };
        }

        this.setState(
            (prevState) => {
                return {
                    breadcrumbs: [...prevState.breadcrumbs].slice(0, index + 1),
                    chartData: newNode,
                };
            },
            () => {
                this.renderChartFn(this.state.chartData);
            },
        );
    };

    buildsonPathFromArray = (items) => {
        return items.reduce((accum, current, index) => {
            if (current.includes(' ') || current.includes('-')) {
                accum += `['${current}']`;
            } else if (isInt(current)) {
                accum += `[${current}]`;
            } else {
                accum += `${index > 0 ? '.' : ''}${current}`;
            }
            return accum;
        }, '');
    };

    onCopy = () => {
        if (this.state.breadcrumbs.length === 1) {
            return;
        }
        const pathToCopy = this.buildsonPathFromArray(
            this.state.breadcrumbs.slice(1),
        );
        const theme = this.props.isDarkMode ? 'dark' : 'light';
        const toastConfig = {
            icon: {
                url: getURL('images/icons/bell.svg'),
                size: 'small',
            },
            position: 'top-center',
            animation: 'slide',
            duration: 2000,
            theme,
        };
        navigator.clipboard
            .writeText(pathToCopy)
            .then(() => {
                toast.success('Path has been copied', toastConfig);
            })
            .catch(() => {
                toast.error('Failed to copy path', toastConfig);
            });
    };

    onNodeClick = (targetNode) => {
        const data = targetNode.data;
        let hirarchy;
        let updateTargetPath = false;
        let selectedNodeName = this.createValidPath(data.name); //data.value || data.object || data.children;
        const lastBreadcrumbsItem =
            this.state.breadcrumbs[this.state.breadcrumbs.length - 1];

        if (lastBreadcrumbsItem !== data.name && targetNode.depth > 0) {
            updateTargetPath = true;
            hirarchy = [selectedNodeName];
            let currentNode = { ...targetNode };
            while (currentNode?.parent) {
                if (
                    ![undefined, null].includes(currentNode.parent?.data?.name)
                ) {
                    hirarchy.unshift(
                        this.createValidPath(currentNode.parent.data.name),
                    );
                    currentNode = currentNode.parent;
                } else {
                    break;
                }
            }
            hirarchy = [...this.state.breadcrumbs].concat(
                [...hirarchy].slice(1),
            );
        } else if (
            lastBreadcrumbsItem === data.name &&
            targetNode.height == 0
        ) {
            return;
        } else if (targetNode.parrent) {
            hirarchy = this.state.breadcrumbs;
        } else {
            hirarchy = [ROOT_NODE_LABEL];
        }

        const newNodeData = this.createNewNodeValue(hirarchy);
        let newNode = {};

        if (
            newNodeData !== null &&
            (typeof newNodeData === 'object' || Array.isArray(newNodeData))
        ) {
            newNode = { ...newNodeData };
        } else {
            newNode[selectedNodeName] = newNodeData;
        }

        this.setState({
            chartData: newNode,
            breadcrumbs: hirarchy,
        });

        setTimeout(this.reposition, 1000);
    };

    createNewNodeValue = (depthPath) => {
        let pathSequence = [...depthPath];
        if (pathSequence.length == 1) {
            return this.state.rootState;
        }
        const nodeData = [...pathSequence].slice(1).reduce((accum, curr) => {
            return accum[curr];
        }, this.props.data);
        return nodeData;
    };

    renderChart = () => {
        let chartState = this.state.chartData;
        if (chartState && Array.isArray(chartState)) {
            chartState = {
                ...chartState,
            };
        }
        const config = {
            state: chartState,
            rootKeyName: ROOT_NODE_LABEL,
            onClickText: (targetNode) => {
                this.onNodeClick(targetNode);
            },
            id: TREE_NODE_ID,
            size: window.innerWidth - 100,
            aspectRatio: 0.8,
            isSorted: false,
            margin: {
                top: 100,
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
                    background: this.props.isDarkMode ? '#222' : '#fefefe',
                    padding: '8px',
                    color: this.props.isDarkMode ? '#4FDEE5' : '#3DAAE0',
                    'border-radius': '2px',
                    'box-shadow':
                        '0 7px 7px 0' +
                        (this.props.isDarkMode ? '#111' : '#ccc'),
                    'font-size': '14px',
                    'line-height': '1.3',
                },
            },
        };
        const render = tree(this.wrapperRef.current, config);
        this.renderChartFn = (data) => {
            setTimeout(this.reposition, 1000);
            return render(data);
        };
        render();
    };

    componentWillUpdate = (_, nextState) => {
        if (nextState.chartData !== this.state.chartData) {
            this.renderChartFn(nextState.chartData);
        }
    };

    reposition = () => {
        const chartContainer = document.querySelector(`#${TREE_NODE_ID} > g`);
        const { height } = chartContainer.getBoundingClientRect();
        const appliedTransforms = getAppliedTransformation(chartContainer);
        const offsetX = 100;
        const offsetY = 100;
        const scaleValue = appliedTransforms.scaleValue ?? 1;
        let translateX = appliedTransforms.translateX ?? offsetX;
        let translateY = offsetY * scaleValue;

        if (height > window.screen.availHeight) {
            translateY =
                window.screen.availHeight -
                (height / 2 + window.screen.availHeight / 2);
        }

        if (
            appliedTransforms.translateX < 0 ||
            appliedTransforms.translateX > window.screen.availWidth
        ) {
            translateX = offsetX * scaleValue;
        }

        if (
            appliedTransforms.translateX < 0 ||
            appliedTransforms.translateY < 0
        ) {
            const newTransform = `translate(${translateX}, ${translateY}), ${appliedTransforms.scale}`;
            chartContainer.setAttribute('transform', newTransform);
        }
    };

    componentDidMount = () => {
        this.renderChart();
    };

    render() {
        return (
            <div ref={this.wrapperRef}>
                <div className="breadcumb">
                    <div
                        className="copy-breadcumb-btn"
                        data-tooltip="Copy"
                        data-direction="bottom"
                        onClick={this.onCopy}
                    >
                        <FiCopy className="sm-icon path-copy-icon" />
                    </div>
                    <ul className="breadcumb-items">
                        {this.state.breadcrumbs.map((item, i) => {
                            return (
                                <li key={i}>
                                    <a href="#" onClick={this.gotToChart(i)}>
                                        {item}
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
