import React, { Component } from 'react';
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

    render() {
        return (
            <div className="action-area">
                <ul className="menus">
                    <li
                        className={
                            this.state.selectedPan === 'tree' ? 'active' : ''
                        }
                    >
                        <a href="#" onClick={this.setActive.bind(this, 'tree')}>
                           <img src='images/icons/tree.svg'  className='sm-icon' /> <span className='menu-label'>Tree</span>
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
                             <img src='images/icons/branch.svg'  className='sm-icon rotate-270' /> <span className='menu-label'>Chart</span>
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
                             <img src='images/icons/brackets.svg'  className='sm-icon' /> <span className='menu-label'>JSON Editor</span>
                        </a>
                    </li>
                    <li className="">
                        <a
                            href={(window.extensionOptions||{}).optionPageURL || '/options.html'}
                            target="_blank"
                            className="option-menu"
                            id="option-menu"
                            title="Options"
                             data-tooltip="Settings"
                             data-direction="bottom"
                        >
                            <img
                                id="option-menu-icon"
                                src={(window.extensionOptions||{}).optionIconURL || OPTION_ICON_PATH}
                            />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Menus;
