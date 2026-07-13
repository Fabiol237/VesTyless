/**
 * VeStyle — Validation Zod des patches Mistral
 * Chaque opération de Mistral est validée avant d'être appliquée.
 */

// Validation manuelle légère (sans dépendance Zod externe)
// Compatible avec Edge Runtime de Next.js

// ─── Validateurs de types de base ────────────────────────────────────────────
const isString  = v => typeof v === 'string';
const isNumber  = v => typeof v === 'number' && !isNaN(v);
const isBoolean = v => typeof v === 'boolean';
const isArray   = v => Array.isArray(v);
const isObject  = v => v !== null && typeof v === 'object' && !Array.isArray(v);

const isColor = v =>
  isString(v) && (
    /^#([0-9a-fA-F]{3,8})$/.test(v) ||
    v.startsWith('rgb') || v.startsWith('hsl') ||
    v === 'transparent' || v === 'currentColor'
  );

const isGradient = v => isString(v) && v.length < 500;
const isUrl      = v => isString(v) && v.length < 1000;
const isSlug     = v => isString(v) && /^[a-z0-9_-]+$/.test(v);

// ─── Validation d'une valeur de prop par type ──────────────────────────────
export function validatePropType(type, value, propDef = {}) {
  switch (type) {
    case 'string':        return isString(value) && value.length <= 2000;
    case 'number': {
      if (!isNumber(value)) return false;
      if (propDef.min !== undefined && value < propDef.min) return false;
      if (propDef.max !== undefined && value > propDef.max) return false;
      return true;
    }
    case 'boolean':       return isBoolean(value);
    case 'color':         return isColor(value);
    case 'gradient':      return isGradient(value);
    case 'url':           return isUrl(value);
    case 'cloudinary_url':return isUrl(value);
    case 'enum':          return isString(value) && (propDef.values || []).includes(value);
    case 'array':         return isArray(value) && value.length <= 200;
    case 'object':        return isObject(value);
    default:              return true;
  }
}

// ─── Validation du payload "add_block" ────────────────────────────────────
export function validateAddBlock(args, registry) {
  const errors = [];
  if (!isString(args.type))     errors.push('type doit être une string');
  if (!registry[args.type])     errors.push(`type "${args.type}" inconnu dans le registre`);
  if (args.position !== undefined && !isNumber(args.position)) errors.push('position doit être un nombre');
  if (args.config !== undefined && !isObject(args.config))     errors.push('config doit être un objet');

  if (args.config && registry[args.type]) {
    const propDefs = registry[args.type].props;
    for (const [key, value] of Object.entries(args.config)) {
      const propDef = propDefs[key];
      if (!propDef) continue; // prop inconnue ignorée silencieusement
      if (!validatePropType(propDef.type, value, propDef)) {
        errors.push(`config.${key}: valeur invalide pour le type "${propDef.type}"`);
      }
    }
  }
  return errors;
}

// ─── Validation du payload "update_block_props" ───────────────────────────
export function validateUpdateBlockProps(args, registry, existingModules) {
  const errors = [];
  if (!isString(args.blockId))  errors.push('blockId doit être une string');
  if (!isObject(args.props))    errors.push('props doit être un objet');

  const module = existingModules?.find(m => m.id === args.blockId);
  if (!module) errors.push(`blockId "${args.blockId}" non trouvé dans les modules`);

  if (module && registry[module.type]) {
    const propDefs = registry[module.type].props;
    for (const [key, value] of Object.entries(args.props || {})) {
      const propDef = propDefs[key];
      if (!propDef) continue;
      if (!validatePropType(propDef.type, value, propDef)) {
        errors.push(`props.${key}: valeur invalide pour le type "${propDef.type}"`);
      }
    }
  }
  return errors;
}

// ─── Validation du payload "remove_block" ────────────────────────────────
export function validateRemoveBlock(args, existingModules) {
  const errors = [];
  if (!isString(args.blockId)) errors.push('blockId doit être une string');
  const module = existingModules?.find(m => m.id === args.blockId);
  if (!module) errors.push(`blockId "${args.blockId}" non trouvé`);
  if (module?.type === 'vitrine' && existingModules?.filter(m => m.is_active).length <= 1) {
    errors.push('Impossible de supprimer le seul bloc actif');
  }
  return errors;
}

// ─── Validation du payload "reorder_blocks" ──────────────────────────────
export function validateReorderBlocks(args, existingModules) {
  const errors = [];
  if (!isArray(args.order))    errors.push('order doit être un tableau d\'IDs');
  const existingIds = existingModules?.map(m => m.id) || [];
  for (const id of (args.order || [])) {
    if (!isString(id))              errors.push(`order contient un ID non-string: ${id}`);
    if (!existingIds.includes(id))  errors.push(`ID "${id}" non trouvé dans les modules`);
  }
  return errors;
}

// ─── Validation du payload "update_theme" ────────────────────────────────
export function validateUpdateTheme(args) {
  const errors = [];
  const allowed = ['primaryColor','secondaryColor','accentColor','fontFamily','mode','bgColor','textColor'];
  for (const key of Object.keys(args)) {
    if (!allowed.includes(key)) errors.push(`Propriété theme inconnue: ${key}`);
  }
  if (args.primaryColor   && !isColor(args.primaryColor))   errors.push('primaryColor invalide');
  if (args.secondaryColor && !isColor(args.secondaryColor)) errors.push('secondaryColor invalide');
  if (args.accentColor    && !isColor(args.accentColor))    errors.push('accentColor invalide');
  if (args.bgColor        && !isColor(args.bgColor))        errors.push('bgColor invalide');
  if (args.textColor      && !isColor(args.textColor))      errors.push('textColor invalide');
  if (args.fontFamily     && !isString(args.fontFamily))    errors.push('fontFamily invalide');
  if (args.mode && !['light','dark'].includes(args.mode))   errors.push('mode doit être light ou dark');
  return errors;
}

// ─── Dispatcher de validation ─────────────────────────────────────────────
export function validateToolCall(toolName, args, registry, existingModules) {
  if (!isObject(args)) return ['args doit être un objet'];

  switch (toolName) {
    case 'add_block':          return validateAddBlock(args, registry);
    case 'update_block_props': return validateUpdateBlockProps(args, registry, existingModules);
    case 'remove_block':       return validateRemoveBlock(args, existingModules);
    case 'reorder_blocks':     return validateReorderBlocks(args, existingModules);
    case 'update_theme':       return validateUpdateTheme(args);
    default: return [`Outil inconnu: ${toolName}`];
  }
}
