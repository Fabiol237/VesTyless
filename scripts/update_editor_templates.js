const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/builder/[storeId]/BuilderEditor.js');
let content = fs.readFileSync(file, 'utf8');

// Ensure loadTemplate is extracted
content = content.replace(/const \{ state, addModule, removeModule, toggleModule, setActiveModule, setTheme, updateModuleConfig, updateModuleLabel \} = useBuilder\(\);/, "const { state, addModule, removeModule, toggleModule, setActiveModule, setTheme, updateModuleConfig, updateModuleLabel, loadTemplate } = useBuilder();");

// Replace the Theme tab rendering
const oldThemeSectionRegex = /\{THEME_PRESETS\.map\(preset => \{[\s\S]*?\}\)\}/m;
const newThemeSection = `{THEME_PRESETS.map(preset => {
                const isSelected = state.themeConfig?.primaryColor === preset.primary;
                return (
                  <div key={preset.id} style={{
                      padding: '12px', borderRadius: '12px', border: \`2px solid \${isSelected ? preset.primary : '#d1d7db'}\`,
                      background: isSelected ? \`\${preset.primary}15\` : '#ffffff',
                      textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                    <button onClick={() => setTheme({ primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, fontFamily: preset.font, mode: preset.mode })}
                      style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                          <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#111b21' }}>{preset.name}</div>
                      <div style={{ fontSize: '10px', color: '#54656f', marginTop: '2px' }}>Modèle: {preset.defaultModules?.length || 0} pages</div>
                    </button>
                    {preset.defaultModules && (
                      <button onClick={() => loadTemplate(preset.defaultModules, { primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, fontFamily: preset.font, mode: preset.mode })}
                        style={{ padding: '6px', background: '#e9edef', color: '#111b21', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                        Appliquer la structure
                      </button>
                    )}
                  </div>
                );
              })}`;

content = content.replace(oldThemeSectionRegex, newThemeSection);

fs.writeFileSync(file, content);
console.log('Update editor templates complete');
