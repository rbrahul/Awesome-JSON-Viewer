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

    addStyle() {
        const style = document.createElement('style');
        style.id = this.styleTagId;
        style.textContent = `
        #tooltip-msg {
            position:absolute;
            padding: 15px;
            border-radius: 4px;
            color:#fff;
            font-size: 14px;
            transition: ease-in-ease-out .3s;
            background:black;
            z-index:100000000000;
            max-width:300px;
        }

        #tooltip-msg.small {
             padding: 8px;
             font-size: 12px;
        }

        #tooltip-msg.medium {
             padding: 10px;
             font-size: 13px;
        }

        #tooltip-msg:before {
            content: '';
            width:0px;
            height:0px;
            border:8px solid black;
            z-index:99999999;
            position:absolute;
            z-index:-1;
        }
        .hidden{
           display:none !important;
        }
        .visible{
            display:block !important;
        }

        #tooltip-msg.dir-right {
            transform: translateY(-50%);
        }

        #tooltip-msg.dir-right::before {
            left: -14px;
            top: calc(50% - 2px);
            transform: rotate(45deg) translateY(-50%);
        }

        #tooltip-msg.dir-bottom {
            transform: translateX(-50%);
        }

        #tooltip-msg.dir-bottom::before {
            left: 50%;
            top: -2px;
            transform: rotate(45deg) translateX(-50%);
        }

        #tooltip-msg.dir-left {
            transform: translateX(-100%) translateY(-50%);
        }

        #tooltip-msg.dir-left::before {
            right: -2px;
            top: calc(50% - 2px);
            transform: rotate(45deg) translateY(-50%);
        }

        #tooltip-msg.dir-top {
            transform: translateX(-50%) translateY(-100%);
        }

        #tooltip-msg.dir-top::before {
            left: 50%;
            bottom: -12px;
            transform: rotate(45deg) translateX(-50%);
        }
       `;
        if (!document.querySelector(`#${this.styleTagId}`)) {
            document.head.append(style);
        }
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
        this.addStyle();

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
