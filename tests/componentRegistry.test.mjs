import test from 'node:test';
import assert from 'node:assert/strict';
import { componentRegistry, COMPONENT_FAMILIES } from '../src/lib/component-registry/ComponentRegistry.js';

test('ComponentRegistry registers and retrieves components by ID and family', () => {
  componentRegistry.register({
    id: 'header_custom_test',
    type: COMPONENT_FAMILIES.HEADER,
    variant: 'centered',
    defaultConfig: { title: 'Test Store' },
  });

  const retrieved = componentRegistry.get('header_custom_test');
  assert.equal(retrieved.id, 'header_custom_test');
  assert.equal(retrieved.type, 'HEADER');
  assert.equal(retrieved.defaultConfig.title, 'Test Store');

  const headers = componentRegistry.getByFamily(COMPONENT_FAMILIES.HEADER);
  assert.equal(headers.some(h => h.id === 'header_custom_test'), true);
});

test('ComponentRegistry checks business type compatibility correctly', () => {
  componentRegistry.register({
    id: 'resto_menu_block',
    type: 'MENU',
    compatibilityRules: {
      businessTypes: ['restaurant', 'hybrid'],
    },
  });

  assert.equal(componentRegistry.isCompatible('resto_menu_block', 'restaurant'), true);
  assert.equal(componentRegistry.isCompatible('resto_menu_block', 'retail'), false);
});
