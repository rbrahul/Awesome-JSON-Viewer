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
   // const [selectedLabel, setSelectedLabel] = useState(label);
    const [value, setValue] = useState("");
    const [menuItems, setMenuItems] = useState(items);

    const onClick = useCallback((value) => {
        setValue(value);
        onChange(value);
    }, [onChange, setValue]);


    useMemo(() => {
        const items = menuItems.map(item => {
            item.onClick = onClick;
            if (item.label === value) {
                item.selected = true;
            } else {
                item.selected = false;
            }
            return item;
        });
        setMenuItems(items);
    }, [items, value]);

    let selectedLabel = findSelectedLabel(label, menuItems);

    useEffect(() => {
            const items = menuItems.map(item => {
                if (item.label === label) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
                return item;
            });
            setMenuItems(items);
            selectedLabel = findSelectedLabel(label, menuItems);
    }, [label]);

    console.log("selectedLabel:", selectedLabel);

    return <DropDown items={menuItems} label={selectedLabel}  {...props} />
}


Select.propTypes = {
    size: PropTypes.string,
    className: PropTypes.string,
    labelIcon: PropTypes.node,
    hasCaretIcon: PropTypes.string,
    label: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        iconUrl: PropTypes.string,
        onClick: PropTypes.func
    }))
  };


export default Select;
