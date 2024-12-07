import * as d3 from 'd3';
const defaultOptions = {
    left: undefined, // mouseX
    top: undefined, // mouseY
    offset: { left: 0, top: 0 },
    root: undefined,
    styles: {},
    text: '',
};
export function tooltip(className = 'tooltip', options = {}) {
    const { left, top, offset, root, styles, text } = {
        ...defaultOptions,
        ...options,
    };
    let el;
    const anchor = root || d3.select('body');
    const rootNode = anchor.node();
    return function tip(selection) {
        selection.on('mouseover.tip', (event, datum) => {
            const [pointerX, pointerY] = d3.pointer(event, rootNode);
            const [x, y] = [
                left || pointerX + offset.left,
                top || pointerY - offset.top,
            ];
            anchor.selectAll(`div.${className}`).remove();
            el = anchor
                .append('div')
                .attr('class', className)
                .style('position', 'absolute')
                .style('z-index', 1001)
                .style('left', `${x}px`)
                .style('top', `${y}px`)
                .html(typeof text === 'function' ? () => text(datum) : () => text);
            for (const [key, value] of Object.entries(styles)) {
                el.style(key, value);
            }
        });
        selection.on('mousemove.tip', (event, datum) => {
            const [pointerX, pointerY] = d3.pointer(event, rootNode);
            const [x, y] = [
                left || pointerX + offset.left,
                top || pointerY - offset.top,
            ];
            el.style('left', `${x}px`)
                .style('top', `${y}px`)
                .html(typeof text === 'function' ? () => text(datum) : () => text);
        });
        selection.on('mouseout.tip', () => el.remove());
    };
}
