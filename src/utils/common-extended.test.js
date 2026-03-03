import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateFileSize, iconFillColor } from './common.js';

describe('calculateFileSize', () => {
    it('should return bytes for small sizes', () => {
        assert.equal(calculateFileSize(0), '0 bytes');
        assert.equal(calculateFileSize(500), '500 bytes');
        assert.equal(calculateFileSize(999), '999 bytes');
    });

    it('should return KB for sizes >= 1000', () => {
        assert.equal(calculateFileSize(1000), '1.0 KB');
        assert.equal(calculateFileSize(1500), '1.5 KB');
        assert.equal(calculateFileSize(10240), '10.2 KB');
    });

    it('should return MB for sizes >= 1000*1000', () => {
        assert.equal(calculateFileSize(1000000), '1.0 MB');
        assert.equal(calculateFileSize(1536000), '1.5 MB');
    });

    it('should return GB for sizes >= 1000*1000*1000', () => {
        assert.equal(calculateFileSize(1000000000), '1.0 GB');
    });

    it('should return TB for very large sizes', () => {
        assert.equal(calculateFileSize(1000000000000), '1.0 TB');
    });
});

describe('iconFillColor', () => {
    it('should return white fill for dark mode', () => {
        const result = iconFillColor(true);
        assert.deepEqual(result, { fillColor: '#FFFFFF' });
    });

    it('should return black fill for light mode', () => {
        const result = iconFillColor(false);
        assert.deepEqual(result, { fillColor: '#000000' });
    });
});
