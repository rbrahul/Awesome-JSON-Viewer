class Switch {
    options = {
        selector: '.switch',
    };
    constructor(options = {}) {
        this.options = {
            ...this.options,
            ...options,
        };
        this.initialise();
    }

    onChangeHandler = (e) => {
        const parent = e.target.closest('.checkbox-ui-wrapper');
        if (!parent) return;

        parent.classList.toggle('checkbox-ui-checked', e.target.checked);
    };

    onClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const element = e.target;
        const checkBox = element.querySelector('.checkbox-ui-checkbox-shadow');
        if (!checkBox) {
            return;
        }
        const isChecked = checkBox.checked;

        if (isChecked) {
            checkBox.checked = false;
            checkBox.removeAttribute('checked');
        } else {
            checkBox.setAttribute('checked', 'checked');
            checkBox.checked = true;
        }
        var event = new Event('change');
        checkBox.dispatchEvent(event);
    };

    initialise = () => {
        const checkBoxes = document.querySelectorAll(this.options.selector);
        checkBoxes.forEach((checkBox) => {
            const wrapper = document.createElement('div');
            wrapper.addEventListener('click', this.onClickHandler);
            wrapper.classList.add('checkbox-ui-wrapper');
            const button = document.createElement('div');
            button.classList.add('checkbox-ui-btn');

            const clonedCheckbox = checkBox.cloneNode(true);
            clonedCheckbox.addEventListener('change', this.onChangeHandler);
            clonedCheckbox.classList.add('checkbox-ui-checkbox-shadow');
            wrapper.appendChild(clonedCheckbox);
            wrapper.appendChild(button);
            if (clonedCheckbox.checked) {
                wrapper.classList.add('checkbox-ui-checked');
            }
            const checkBoxParent = checkBox.parentElement;
            checkBoxParent.insertBefore(wrapper, checkBox);
            checkBox.remove();
        });
    };
}

export default Switch;
