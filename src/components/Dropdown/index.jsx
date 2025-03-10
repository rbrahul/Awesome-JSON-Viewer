import { useCallback, useState, useEffect, useRef } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import './style.scss';

const findSelectedByLabel = (items, value) => {
    return items.findIndex(({ label }) => label === value);
};

const findSelected = (items) => {
    return items.findIndex(({ selected }) => !!selected);
};

const DropDown = ({
    labelIcon,
    label,
    items,
    className = '',
    hasCaretIcon = true,
    isButtonVisible = true,
    open = false,
    onClose,
}) => {
    const expandedRef = useRef(open);
    const listContainerRef = useRef();
    const [isExpanded, setIsExpanded] = useState(open);
    const index = findSelected(items ?? []);
    const [selectedIndex, setSelectedIndex] = useState(index < 0 ? 0 : index);
    const onChangeHandler = useCallback(
        (cb, value) => (_) => {
            cb(value);
            setIsExpanded(!isExpanded);
            const selectedIndex = findSelectedByLabel(items, value);
            setSelectedIndex(selectedIndex);
        },
        [isExpanded, selectedIndex, items],
    );

    const onClickHandler = useCallback(
        (_) => {
            setIsExpanded(!isExpanded);
        },
        [isExpanded],
    );

    const bodyClickHandler = useCallback(
        (e) => {
            const target = e.target;
            if (!!target?.closest('.dropdown')) {
                return;
            }
            setIsExpanded(false);
            if (typeof onClose === 'function') {
                onClose();
            }
        },
        [isExpanded],
    );

    const scrollThroughList = (element, stepHeight, increase, nextIndex) => {
        let totalScrolled = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const visibleHeight = stepHeight * 5;
        const currentPositionHeight = (nextIndex + 1) * stepHeight;

        if (
            increase &&
            currentPositionHeight < scrollHeight &&
            currentPositionHeight > visibleHeight
        ) {
            totalScrolled += stepHeight;
        } else if (!increase && totalScrolled > 0) {
            totalScrolled -= stepHeight;
        }

        element.scroll(0, totalScrolled);
    };

    const bodyKeyDownHandler = useCallback(
        (e) => {
            if (!isExpanded || items.length == 0) {
                return;
            }

            if ([38, 40].includes(e.which)) {
                setSelectedIndex((currentIndex) => {
                    let nextValue = currentIndex;
                    if (e.which === 38) {
                        nextValue = currentIndex - 1;
                    } else if (e.which === 40) {
                        nextValue = currentIndex + 1;
                    }
                    if (nextValue < 0) {
                        return 0;
                    } else if (nextValue >= items.length) {
                        return items.length - 1;
                    }

                    const listItemHeight =
                        listContainerRef.current?.querySelector('li')
                            .clientHeight - 1;
                    scrollThroughList(
                        listContainerRef.current,
                        listItemHeight,
                        currentIndex < nextValue,
                        nextValue,
                    );
                    return nextValue;
                });
            }

            if (e.which === 13) {
                const selectedItem = items[selectedIndex];
                const onClickHandler = selectedItem?.onClick;
                setIsExpanded(!isExpanded);
                onClickHandler?.(selectedItem?.label);
            }
        },
        [items, selectedIndex, isExpanded],
    );

    useEffect(() => {
        document.body.addEventListener('click', bodyClickHandler, false);
        document.body.addEventListener('keydown', bodyKeyDownHandler, false);
        return () => {
            document.body.removeEventListener('click', bodyClickHandler, false);
            document.body.removeEventListener(
                'keydown',
                bodyKeyDownHandler,
                false,
            );
        };
    }, [bodyKeyDownHandler, bodyClickHandler]);

    useEffect(() => {
        if (expandedRef.current !== open && isExpanded !== open) {
            setIsExpanded(open);
            expandedRef.current = open;
        }
    }, [isExpanded, open]);

    return (
        <div
            className={clsx('dropdown', className, { expanded: isExpanded })}
            onClick={onClickHandler}
        >
            {isButtonVisible && (
                <div className="dropdown-btn row-inline">
                    {labelIcon && (
                        <span className="sm-btn-icon">{labelIcon}</span>
                    )}
                    {label && <span className="selected-label">{label}</span>}
                    {hasCaretIcon && (
                        <span className="dropdown-caret-bottom-icon">
                            <FiChevronDown />
                        </span>
                    )}
                </div>
            )}
            <ul
                className="list-items dropdown-list-items"
                ref={listContainerRef}
            >
                {items.map(({ label, iconUrl, onClick, selected }, index) => (
                    <li
                        onClick={onChangeHandler(onClick, label)}
                        key={index}
                        className={clsx({ active: selectedIndex === index })}
                    >
                        {iconUrl && (
                            <img src={iconUrl} alt="" className="icon" />
                        )}
                        <span>{label}</span>
                        {selected && (
                            <span className="selected-icon">
                                <FiCheck />
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

DropDown.propTypes = {
    size: PropTypes.string,
    className: PropTypes.string,
    labelIcon: PropTypes.node,
    hasCaretIcon: PropTypes.bool,
    open: PropTypes.bool,
    label: PropTypes.string,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            iconUrl: PropTypes.string,
            onClick: PropTypes.func,
        }),
    ),
    onChange: PropTypes.func,
    onClose: PropTypes.func,
};

export default DropDown;
