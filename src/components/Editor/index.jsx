import React, { Component, createRef } from 'react';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import {convertContent, convertToJsObject, trimXMLArrayRoot} from '../../utils/convertContent';
import { basicSetup, EditorView } from 'codemirror';
import { githubDarkInit } from '@uiw/codemirror-theme-github';
import { FiXCircle  } from 'react-icons/fi';

import downloadFile from '../../utils/dowloadFile';
import {currentDateTime} from '../../utils/datetime';
import Logo from '../Logo';
import Toolbar from './Toolbar';
import './style.css';

const editorLangMap = {
    json,
    xml,
    yaml,
};

class Editor extends Component {
    editorRef = null;
    codeMirror = null;
    constructor(props) {
        super(props);
        this.editorRef = createRef();
        this.codeMirror = createRef();
        this.state = {
            contentType: 'JSON',
            validationError: "",
            footerMessage: "",
            json: JSON.stringify(props.json, null, 4),
        };
    }

    showParseError(contentType) {
        this.setState({
            validationError: `Failed to parse the data as ${contentType}. Please check if you have entered valid data and matches with correct Content Type.`
        });
    }

    setFooterMessage(msg) {
        this.setState({
            footerMessage: msg
        });
    }

    onContentTypeChange(contentType) {
        this.resetErrors();
        if(contentType === "XML") {
            this.setFooterMessage(`Conversion between XML and JSON may lead to unexpected 'null' to empty string ("") or number to string type casting.`);
        } else {
            this.setFooterMessage('');
        }
        if (this.state.contentType !== contentType) {
            const content = this.codeMirror.current.state.doc.toString().trim();
            if (!content) {
                return;
            }
            try {
                const result = convertContent(
                    content,
                    this.state.contentType,
                    contentType,
                );
                this.codeMirror.current.destroy();
                this.initCodeMirror(result, contentType);
            } catch (e) {
                this.showParseError(contentType);
            }
        }
        this.setState({
            contentType,
        });
    }

    parseJSON(initialJSON = null) {
        this.resetErrors();
        let content =
            initialJSON && typeof initialJSON === 'string'
                ? initialJSON
                : this.codeMirror.current.state.doc.toString().trim();
        if (!content) {
            return;
        }
        const contentType = this.state.contentType ?? 'JSON';
        try {
            let json = convertToJsObject(content, contentType);
            json = trimXMLArrayRoot(json)
            this.props.changeJSON(json);
        } catch (e) {
            this.showParseError(contentType);
        }
    }

    showFileDialog() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    saveEditorContentAsFile() {
        const fileExtension = this.state.contentType.toLowerCase();
        downloadFile(this.codeMirror.current.state.doc.toString().trim(), 'text/'+fileExtension, `data-${currentDateTime()}.${fileExtension}`)
    }

    handleFileInputChange(event) {
        const { files } = event.target;
        if (files.length) {
            var reader = new FileReader();
            const fileToRead = files[0];
            let contentType = fileToRead.type.split('/')?.[1]?.toLowerCase();
            if (['x-yaml', 'yml'].includes(contentType)) {
                contentType = 'yaml';
            }
            reader.onload = (file) => {
                this.codeMirror.current.destroy();
                this.initCodeMirror(file.target.result, contentType);

                this.setState({
                    contentType: contentType.toUpperCase(),
                });
            };
            reader.readAsText(fileToRead);
        }
    }

    resetErrors() {
        this.setState({
            validationError: ""
        });
    }

    initCodeMirror = (data, contentType = 'JSON') => {
        const contentTypeInLowerCase = contentType.toLowerCase();
        const editorLanguageParser =
            editorLangMap[contentTypeInLowerCase] ?? json;
        if (this.editorRef.current) {
            this.codeMirror.current = new EditorView({
                doc: data,
                extensions: [
                    basicSetup,
                    githubDarkInit({
                        settings: {
                            background: '#070707',
                            gutterBackground: '#111111',
                        },
                    }),
                    editorLanguageParser(),
                ],
                parent: this.editorRef.current,
            });
        }
        this.codeMirror.current.dom.style.height = '600px';
    };

    componentDidMount() {
        this.initCodeMirror(this.state.json);
    }

    render() {
        const totalNumberOfBytes = new Blob([this.codeMirror?.current?.state?.doc?.toString()?.trim() ?? ""]).size;
        return (
            <>
                <Logo />
                <div className="jv-editor">
                    <Toolbar
                        onImportBtnClick={this.showFileDialog.bind(this)}
                        onParseJson={this.parseJSON.bind(this)}
                        onContentTypeChange={this.onContentTypeChange.bind(
                            this,
                        )}
                        contentType={this.state.contentType ?? 'JSON'}
                        onSaveBtnClick={this.saveEditorContentAsFile.bind(this)}
                    />
                    <div className="json-input-section">
                        {this.state.validationError && (
                            <div className="json-input-error-msg">
                               <span>{this.state.validationError}</span>
                               <button type="btn" onClick={this.resetErrors.bind(this)} className='alert-close-btn'>
                                <FiXCircle />
                               </button>
                            </div>
                        )}

                        <div
                            className="jv-code-editor"
                            ref={this.editorRef}
                        ></div>
                        <input
                            className="d-none"
                            onChange={this.handleFileInputChange.bind(this)}
                            accept="application/json,application/yaml,application/x-yaml,text/yaml,application/xml,text/xml"
                            type="file"
                            id="fileInput"
                        />
                        <div className='editor-footer'>
                            <div className="message-area"><span className='msg-icon'></span>{this.state.footerMessage}</div>
                            <div className="info-area"><span>Number of Bytes: {totalNumberOfBytes}</span></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Editor;
