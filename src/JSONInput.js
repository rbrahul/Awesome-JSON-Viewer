import React, { Component } from 'react';
import { initPlugin } from './utils/json-viewer/jquery.json-viewer.js';

class JSONInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {
                jsonParseFailed: {
                    status: false,
                    message: 'Failed to parse invalid JSON format',
                },
                rawJSON: {
                    status: false,
                    message: "Field shouldn't be empty",
                },
            },
            json: JSON.stringify(props.json, null, 4),
        };
    }

    parseJSON(initialJSON = null) {
        this.resetErrors();
        let rawJSON =
            initialJSON && typeof initialJSON === 'string'
                ? initialJSON
                : this.refs.rawJSON.value.trim();
        if (!initialJSON) {
            if (!rawJSON) {
                this.setState({
                    errors: {
                        ...this.state.errors,
                        ...{
                            ...this.state.errors,
                            rawJSON: {
                                ...this.state.errors.rawJSON,
                                ...{
                                    status: true,
                                },
                            },
                        },
                    },
                });
                return;
            }
        }

        try {
            // Accept JSON properties without quotes
            var regex = /(\"(.*?)\"|(\w+))(\s*:\s*(\".*?\"|[^,\r\n}]+))/g
            let match
            while ((match = regex.exec(rawJSON)) !== null) {
                rawJSON = rawJSON.replace(match[0], `"${match[2] || match[1]}": ${match[5]}`)
            }
            // Accept JSON with trailing commas => https://stackoverflow.com/a/34347475
            rawJSON = rawJSON.replace(/\,(?=\s*?[\}\]])/g, '');
            const json = JSON.parse(rawJSON);
            this.props.changeJSON(json);
        } catch (e) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    ...{
                        ...this.state.errors,
                        jsonParseFailed: {
                            ...this.state.errors.jsonParseFailed,
                            ...{
                                status: true,
                            },
                        },
                    },
                },
            });
        }
    }

    showFileDialog() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleFileInputChange(event) {
        const { files } = event.target;
        if (files.length) {
            var reader = new FileReader();
            reader.onload = (file) => {
                this.parseJSON(file.target.result);
            };
            reader.readAsText(files[0]);
        }
    }

    resetErrors() {
        this.setState({
            errors: {
                ...this.state.errors,
                ...{
                    ...this.state.errors,
                    jsonParseFailed: {
                        ...this.state.errors.jsonParseFailed,
                        ...{
                            status: false,
                        },
                    },
                    rawJSON: {
                        ...this.state.errors.rawJSON,
                        ...{
                            status: false,
                        },
                    },
                },
            },
        });
    }

    render() {
        return (
            <div className="json-input-section">
                <div className="json-logo">
                    <span>{'{..}'}</span>
                </div>
                <h1>JSON formatted text</h1>

                {this.state.errors.jsonParseFailed.status && (
                    <div className="json-input-error-msg">
                        {this.state.errors.jsonParseFailed.message}
                    </div>
                )}

                {this.state.errors.rawJSON.status && (
                    <div className="json-input-error-msg">
                        {this.state.errors.rawJSON.message}
                    </div>
                )}
                <div className="form-input">
                    <textarea
                        ref="rawJSON"
                        defaultValue={this.state.json}
                        className="json-input"
                    ></textarea>
                </div>
                <input
                    className="d-none"
                    onChange={this.handleFileInputChange.bind(this)}
                    accept="application/json"
                    type="file"
                    id="fileInput"
                />
                <div className="form-input save-btn-area">
                    <button
                        type="button"
                        className="btn btn-big btn-white"
                        onClick={this.parseJSON.bind(this)}
                    >
                        Parse JSON
                    </button>
                    <button
                        type="button"
                        className="btn btn-big btn-white"
                        onClick={this.showFileDialog.bind(this)}
                    >
                        Load a file
                    </button>
                </div>
            </div>
        );
    }
}

export default JSONInput;
