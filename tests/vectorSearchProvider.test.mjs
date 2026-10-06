import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmbedding } from '../src/lib/vectorSearchProvider.mjs';

test('normalizeEmbedding calculates L2 unit norm correctly', () => {
  const embedding = [3, 4, 0];
  const normalized = normalizeEmbedding(embedding);

  assert.ok(Array.isArray(normalized));
  assert.equal(normalized.length, 3);
  assert.equal(normalized[0], 0.6);
  assert.equal(normalized[1], 0.8);
  assert.equal(normalized[2], 0);

  // Vérification de la norme unitaire L2 : 0.6^2 + 0.8^2 = 0.36 + 0.64 = 1
  const norm = Math.sqrt(normalized.reduce((s, v) => s + v * v, 0));
  assert.equal(Math.round(norm), 1);
});
