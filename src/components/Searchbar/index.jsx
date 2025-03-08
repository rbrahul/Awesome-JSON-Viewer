import { useEffect, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';

import './style.scss';
import Select from '../Select';
import { FiDelete } from 'react-icons/fi';

const JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION = /(\.|\[|")/;

const makeListItem = (items, searchFlag) => {
    let filteredList = items;
    if (searchFlag.length > 0) {
        filteredList = items.filter((item) =>
            item.toLowerCase().startsWith(searchFlag.toLowerCase()),
        );
    }
    return filteredList.map((listItem) => ({
        label: listItem,
        selected: false,
    }));
};

const SearchBar = ({ json, renderJSON, restoreOriginalJSON }) => {
    const originalJSON = useRef(json);
    const searchInputRef = useRef();
    const [searchText, setSearchText] = useState('');
    const [searchInfo, setSearchInfo] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [isJsonModified, setIsJsonModified] = useState(false);

    const onPathOptionChange = (pathOption) => {
        console.log('pathOption:', pathOption);
    };

    const parseViaJSONPath = (path) => {
        const result = JSONPath({
            path,
            json: originalJSON.current,
            eval: false,
        });
        if (result && Array.isArray(result) && result.length > 0) {
            return result[0];
        }
    };

    const onInputChange = (e) => {
        const path = e.target.value;
        if (path.length == "0") {
            onSearchTextClear();
        }
        setSearchText(path);
        setShowSuggestion(true);
        try {
            const resolvedPathValue = parseViaJSONPath(path);
            if (resolvedPathValue) {
                let suggestions = [];
                if (!Array.isArray(resolvedPathValue)) {
                    suggestions = Object.keys(resolvedPathValue);
                } else {
                    suggestions = new Array(resolvedPathValue.length)
                        .fill(0)
                        .map((_, i) => String(i));
                }
                setSuggestions(suggestions);
            }
            console.log(
                'Result:',
                resolvedPathValue,
                'originalJson:',
                originalJSON.current,
            );
            setSearchInfo('');
        } catch (e) {
            console.error('failed to parse json path:', e);
            setSearchInfo(
                'Failed to retrieve value from the Path you provided',
            );
        }
    };

    const onkeyDown = (e) => {
        if (e.which === 13) {
            if (showSuggestion) {
                setShowSuggestion(false);
            }

            try {
                const resolvedPathValue = parseViaJSONPath(searchText);
                if (typeof resolvedPathValue === 'undefined') {
                    setSearchInfo(
                        'Failed to retrieve value from the Path you provided',
                    );
                    return;
                }
                const newJsonToRender = {
                    [searchText]: resolvedPathValue,
                };
                if (typeof renderJSON === 'function') {
                    renderJSON(newJsonToRender);
                    setIsJsonModified(true);
                }
            } catch (error) {
                console.log('Rending JSON path error:', error);
                setSearchInfo(
                    'Failed to retrieve value from the Path you provided',
                );
            }
        }
    };

    const onSuggestionSelected = (value) => {
        const searchParts = searchText.split(
            JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION,
        );
        if (searchParts && searchParts.length > 0) {
            const pathTillPathDelimeter = searchText.substring(
                0,
                searchText.length - searchParts[searchParts.length - 1].length,
            );
            const completePathWithAutoSuggestionApplied = `${pathTillPathDelimeter}${value}`;
            // console.log("searchParts:",searchParts,"pathTillPathDelimeter:",pathTillPathDelimeter, "completePathWithAutoSuggestionApplied:", completePathWithAutoSuggestionApplied);
            setSearchText(completePathWithAutoSuggestionApplied);
            searchInputRef.current.focus();
        }
    };

    const onSuggestionDropdownClosed = () => {
        setShowSuggestion(false);
    };

    const resetSuggestions = () => {
        setSearchText('');
        setShowSuggestion(false);
        setSuggestions([]);
    };

    const onSearchTextClear = () => {
        resetSuggestions();
        if (searchInfo) {
            setSearchInfo('');
        }

        if (isJsonModified) {
            restoreOriginalJSON();
            setIsJsonModified(false);
        }
    };

    const pathOptions = [
        {
            label: 'JSON Path',
        },
        {
            label: 'JQ (JSON Query)',
        },
    ];

    useEffect(() => {
        return () => {
            console.log('Unmounting searchbar!');
            restoreOriginalJSON();
        };
    }, []);

    const searchParts = searchText.split(
        JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION,
    );
    const searchFlag =
        searchParts &&
        searchParts.length > 0 &&
        searchParts[searchParts.length - 1].trim() !== ''
            ? searchParts[searchParts.length - 1].trim()
            : '';
    const suggestedItems = makeListItem(suggestions, searchFlag);
    return (
        <div className="searchbar">
            <div className="search-input-container">
                <input
                    ref={searchInputRef}
                    placeholder="$."
                    type="text"
                    className="search-input"
                    name="search-input"
                    id=""
                    value={searchText}
                    onChange={onInputChange}
                    onKeyDown={onkeyDown}
                    onClick={() => setShowSuggestion(true)}
                    autoComplete="off"
                    autoCorrect="off"
                />
                <div className="inline-flex">
                    <div
                        className="search-clear-btn"
                        onClick={onSearchTextClear}
                    >
                        <FiDelete />
                    </div>
                    <div className="path-input">
                        <Select
                            hasCaretIcon
                            onChange={onPathOptionChange}
                            items={pathOptions}
                            className="path-filter-options"
                        />
                    </div>
                </div>

                {suggestedItems &&
                    suggestedItems.length > 0 &&
                    showSuggestion && (
                        <div className="path-suggestions">
                            <Select
                                items={suggestedItems}
                                onChange={onSuggestionSelected}
                                className="path-autocompletion"
                                isButtonVisible={false}
                                open={true}
                                onClose={onSuggestionDropdownClosed}
                            />
                        </div>
                    )}
            </div>
            {searchInfo && (
                <div className="search-info-container">
                    <span>Invalid JSON Path</span>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
