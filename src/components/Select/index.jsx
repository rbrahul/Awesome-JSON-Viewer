import { useCallback, useEffect, useMemo, useState } from "react"
import PropTypes from 'prop-types';

import DropDown from "../Dropdown";


const findSelectedLabel = (label, items) => {
    if (label) {
        const matchedLabelItem = items.find((item) => item.label === label);
        if (matchedLabelItem) {
            return matchedLabelItem.label;
        }
        return label;
    }
    const selectedItem = items.find(({selected}) => !!selected);
    return !!selectedItem ? selectedItem.label: items?.[0]?.label ?? '';
};

const Select = ({
    onChange = () => {},
    size,
    label,
    items,
    ...props
}) => {
    const [menuItems, setMenuItems] = useState(items);

    const onClick = useCallback((value) => {
        onChange(value);
    }, [onChange]);

    let selectedLabel = findSelectedLabel(label, menuItems);

    useEffect(() => {
        const modifiedListeItems = items.map(item => {
            item.onClick = onClick;
            if (item.label === label) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            return item;
        });
        setMenuItems(modifiedListeItems);
        selectedLabel = findSelectedLabel(label, menuItems);
    }, [label, items]);

    return <DropDown items={menuItems} label={selectedLabel}  {...props} />
}


Select.propTypes = {
    size: PropTypes.string,
    className: PropTypes.string,
    labelIcon: PropTypes.node,
    hasCaretIcon: PropTypes.string,
    open: PropTypes.string,
    label: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        iconUrl: PropTypes.string,
        onClick: PropTypes.func
    })),
    onChange: PropTypes.func,
    onClose: PropTypes.func,
  };


export default Select;
