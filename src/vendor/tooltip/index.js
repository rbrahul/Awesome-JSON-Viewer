class Tooltip {
    direction = 'bottom';
    distance = 10;
    container = document;
    tooltipMessageId = 'tooltip-msg';
    styleTagId = 'tooltip-style';
    _allowedDirection = ['top', 'right', 'bottom', 'left'];
    size = 'medium'; // small | medium | large

    constructor(options = {}) {
        if (options.container) {
            this.container = options.container;
        }
        if (options.direction) {
            this.direction = options.direction;
        }

        if (options.distance) {
            this.distance = options.distance;
        }

        if (options.size) {
            this.size = options.size;
        }

        this.initialiseTooltip();
    }

    getMatchedClasses(classList, expectedClasses = []) {
        return expectedClasses.filter((expectedClass) =>
            classList.contains(expectedClass),
        );
    }

    addTooltip() {
        const tooltip = document.createElement('div');
        const toolTipId = this.tooltipMessageId;
        tooltip.id = toolTipId;
        tooltip.classList.add('hidden', this.size || 'medium');
        if (!document.body.querySelector(`#${toolTipId}`)) {
            document.body.append(tooltip);
        }
    }

    getOffset(target, direction = this.direction) {
        const rect = target.getBoundingClientRect();
        let offsetTop = rect.top + window.scrollY + rect.height / 2;
        let offsetLeft =
            rect.left + window.scrollX + rect.width + this.distance;
        const halfWidth = target.width / 2;
        switch (direction) {
            case 'top':
                offsetTop = rect.top + window.scrollY - this.distance;
                offsetLeft = rect.left + window.scrollX + halfWidth;
                break;
            case 'right':
                offsetTop = rect.top + window.scrollY + rect.height / 2;
                offsetLeft =
                    rect.left + window.scrollX + rect.width + this.distance;
                break;
            case 'left':
                offsetTop = rect.top + window.scrollY + rect.height / 2;
                offsetLeft = rect.left + window.scrollX - this.distance;
                break;
            case 'bottom':
                offsetTop =
                    rect.top + window.scrollY + rect.height + this.distance;
                offsetLeft = rect.left + window.scrollX + rect.width / 2;
                break;
        }
        return {
            top: offsetTop,
            left: offsetLeft,
        };
    }

    showToolTip(event) {
        this.hideTooltip();
        let direction = this.direction;
        const dataset = event.currentTarget.dataset;

        if ('direction' in dataset) {
            if (!this._allowedDirection.includes(dataset.direction)) {
                // console.warn(`Invalid data-direction attribute was set. Using the default direction:${this.direction}`)
            } else {
                direction = dataset.direction;
            }
        }

        const { top: offsetTop, left: offsetLeft } = this.getOffset(
            event.target,
            direction,
        );

        const tooltipNode = document.querySelector(`#${this.tooltipMessageId}`);

        if ('tooltip' in dataset) {
            const tooltipMsg = dataset.tooltip;
            if (!tooltipNode) return;

            const matchedClasses = this.getMatchedClasses(
                tooltipNode.classList,
                this._allowedDirection.map((className) => `dir-${className}`),
            );

            if (!!matchedClasses.length) {
                matchedClasses.forEach((className) =>
                    tooltipNode.classList.remove(className),
                );
            }

            tooltipNode.classList.add('dir-' + direction);

            tooltipNode.style = `top:${offsetTop}px;left:${offsetLeft}px;`;
            tooltipNode.textContent = tooltipMsg;

            if (tooltipNode.classList.contains('hidden')) {
                tooltipNode.classList.remove('hidden');
            }

            if (!tooltipNode.classList.contains('visible')) {
                tooltipNode.classList.add('visible');
            }
        }
        if ('tooltipSize' in dataset) {
            if (
                tooltipNode?.classList &&
                !tooltipNode.classList.contains(dataset.tooltipSize)
            ) {
                tooltipNode.classList.add(dataset.tooltipSize);
            }
        } else {
            if (
                tooltipNode?.classList &&
                tooltipNode.classList.contains(dataset.tooltipSize)
            ) {
                tooltipNode.classList.remove(dataset.tooltipSize);
            }
        }
    }

    hideTooltip() {
        const tooltipNode = document.querySelector(`#${this.tooltipMessageId}`);
        if (!tooltipNode) return;

        if (tooltipNode.classList.contains('visible')) {
            tooltipNode.classList.remove('visible');
        }

        if (!tooltipNode.classList.contains('hidden')) {
            tooltipNode.classList.add('hidden');
        }
    }

    initialiseTooltip() {
        this.addTooltip();

        this.container.querySelectorAll('[data-tooltip]').forEach((element) => {
            element.removeEventListener(
                'mouseenter',
                this.showToolTip.bind(this),
            );
            element.addEventListener('mouseenter', this.showToolTip.bind(this));

            element.removeEventListener(
                'mouseleave',
                this.hideTooltip.bind(this),
            );
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    cleanUpEvent() {
        this.container.querySelectorAll('[data-tooltip]').forEach((element) => {
            element.removeEventListener(
                'mouseenter',
                this.showToolTip.bind(this),
            );
            element.removeEventListener(
                'mouseleave',
                this.hideTooltip.bind(this),
            );
        });
    }

    destroy() {
        const styleTag = document.querySelector(`#${this.styleTagId}`);
        if (styleTag) {
            styleTag.remove();
        }

        const tooltipMsgElement = document.querySelector(
            `#${this.tooltipMessageId}`,
        );
        if (tooltipMsgElement) {
            tooltipMsgElement.remove();
        }
        this.cleanUpEvent();
    }
}

export default Tooltip;
