import React, { Component } from 'react';
import { FiTerminal, FiX } from 'react-icons/fi';
import Tree from './components/Icons/Tree';
import Branch from './components/Icons/Branch';
import Brackets from './components/Icons/Brackets';
import Gear from './components/Icons/Gear';
import { iconFillColor } from './utils/common';

class Menus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPan: props.selectedTab,
        };
    }

    setActive(tab) {
        this.setState({ selectedPan: tab });
        this.props.changeTabSelection(tab);
    }

    componentWillMount() {
        this.prepareComponentState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.prepareComponentState(nextProps);
    }

    prepareComponentState(props) {
        this.setState({
            selectedPan: props.selectedTab,
        });
    }

    showSearchBar() {
        this.props.showSearchBar();
    }

    render() {
        return (
            <div className="action-area">
                <ul className="menus">
                    {this.state.selectedPan === 'tree' && (
                        <li
                            data-tooltip={
                                !this.props.isSearchBarVisible
                                    ? 'Find by JSON Path'
                                    : 'Close Search bar'
                            }
                            data-direction="bottom"
                        >
                            {!this.props.isSearchBarVisible && (
                                <a
                                    href="#"
                                    onClick={this.showSearchBar.bind(this)}
                                    className="search-icon-btn"
                                >
                                    <FiTerminal />
                                </a>
                            )}
                            {this.props.isSearchBarVisible && (
                                <a
                                    href="#"
                                    onClick={this.props.hideSearchBar}
                                    className="search-icon-btn"
                                >
                                    <FiX />
                                </a>
                            )}
                        </li>
                    )}
                    <li
                        className={
                            this.state.selectedPan === 'tree' ? 'active' : ''
                        }
                    >
                        <a href="#" onClick={this.setActive.bind(this, 'tree')}>
                            <Tree
                                className="sm-icon"
                                {...iconFillColor(this.props.isDarkMode)}
                            />
                            <span className="menu-label">Tree</span>
                        </a>
                    </li>
                    <li
                        className={
                            this.state.selectedPan === 'chart' ? 'active' : ''
                        }
                    >
                        <a
                            href="#"
                            onClick={this.setActive.bind(this, 'chart')}
                        >
                            <Branch
                                className="sm-icon rotate-270"
                                {...iconFillColor(this.props.isDarkMode)}
                            />
                            <span className="menu-label">Chart</span>
                        </a>
                    </li>
                    <li
                        className={
                            this.state.selectedPan === 'jsonInput'
                                ? 'active'
                                : ''
                        }
                    >
                        <a
                            href="#"
                            onClick={this.setActive.bind(this, 'jsonInput')}
                        >
                            <Brackets
                                className="sm-icon"
                                {...iconFillColor(this.props.isDarkMode)}
                            />
                            <span className="menu-label">JSON Editor</span>
                        </a>
                    </li>
                    <li className="">
                        <a
                            href={
                                window.extensionOptions?.optionPageURL ??
                                '/options.html'
                            }
                            target="_blank"
                            className="option-menu"
                            id="option-menu"
                            title="Options"
                            data-tooltip="Settings"
                            data-direction="bottom"
                        >
                            <Gear
                                className="sm-icon option-icon"
                                {...iconFillColor(this.props.isDarkMode)}
                            />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Menus;
