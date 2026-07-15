import assert from 'node:assert/strict';
import { normalizeEmbedding } from '../src/lib/vectorSearchProvider.mjs';

const embedding = [3, 4, 0];
const normalized = normalizeEmbedding(embedding, 6);

assert.ok(Array.isArray(normalized));
assert.equal(normalized.length, 6);
assert.equal(normalized[0], 0.6);
assert.equal(normalized[1], 0.8);
assert.equal(normalized[2], 0);
assert.equal(normalized[3], 0);
assert.equal(normalized[4], 0);
assert.equal(normalized[5], 0);

console.log('vectorSearchProvider tests passed');
