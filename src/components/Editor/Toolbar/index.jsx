import React from "react";
import './style.css';

const Toolbar = ({
    onImportBtnClick,
    onParseJson
}) => {
    return (<div className="jv-toolbar">
            <div className="jv-align-left jv-width-half ">
                <button type="button" className="jv-btn jv-btn-md jv-btn-default">JSON</button>
                <button type="button" className="jv-btn jv-btn-md jv-btn-default">Save</button>
                <button type="button" className="jv-btn jv-btn-md jv-btn-default" onClick={onImportBtnClick}>Import File</button>
            </div>
            <div className="jv-align-right jv-width-half ">
                <button type="button" className="jv-btn jv-btn-md jv-btn-primary" onClick={onParseJson}>Parse as JSON</button>
            </div>
    </div>)
}

export default Toolbar;
