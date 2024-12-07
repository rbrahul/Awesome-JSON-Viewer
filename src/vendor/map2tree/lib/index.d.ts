export interface Node {
    name: string;
    children?: this[];
    object?: unknown;
    value?: unknown;
}
export declare function map2tree(root: unknown, options?: {
    key?: string;
    pushMethod?: 'push' | 'unshift';
}, tree?: Node): Node | {};
