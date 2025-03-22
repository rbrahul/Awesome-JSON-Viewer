import React, { Component } from 'react';
import { FiTerminal, FiX } from 'react-icons/fi';
import TreeIcon from '../images/icons/tree.svg';
import ChartIcon from '../images/icons/branch.svg';
import JSONIcon from '../images/icons/brackets.svg';
import GearIcon from '../images/icons/gear.svg';

const OPTION_ICON_PATH = '/images/icons/gear.png';

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

    showSearchBar(){
        this.props.showSearchBar();
    }

    render() {
        return (
            <div className="action-area">
                <ul className="menus">
                    {this.state.selectedPan === 'tree' && (
                        <li
                            data-tooltip={!this.props.isSearchBarVisible ? "Find by JSON Path": "Close Search bar"}
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
                            <img
                                src={TreeIcon}
                                className="sm-icon"
                            />{' '}
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
                            <img
                                src={ChartIcon}
                                className="sm-icon rotate-270"
                            />{' '}
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
                            <img
                                src={JSONIcon}
                                className="sm-icon"
                            />{' '}
                            <span className="menu-label">JSON Editor</span>
                        </a>
                    </li>
                    <li className="">
                        <a
                            href={
                                (window.extensionOptions || {}).optionPageURL ||
                                '/options.html'
                            }
                            target="_blank"
                            className="option-menu"
                            id="option-menu"
                            title="Options"
                            data-tooltip="Settings"
                            data-direction="bottom"
                        >
                            <img
                                id="option-menu-icon"
                                src={GearIcon}
                            />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Menus;
