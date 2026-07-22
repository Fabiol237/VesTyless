export function resolveThemeConfig({
  themeId,
  preset,
  rawTheme,
  store,
  fallback = {},
} = {}) {
  const baseTheme = preset || rawTheme || fallback || {};
  const resolvedThemeId = themeId || rawTheme?._themeId || store?.shop_theme || baseTheme.id || 'theme_00';

  const primaryColor = rawTheme?.primaryColor
    || store?.theme_color
    || baseTheme.primaryColor
    || fallback.primaryColor
    || '#6366f1';

  const accentColor = rawTheme?.accentColor
    || store?.accent_color
    || baseTheme.accentColor
    || fallback.accentColor
    || primaryColor;

  const secondaryColor = rawTheme?.secondaryColor
    || store?.secondary_color
    || baseTheme.secondaryColor
    || baseTheme.bgColor
    || fallback.secondaryColor
    || '#ffffff';

  const fontFamily = rawTheme?.fontFamily
    || store?.font_family
    || baseTheme.fontFamily
    || baseTheme.font
    || fallback.fontFamily
    || 'Inter';

  const mode = rawTheme?.mode
    || store?.theme_mode
    || baseTheme.mode
    || fallback.mode
    || 'light';

  return {
    _themeId: resolvedThemeId,
    primaryColor,
    accentColor,
    secondaryColor,
    fontFamily,
    mode,
    ...rawTheme,
    ...baseTheme,
    ...fallback,
    primaryColor,
    accentColor,
    secondaryColor,
    fontFamily,
    mode,
  };
}
