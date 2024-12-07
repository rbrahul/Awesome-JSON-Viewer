import type { HierarchyPointNode } from 'd3';
import type { Node } from 'map2tree';
import type { StyleValue } from 'd3tooltip';
export interface Options {
    state?: {} | null;
    tree?: Node | {};
    rootKeyName: string;
    pushMethod: 'push' | 'unshift';
    id: string;
    chartStyles: {
        [key: string]: StyleValue;
    };
    nodeStyleOptions: {
        colors: {
            default: string;
            collapsed: string;
            parent: string;
        };
        radius: number;
    };
    textStyleOptions: {
        colors: {
            default: string;
            hover: string;
        };
    };
    linkStyles: {
        [key: string]: StyleValue;
    };
    size: number;
    aspectRatio: number;
    initialZoom: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    isSorted: boolean;
    heightBetweenNodesCoeff: number;
    widthBetweenNodesCoeff: number;
    transitionDuration: number;
    blinkDuration: number;
    onClickText: (datum: HierarchyPointNode<Node>) => void;
    tooltipOptions: {
        disabled?: boolean;
        left?: number | undefined;
        top?: number | undefined;
        offset?: {
            left: number;
            top: number;
        };
        styles?: {
            [key: string]: StyleValue;
        } | undefined;
        indentationSize?: number;
    };
}
export interface InternalNode extends Node {
    _children?: this[] | undefined;
    id: string | number;
}
export default function (DOMNode: HTMLElement, options?: Partial<Options>): (nextState?: {} | null | undefined) => void;
export type { Node };
