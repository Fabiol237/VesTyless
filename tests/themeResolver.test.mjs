import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveThemeConfig } from '../src/lib/themeResolver.mjs';

test('resolveThemeConfig prefers the current theme values and keeps a coherent fallback', () => {
  const resolved = resolveThemeConfig({
    themeId: 'theme_01',
    preset: {
      id: 'theme_01',
      primaryColor: '#0A0A0A',
      accentColor: '#C9A84C',
      bgColor: '#FAF8F5',
      font: 'Playfair Display',
    },
    rawTheme: {
      primaryColor: '#123456',
      accentColor: '#654321',
      secondaryColor: '#abcdef',
      fontFamily: 'Inter',
      mode: 'dark',
      _themeId: 'theme_01',
    },
    store: {
      theme_color: '#111111',
      accent_color: '#222222',
      secondary_color: '#333333',
      font_family: 'Roboto',
      theme_mode: 'light',
      shop_theme: 'theme_02',
    },
  });

  assert.equal(resolved._themeId, 'theme_01');
  assert.equal(resolved.primaryColor, '#123456');
  assert.equal(resolved.accentColor, '#654321');
  assert.equal(resolved.secondaryColor, '#abcdef');
  assert.equal(resolved.fontFamily, 'Inter');
  assert.equal(resolved.mode, 'dark');
});
