import { useCallback, useEffect, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';

import './style.scss';
import Select from '../Select';
import { FiDelete } from 'react-icons/fi';

const JSON_PATH_SEARCH_PATTERN_FOR_AUTO_SUGGESTION = /(\.|\[|\"|\'|\[")/;

/**
 * Recursively collect all keys at every nesting level (for .. descent suggestions)
 */
const collectAllKeysDeep = (obj, depth = 0, maxDepth = 6) => {
    if (depth > maxDepth) return new Set();
    const keys = new Set();
    if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
            obj.forEach((item) => {
                collectAllKeysDeep(item, depth + 1, maxDepth).forEach((k) =>
                    keys.add(k),
                );
            });
        } else {
            Object.keys(obj).forEach((k) => {
                keys.add(k);
                collectAllKeysDeep(obj[k], depth + 1, maxDepth).forEach(
                    (kk) => keys.add(kk),
                );
            });
        }
    }
    return keys;
};

/**
 * Check if cursor is inside a filter expression ?( ... )
 */
const isInsideFilterExpr = (path) => {
    const lastQ = path.lastIndexOf('?(');
    const lastClose = path.lastIndexOf(')');
    return lastQ > -1 && lastQ > lastClose;
};

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

    const normalizePath = (path) => {
        if (path.startsWith('[')) return `$.${path}`;
        if (path.startsWith('.')) return `$${path}`;
        return path;
    };

    /**
     * Parse and return ALL matched results (not just the first one)
     */
    const parseViaJSONPath = (path) => {
        const jsonPath = normalizePath(path);
        // eval must be enabled (default) to support filter expressions like [?(@.price < 10)]
        const result = JSONPath({
            path: jsonPath,
            json,
        });
        return result;
    };

    /**
     * Lightweight parse for autocomplete — returns the resolved value of the path so far
     */
    const resolvePathForAutocomplete = (path) => {
        const jsonPath = normalizePath(path);
        try {
            const result = JSONPath({
                path: jsonPath,
                json,
                eval: false,
            });
            if (result && Array.isArray(result) && result.length > 0) {
                return result[0];
            }
        } catch (e) {
            // ignore
        }
        return null;
    };

    const onInputChange = (e) => {
        let path = e.target.value;
        if (path.length === 0) {
            onSearchTextClear();
        }
        setSearchText(path);
        setShowSuggestion(true);
        setSearchInfo('');

        // Don't try autocomplete inside filter expressions — let user type freely
        if (isInsideFilterExpr(path)) {
            setSuggestions([]);
            return;
        }

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

            // Handle recursive descent suggestions
            if (path.endsWith('..')) {
                // strip ".." to resolve the parent path for deep key collection
                const resolvedPath = path.slice(0, -2);
                const resolvedValue = resolvedPath.length > 1
                    ? resolvePathForAutocomplete(resolvedPath) || json
                    : json;
                const allKeys = collectAllKeysDeep(resolvedValue);
                setSuggestions([...allKeys]);
                setSearchInfo('');
                return;
            }

            const resolvedPathValue = resolvePathForAutocomplete(path);
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
                    const results = parseViaJSONPath(searchText);
                    if (!results || results.length === 0) {
                        setSearchInfo('No matches found');
                        return;
                    }

                    let newJsonToRender;
                    if (results.length === 1) {
                        newJsonToRender = { [searchText]: results[0] };
                    } else {
                        // Multiple matches — wrap in an array keyed by the query
                        newJsonToRender = { [searchText]: results };
                    }

                    const matchCount = results.length;
                    setSearchInfo(
                        matchCount === 1
                            ? '1 match'
                            : `${matchCount} matches`,
                    );

                    if (typeof renderJSON === 'function') {
                        renderJSON(newJsonToRender);
                        setIsJsonModified(true);
                    }
                } catch (error) {
                    console.error('JSONPath error:', error);
                    setSearchInfo(
                        'Invalid JSONPath expression',
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
            '..': '',
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

    const infoClass =
        searchInfo === 'No matches found' ||
        searchInfo.startsWith('Invalid') ||
        searchInfo.startsWith('Failed')
            ? 'search-info-error'
            : 'search-info-success';

    return (
        <div className="searchbar">
            <div className="search-input-container">
                <input
                    ref={searchInputRef}
                    placeholder="Type . or paste a JSONPath expression"
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
                <div className={`search-info-container ${infoClass}`}>
                    <span>{searchInfo}</span>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
