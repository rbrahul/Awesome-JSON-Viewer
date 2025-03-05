import React, { Component, createRef } from 'react';
import { json } from '@codemirror/lang-json';
import { basicSetup, EditorView } from 'codemirror'
import { githubLight, githubDark, githubDarkInit } from '@uiw/codemirror-theme-github';
import Logo from '../Logo';
import './style.css';
import Toolbar from './Toolbar';


class Editor extends Component {
    editorRef = null
    codeMirror = null
    constructor(props) {
        super(props);
        this.editorRef = createRef()
        this.codeMirror = createRef()
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
                : this.codeMirror.current.state.doc.toString().trim()
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

 initCodeMirror = () => {
    if(this.editorRef.current) {
        this.codeMirror.current = new EditorView({
        doc: this.state.json,
        extensions: [
            basicSetup,
            githubDarkInit({ settings: {
                background: "#070707",
                gutterBackground: "#111111"
            }
            }),
            json()
        ],
        parent: this.editorRef.current,
        })
      }
      this.codeMirror.current.dom.style.height = "600px";
};

componentDidMount(){
    this.initCodeMirror();
}

    render() {
        return (
            <>
                <Logo />
                <div className="jv-editor">
                    <Toolbar onImportBtnClick={this.showFileDialog.bind(this)} onParseJson={this.parseJSON.bind(this)} />
                    <div className="json-input-section">
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

                        <div className="jv-code-editor" ref={this.editorRef}></div>
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
                </div>
            </>
        );
    }
}

export default Editor;
