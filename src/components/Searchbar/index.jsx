import {useState} from 'react';
import './style.scss';
import Select from '../Select';
import { FiDelete } from 'react-icons/fi';

const SearchBar = () => {
    const [searchText, setSearchText] = useState("");
    const onPathOptionChange = (pathOption) => {
        console.log('pathOption:', pathOption);
    };

    const onInputChange = (e) => {
        setSearchText(e.target.value)
    }

    const pathOptions = [
        {
            label: 'JQ (JSON Query)',
        },
        {
            label: 'JSON Path',
        },
    ];

    return (
        <div className="searchbar">
            <div className="search-input-container">
                <input
                    placeholder="$."
                    type="text"
                    className="search-input"
                    name="search-input"
                    id=""
                    value={searchText}
                    onChange={onInputChange}
                />
                <div className='inline-flex'>
                    <div className='search-clear-btn' onClick={() => setSearchText("")}>
                        <FiDelete />
                    </div>
                    <div className="path-input">
                        <Select hasCaretIcon onChange={onPathOptionChange} items={pathOptions} className="path-filter-options"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
