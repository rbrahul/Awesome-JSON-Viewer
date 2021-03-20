import React, { Component } from 'react';
import './css/style.css';

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

    goToOptionPage() {
        window.open(window.optionPageURL);
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
                            Tree
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
                            Chart
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
                            JSON Input
                        </a>
                    </li>
                    <li className="">
                        <a
                            href={window.optionPageURL || '/options.html'}
                            target="_blank"
                            className="option-menu"
                            id="option-menu"
                            title="Options"
                        >
                            <img
                                id="option-menu-icon"
                                src={window.optionIconURL || OPTION_ICON_PATH}
                            />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Menus;
