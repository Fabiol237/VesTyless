/**
 * VesTyle — Block Engine : Validators
 * Validation des configurations de blocs.
 */
import { BLOCK_REGISTRY, validatePropValue } from './registry';

/**
 * Valide et sanitize les settings d'un bloc.
 * Retourne les settings avec les valeurs invalides remplacées par les défauts.
 */
export function sanitizeSettings(type, settings = {}) {
  const def = BLOCK_REGISTRY[type];
  if (!def) return settings;

  const schemaDef = def.settings || {};
  const sanitized = {};

  // Applique les valeurs par défaut d'abord
  Object.entries(schemaDef).forEach(([key, propDef]) => {
    sanitized[key] = propDef.default;
  });

  // Remplace par les valeurs fournies si valides
  Object.entries(settings).forEach(([key, value]) => {
    const propDef = schemaDef[key];
    if (!propDef) {
      sanitized[key] = value; // Conserver les props custom inconnues
      return;
    }
    if (validatePropValue(propDef, value)) {
      sanitized[key] = value;
    }
    // Sinon on garde la valeur par défaut
  });

  return sanitized;
}

/**
 * Valide et sanitize le content d'un bloc.
 */
export function sanitizeContent(type, content = {}) {
  const def = BLOCK_REGISTRY[type];
  if (!def) return content;

  const schemaDef = def.content || {};
  const sanitized = {};

  // Applique les valeurs par défaut d'abord
  Object.entries(schemaDef).forEach(([key, propDef]) => {
    sanitized[key] = propDef.default;
  });

  // Remplace par les valeurs fournies si valides
  Object.entries(content).forEach(([key, value]) => {
    const propDef = schemaDef[key];
    if (!propDef) {
      sanitized[key] = value;
      return;
    }
    if (validatePropValue(propDef, value)) {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Valide un bloc complet.
 * Retourne { valid: boolean, errors: string[] }
 */
export function validateBlock(block) {
  const errors = [];

  if (!block) {
    return { valid: false, errors: ['Bloc manquant'] };
  }

  if (!block.type) {
    errors.push('Champ "type" requis');
  } else if (!BLOCK_REGISTRY[block.type]) {
    errors.push(`Type de bloc inconnu: "${block.type}"`);
  }

  if (typeof block.enabled !== 'boolean') {
    errors.push('"enabled" doit être un booléen');
  }

  if (typeof block.position !== 'number') {
    errors.push('"position" doit être un nombre');
  }

  const def = BLOCK_REGISTRY[block.type];
  if (def && block.variant && !def.variants?.includes(block.variant)) {
    errors.push(`Variant "${block.variant}" invalide pour le type "${block.type}". Variants disponibles: ${def.variants.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un tableau de blocs complet.
 */
export function validateBlockList(blocks) {
  if (!Array.isArray(blocks)) {
    return { valid: false, errors: ['La liste de blocs doit être un tableau'] };
  }

  const allErrors = [];
  blocks.forEach((block, index) => {
    const { errors } = validateBlock(block);
    if (errors.length > 0) {
      allErrors.push(`Bloc[${index}] (${block?.type || '?'}): ${errors.join(', ')}`);
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Sanitize un bloc complet (type + variant + settings + content).
 */
export function sanitizeBlock(block) {
  if (!block || !block.type) return block;

  const def = BLOCK_REGISTRY[block.type];
  if (!def) return block;

  // Valider le variant
  const variant = def.variants?.includes(block.variant)
    ? block.variant
    : (def.defaultVariant || def.variants?.[0] || 'default');

  return {
    ...block,
    variant,
    settings: sanitizeSettings(block.type, block.settings || {}),
    content:  sanitizeContent(block.type,  block.content  || {}),
  };
}
