import { useCallback, useEffect, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';

import './style.scss';
import Select from '../Select';
import { FiDelete } from 'react-icons/fi';

const JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION = /(\.|\[|\"|\'|\[")/;

const makeListItem = (items, searchFlag) => {
    let filteredList = items;
    if (searchFlag.length > 0) {
        filteredList = items.filter((item) => item.startsWith(searchFlag));
    }
    return filteredList.map((listItem) => ({
        label: listItem,
        selected: false,
    }));
};

const SearchBar = ({ json, renderJSON, restoreOriginalJSON }) => {
    const searchInputRef = useRef();
    const [searchText, setSearchText] = useState('');
    const [searchInfo, setSearchInfo] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [isJsonModified, setIsJsonModified] = useState(false);

    const parseViaJSONPath = (path) => {
        let jsonPath = path;
        if (jsonPath.startsWith('[')) {
            jsonPath = `$.${jsonPath}`;
        } else if (jsonPath.startsWith('.')) {
            jsonPath = `\$${jsonPath}`;
        }
        const result = JSONPath({
            path: jsonPath,
            json,
            eval: false,
        });
        if (result && Array.isArray(result) && result.length > 0) {
            return result[0];
        }
    };

    const onInputChange = (e) => {
        let path = e.target.value;
        if (path.length === 0) {
            onSearchTextClear();
        }
        setSearchText(path);
        setShowSuggestion(true);
        setSearchInfo('');
        try {
            const matchedDelemeterParts =
                path.endsWith('.') ||
                path.endsWith("'") ||
                path.endsWith('"') ||
                path.endsWith('[') ||
                path.endsWith('["');

            if (!matchedDelemeterParts) {
                return;
            }
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
            } else {
                setSuggestions([]);
            }
            setSearchInfo('');
        } catch (e) {
            console.error('failed to parse json path:', e);
            setSearchInfo(
                'Failed to retrieve value from the Path you provided',
            );
        }
    };

    const onkeyDown = useCallback(
        (e) => {
            // tab key press
            if (e.which === 9 && showSuggestion) {
                e.preventDefault();
                return;
            }
            if (e.which === 13) {
                const isSuggestionDropDownMenuActive =
                    showSuggestion && filteredSuggestions.length > 0;
                if (
                    searchText.length === '' ||
                    isSuggestionDropDownMenuActive
                ) {
                    return;
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
                    setSearchInfo(
                        'Failed to retrieve value from the Path you provided',
                    );
                }
            }
            if (e.which === 40 || e.which === 38) {
                e.preventDefault();
            }
        },
        [showSuggestion, filteredSuggestions, searchText, renderJSON],
    );

    useEffect(() => {
        const searchParts = searchText.split(
            JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION,
        );
        const searchFlag =
            searchParts && searchParts.length > 0
                ? searchParts[searchParts.length - 1].trim()
                : '';
        const filteredSuggestedItems = makeListItem(suggestions, searchFlag);
        setFilteredSuggestions(filteredSuggestedItems);
    }, [suggestions, searchText]);

    const onSuggestionSelected = (value) => {
        const delemeterCompletionPairs = {
            "'": "'",
            '"': '"',
            '[': ']',
            '.': '',
        };
        const searchParts = searchText.split(
            JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION,
        );
        if (searchParts && searchParts.length > 1) {
            let pathTillPathDelimeter = searchText.substring(
                0,
                searchText.length - searchParts[searchParts.length - 1].length,
            );
            const startingDelemeter = searchParts[searchParts.length - 2];
            const closingDelemeter =
                startingDelemeter &&
                startingDelemeter in delemeterCompletionPairs
                    ? delemeterCompletionPairs[startingDelemeter]
                    : '';
            const completePathWithAutoSuggestionApplied = `${pathTillPathDelimeter}${value}${closingDelemeter}`;
            setSearchText(completePathWithAutoSuggestionApplied);
            searchInputRef.current.focus();
            searchInputRef.current.scroll(
                searchInputRef.current.scrollWidth,
                0,
            );
            searchInputRef.current.setSelectionRange(
                completePathWithAutoSuggestionApplied.length,
                completePathWithAutoSuggestionApplied.length,
            );
        }
        setShowSuggestion(false);
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

    useEffect(() => restoreOriginalJSON, []);

    return (
        <div className="searchbar">
            <div className="search-input-container">
                <input
                    ref={searchInputRef}
                    placeholder="Type . to start or paste Path"
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
                        data-tooltip="Reset to initial state"
                        data-direction="bottom"
                    >
                        <FiDelete />
                    </div>
                </div>

                {filteredSuggestions &&
                    filteredSuggestions.length > 0 &&
                    showSuggestion && (
                        <div className="path-suggestions">
                            <Select
                                items={filteredSuggestions}
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
