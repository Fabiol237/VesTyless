import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStoreModules } from '../src/lib/storeModuleUtils.mjs';

test('normalizeStoreModules removes duplicate module types and reindexes positions', () => {
  const modules = [
    { id: 'a', type: 'vitrine', position: 2, is_active: true, config: { foo: 'bar' } },
    { id: 'b', type: 'catalogue', position: 0, is_active: true, config: { foo: 'baz' } },
    { id: 'c', type: 'vitrine', position: 1, is_active: false, config: { foo: 'qux' } },
    { id: 'd', type: 'contact', position: 3, is_active: true, config: {} },
  ];

  const normalized = normalizeStoreModules(modules);

  assert.equal(normalized.length, 3);
  assert.deepEqual(normalized.map((module) => module.type), ['catalogue', 'vitrine', 'contact']);
  assert.deepEqual(normalized.map((module) => module.position), [0, 1, 2]);
  assert.equal(normalized.find((module) => module.type === 'vitrine').id, 'a');
  assert.equal(normalized.find((module) => module.type === 'vitrine').is_active, true);
});

test('normalizeStoreModules keeps the active duplicate when one entry is disabled', () => {
  const modules = [
    { id: 'first', type: 'services', position: 0, is_active: false, config: {} },
    { id: 'second', type: 'services', position: 1, is_active: true, config: { enabled: true } },
  ];

  const normalized = normalizeStoreModules(modules);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].id, 'second');
  assert.equal(normalized[0].is_active, true);
});
