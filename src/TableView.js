import React, { Component } from 'react';
import './utils/json-viewer/jquery.json-viewer.css';
import './css/TableView.css';

class TableView extends Component {

    /**
     * Iterate over each element in the Object, return it rendered as table.
     * Each value is rendered type specifically or recursively if it is an object on its own.
     *
     * @param obj
     * @returns {*}
     */
    renderObject (obj) {
        const rows = Object.entries(obj).map(o => {
            const key = o[0],
                value = o[1];
            return (
                <tr key={key}>
                    <th>{key}</th>
                    {this.renderCell(value)}
                </tr>
            )
        });

        return (
            <table>
                {rows}
            </table>
        )
    }

    /**
     * Render each value type specific and return a <td> tag.
     *
     * @param value
     * @returns {*}
     */
    renderCell (value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return (<td className="value">{value || '" "'}</td>);
        }

        if (typeof value === 'boolean') {
            return (<td className="value">{value ? 'true' : 'false'}</td>)
        }

        if (Array.isArray(value)) {
            return (
                <td>{this.renderArrayAsTable(value)}</td>
            );
        }

        return (<td>{this.renderObject(value)}</td>);
    }

    /**
     * Arrays are simply rows of value specific cells, wrapped in a <table> for highlighting.
     *
     * @param value
     * @returns {*}
     */
    renderArrayAsTable (value) {
        const rows = value.map((content, index) => (<tr key={index}>{this.renderCell(content)}</tr>));

        return (
            <table>
                {rows.length > 0 ? rows : <tr>
                    <th className="json-empty">Empty array</th>
                </tr>}
            </table>
        )
    }

    render () {
        return this.renderObject(this.props.json);
    }
}

export default TableView;
