const SWITCH_APPLIED_CLASS_NAME = 'checkbox-ui-checkbox-shadow';
const SWITCH_WRAPPER_CLASS_NAME = 'checkbox-ui-wrapper';

class Switch {
    changeEvent = new Event('change');
    options = {
        selector: '.switch',
        onDestroy: () => {},
        onInitialise: () => {},
        onCheckAll: () => {},
        onUncheckAll: () => {},
    };

    constructor(options = {}) {
        this.options = {
            ...this.options,
            ...options,
        };
        this.initialise();
    }

    onChangeHandler = (e) => {};

    #toggleCheckedState = (checkBox, shouldMarkAsChecked) => {
        if (shouldMarkAsChecked) {
            this.#setChecked(checkBox);
        } else {
            this.#setUnchecked(checkBox);
        }
    };

    #setChecked = (checkBox) => {
        if (checkBox.checked) {
            return;
        }
        checkBox.setAttribute('checked', 'checked');
        checkBox.checked = true;
        checkBox.dispatchEvent(this.changeEvent);
    };

    #setUnchecked = (checkBox) => {
        if (!checkBox.checked) {
            return;
        }
        checkBox.checked = false;
        checkBox.removeAttribute('checked');
        checkBox.dispatchEvent(this.changeEvent);
    };

    onClickHandler = (e) => {
        const checkBox = e.target.querySelector(
            `.${SWITCH_APPLIED_CLASS_NAME}`,
        );
        if (!checkBox) {
            return;
        }
        this.#toggleCheckedState(checkBox, !checkBox.checked);
    };

    initialise = () => {
        const checkBoxes = document.querySelectorAll(this.options.selector);
        checkBoxes.forEach((checkBox) => {
            if (checkBox.classList.contains(SWITCH_APPLIED_CLASS_NAME)) {
                return;
            }
            const wrapper = document.createElement('div');
            wrapper.addEventListener('click', this.onClickHandler);
            wrapper.classList.add(SWITCH_WRAPPER_CLASS_NAME);
            const button = document.createElement('div');
            button.classList.add('checkbox-ui-btn');

            const clonedCheckbox = checkBox.cloneNode(false);
            clonedCheckbox.addEventListener('change', this.onChangeHandler);
            clonedCheckbox.classList.add(SWITCH_APPLIED_CLASS_NAME);

            const color =
                clonedCheckbox.dataset.color || this.options.accentColor;
            if (color) {
                wrapper.style.cssText = `--switch-accent-color: ${color}`;
            }

            const className = clonedCheckbox.dataset.class;
            if (className && !wrapper.classList.contains(className)) {
                wrapper.classList.add(className);
            }

            wrapper.appendChild(clonedCheckbox);
            wrapper.appendChild(button);
            const checkBoxParent = checkBox.parentElement;
            checkBoxParent.insertBefore(wrapper, checkBox);
            checkBox.remove();
        });
        this.options.onInitialise?.();
    };

    destroy = () => {
        const allCheckboxWrappers = document.querySelectorAll(
            `.${SWITCH_WRAPPER_CLASS_NAME}`,
        );
        allCheckboxWrappers.forEach((wrapper) => {
            const checkBox = wrapper.querySelector(
                `${this.options.selector}.${SWITCH_APPLIED_CLASS_NAME}`,
            );
            if (!checkBox) {
                return;
            }
            wrapper.removeEventListener('click', this.onClickHandler);
            checkBox.classList.remove(SWITCH_APPLIED_CLASS_NAME);
            checkBox.removeEventListener('change', this.onChangeHandler);
            wrapper.insertAdjacentElement('afterend', checkBox);
            wrapper.remove();
        });
        this.options.onDestroy?.();
    };

    checkAll = () => {
        document
            .querySelectorAll(`${this.options.selector}`)
            .forEach(this.#setChecked);
        this.options.onCheckAll?.();
    };

    uncheckAll = () => {
        document
            .querySelectorAll(`${this.options.selector}`)
            .forEach(this.#setUnchecked);
        this.options.onUncheckAll?.();
    };
}

export default Switch;
window.Switch = Switch;
