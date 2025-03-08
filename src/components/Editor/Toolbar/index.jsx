import React from 'react';
import Select from '../../Select';
import { FiUploadCloud, FiFileText, FiPlay, FiSave  } from 'react-icons/fi';

import './style.css';

const Toolbar = ({ onImportBtnClick, onParseJson, onContentTypeChange, onSaveBtnClick, contentType }) => {
    const contentTypMenuItems = {
        size: 'small',
        label: contentType,
        items: [
            {
                label: 'JSON',
                iconUrl: null,
                selected: true,
            },
            {
                label: 'YAML',
                iconUrl: null,
            },
            {
                label: 'XML',
                iconUrl: null,
            },
        ],
    };
    console.log("Toolbar contentType:", contentType)
    return (
        <div className="jv-toolbar">
            <div className="jv-align-left jv-width-half inline-flex">
                <div className="jv-content-type-menu">
                    <Select
                        {...contentTypMenuItems}
                        labelIcon={<FiFileText />}
                        onChange={onContentTypeChange}
                        className="jv-content-type-btn"
                    />
                </div>
                <button
                    type="button"
                    className="jv-btn jv-btn-md jv-btn-default"
                    onClick={onSaveBtnClick}
                >
                    <span className="sm-btn-icon">
                        <FiSave />
                    </span>
                    Save
                </button>
                <button
                    type="button"
                    className="jv-btn jv-btn-md jv-btn-default"
                    onClick={onImportBtnClick}
                >
                    <span className="sm-btn-icon">
                    <FiUploadCloud />
                    </span>
                    Import File
                </button>
            </div>
            <div className="jv-align-right jv-width-half ">
                <button
                    type="button"
                    className="jv-btn jv-btn-md jv-btn-primary"
                    onClick={onParseJson}
                >
                    <span className="sm-btn-icon">
                    <FiPlay />
                    </span>Parse as JSON
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
