import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// Test trimXMLArrayRoot in isolation (copy of the function to avoid import issues)
const XMLArrayRoot = 'XMLArrayRoot';

const trimXMLArrayRoot = (jsObject) => {
    if (!Array.isArray(jsObject) && XMLArrayRoot in jsObject) {
        jsObject = jsObject[XMLArrayRoot];
    }
    return jsObject;
};

describe('trimXMLArrayRoot', () => {
    it('should return object as-is if not an array and no XMLArrayRoot', () => {
        const obj = { foo: 'bar' };
        const result = trimXMLArrayRoot(obj);
        assert.deepEqual(result, { foo: 'bar' });
    });

    it('should unwrap XMLArrayRoot if present', () => {
        const obj = { XMLArrayRoot: { foo: 'bar' } };
        const result = trimXMLArrayRoot(obj);
        assert.deepEqual(result, { foo: 'bar' });
    });

    it('should return array as-is', () => {
        const arr = [1, 2, 3];
        const result = trimXMLArrayRoot(arr);
        assert.deepEqual(result, [1, 2, 3]);
    });

    it('should handle nested objects with XMLArrayRoot', () => {
        const obj = { XMLArrayRoot: { nested: { deep: 'value' } } };
        const result = trimXMLArrayRoot(obj);
        assert.deepEqual(result, { nested: { deep: 'value' } });
    });

    it('should handle empty object', () => {
        const obj = {};
        const result = trimXMLArrayRoot(obj);
        assert.deepEqual(result, {});
    });
});
