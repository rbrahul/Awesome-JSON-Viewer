import type { InternalNode } from './tree.js';
export declare function collapseChildren(node: InternalNode): void;
export declare function expandChildren(node: InternalNode): void;
export declare function toggleChildren(node: InternalNode): InternalNode;
export declare function visit(parent: InternalNode, visitFn: (parent: InternalNode) => void, childrenFn: (parent: InternalNode) => InternalNode[] | null | undefined): void;
export declare function getNodeGroupByDepthCount(rootNode: InternalNode): number[];
export declare function getTooltipString(node: InternalNode, { indentationSize }: {
    indentationSize?: number | undefined;
}): string;
