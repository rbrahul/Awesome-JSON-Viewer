import React, { Component } from 'react';
import { initPlugin } from './utils/json-viewer/jquery.json-viewer.js';

class JSONInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {
                jsonParseFailed: {
                    status: false,
                    message: 'Failed to parse invalid JSON format'
                },
                rawJSON: {
                    status: false,
                    message: 'Field shouldn\'t be empty'
                }
            },
            json: JSON.stringify(props.json, null, 4)
        }
    }

    parseJSON() {
        const rawJSON = this.refs.rawJSON.value.trim();
        this.resetErrors();
        if (!rawJSON) {
            this.setState({
                'errors': {
                    ...this.state.errors,
                    ...{
                        ...this.state.errors,
                        rawJSON: {
                            ...this.state.errors.rawJSON,
                            ... {
                                status: true
                            }
                        }
                    }
                }
            });
            return;
        }

        try {
            const json = JSON.parse(rawJSON);
            this.props.changeJSON(json);
        } catch (e) {
            this.setState({
                'errors': {
                    ...this.state.errors,
                    ...{
                        ...this.state.errors,
                        jsonParseFailed: {
                            ...this.state.errors.jsonParseFailed,
                            ... {
                                status: true
                            }
                        }
                    }
                }
            });
        }
    }

resetErrors() {
    this.setState({
        'errors': {
            ...this.state.errors,
            ...{
                ...this.state.errors,
                jsonParseFailed: {
                    ...this.state.errors.jsonParseFailed,
                    ... {
                        status: false
                    }
                },
                rawJSON: {
                    ...this.state.errors.rawJSON,
                    ... {
                        status: false
                    }
                }
            }
        }
    });
}
    render() {
        return (
            <div className="json-input-section">
                <div className="json-logo">
                    <span>{'{..}'}</span>
                </div>
                <h1>JSON formated text</h1>

                {
                    this.state.errors.jsonParseFailed.status &&
                    (<div className="json-input-error-msg">
                        {this.state.errors.jsonParseFailed.message}
                    </div>)
                }

                {
                    this.state.errors.rawJSON.status &&
                    (<div className="json-input-error-msg">
                        {this.state.errors.rawJSON.message}
                    </div>)
                }
                <div className="form-input">
                    <textarea ref="rawJSON" defaultValue={this.state.json} className="json-input"></textarea>
                </div>

                <div className="form-input save-btn-area">
                    <button
                        type="button"
                        className="btn btn-big btn-white"
                        onClick={this.parseJSON.bind(this)}
                    >Parse JSON
                    </button>
                </div>
            </div>
        );
    }
}

export default JSONInput;
