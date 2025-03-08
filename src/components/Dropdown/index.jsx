import { useCallback, useState, useEffect, useRef } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import './style.scss';

const DropDown = ({
    labelIcon,
    label,
    items,
    className = '',
    hasCaretIcon = true,
    isButtonVisible = true,
    open=false,
    onClose
}) => {
    const expandedRef = useRef(open);
    const [isExpanded, setIsExpanded] = useState(open);
    const onChangeHandler = useCallback(
        (cb, value) => (_) => {
            cb(value);
            setIsExpanded(!isExpanded);
        },
        [isExpanded],
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

    useEffect(() => {
        document.body.addEventListener('click', bodyClickHandler, false);
        return () => {
            document.body.removeEventListener('click', bodyClickHandler, false);
        };
    }, []);

    useEffect(() => {
        console.log("listen open:", open, "isExpanded:", isExpanded);

        if (expandedRef.current !== open && isExpanded !== open) {
            console.log("setting open:", open);
            setIsExpanded(open);
            expandedRef.current = open;
        }
    },[isExpanded, open])

    return (
        <div
            className={clsx('dropdown', className, { expanded: isExpanded })}
            onClick={onClickHandler}
        >
            {isButtonVisible && (
                <div className="dropdown-btn row-inline">
                    {labelIcon && <span className="sm-btn-icon">{labelIcon}</span>}
                    {label && <span className="selected-label">{label}</span>}
                    {hasCaretIcon && (
                        <span className="dropdown-caret-bottom-icon">
                            <FiChevronDown />
                        </span>
                    )}
                </div>
            )}
            <ul className="list-items dropdown-list-items">
                {
                items.map(({ label, iconUrl, onClick, selected }, index) => (
                    <li onClick={onChangeHandler(onClick, label)} key={index}>
                        {iconUrl && (
                            <img src={iconUrl} alt="" className="icon" />
                        )}
                        <span>{label}</span>
                        {selected && (
                            <span className="selected-icon"><FiCheck /></span>
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
