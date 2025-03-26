import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseJson } from './common.js';

const getValidDummyJSON = () => {
    return `{
            "_id": "67e4330f7592be6a1d6b017b",
            "index": 0,
            "guid": "6a216e78-d103-426b-aa14-dc1d775e1513",
            "isActive": false,
            "balance": "$1,162.00",
            "picture": "http://placehold.it/32x32",
            "salary": 39,
            "eyeColor": "brown",
            "name": "Hopkins Stark",
            "gender": "male",
            "company": "NETUR",
            "email": "hopkinsstark@netur.com",
            "phone": "+1 (815) 542-3160",
            "address": "618 Stockholm Street, Darrtown, Arizona, 8470"
          }`;
};

const getValidDummyJSONWithLargeNumber = () => {
    return `{
           "largeNumberA": 149883901923910003,
           "largeNumberWithFloatValue": 149883901923910003.119,
           "largeNumberX": "114988390192391005",
           "more": {
                "largeNumberB": 149883901923910004
            }
          }`;
};

describe('parseJson', () => {
    it('should test parseJson parses a Json string', () => {
        const dummyJson = getValidDummyJSON();
        assert.doesNotThrow(() => {
            parseJson(dummyJson);
        });
        const result = parseJson(dummyJson);
        assert.deepEqual(result, JSON.parse(dummyJson));
    });

    it('should parse Json string and convert Big Number to string', () => {
        const dummyJson = getValidDummyJSONWithLargeNumber();
        assert.doesNotThrow(() => {
            parseJson(dummyJson);
        });
        const expectedObj = {
            largeNumberA: '149883901923910003',
            largeNumberWithFloatValue: '149883901923910003.119',
            largeNumberX: '114988390192391005',
            more: {
                largeNumberB: '149883901923910004',
            },
        };
        const result = parseJson(dummyJson);
        assert.deepEqual(result, expectedObj);
    });
});
