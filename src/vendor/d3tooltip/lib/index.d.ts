import type { BaseType, Selection } from 'd3';
export type StyleValue = string | number | boolean;
interface Options<Datum, RootGElement extends BaseType, RootDatum, RootPElement extends BaseType, RootPDatum> {
    left: number | undefined;
    top: number | undefined;
    offset: {
        left: number;
        top: number;
    };
    root: Selection<RootGElement, RootDatum, RootPElement, RootPDatum> | undefined;
    styles: {
        [key: string]: StyleValue;
    };
    text: string | ((datum: Datum) => string);
}
export declare function tooltip<GElement extends BaseType, Datum, PElement extends BaseType, PDatum, RootGElement extends BaseType, RootDatum, RootPElement extends BaseType, RootPDatum>(className?: string, options?: Partial<Options<Datum, RootGElement, RootDatum, RootPElement, RootPDatum>>): (selection: Selection<GElement, Datum, PElement, PDatum>) => void;
export {};
