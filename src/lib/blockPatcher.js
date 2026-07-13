/**
 * VeStyle — Block Patcher
 * Applique des patches JSON sur la config des modules de façon sécurisée.
 */
import { COMPONENT_REGISTRY, getDefaultConfig, sanitizeBlockConfig } from './componentRegistry';

/**
 * Applique les props sur un module existant, sans écraser les props non mentionnées.
 */
export function applyPropsToModule(module, newProps) {
  return {
    ...module,
    config: {
      ...(module.config || {}),
      ...newProps,
    },
  };
}

/**
 * Insère un nouveau bloc dans la liste à la position donnée.
 */
export function insertBlock(modules, newBlock, position) {
  const pos = position ?? modules.length;
  const updated = [...modules];
  updated.splice(pos, 0, newBlock);
  // Recalculer les positions
  return updated.map((m, i) => ({ ...m, position: i }));
}

/**
 * Supprime un bloc de la liste par ID.
 */
export function removeBlock(modules, blockId) {
  return modules
    .filter(m => m.id !== blockId)
    .map((m, i) => ({ ...m, position: i }));
}

/**
 * Réordonne les blocs selon un tableau d'IDs.
 */
export function reorderBlocks(modules, orderedIds) {
  const moduleMap = Object.fromEntries(modules.map(m => [m.id, m]));
  return orderedIds
    .filter(id => moduleMap[id])
    .map((id, i) => ({ ...moduleMap[id], position: i }));
}

/**
 * Crée un nouveau bloc avec config par défaut + config override.
 */
export function createBlock(type, config = {}, position = 0) {
  const def = COMPONENT_REGISTRY[type];
  if (!def) throw new Error(`Type de bloc inconnu: ${type}`);

  const defaultConfig = getDefaultConfig(type);
  const mergedConfig  = sanitizeBlockConfig(type, { ...defaultConfig, ...config });

  return {
    id: `block_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    label: def.label,
    position,
    is_active: true,
    config: mergedConfig,
    block_version: 1,
    created_at: new Date().toISOString(),
  };
}

/**
 * Applique un tool_call Mistral validé sur la liste de modules.
 * Retourne { updatedModules, affectedIds, description }
 */
export function applyToolCall(toolName, args, modules, themeConfig = {}) {
  switch (toolName) {

    case 'add_block': {
      const newBlock = createBlock(args.type, args.config || {}, args.position ?? modules.length);
      const updated  = insertBlock(modules, newBlock, args.position);
      return {
        updatedModules: updated,
        affectedIds: [newBlock.id],
        themeConfig,
        description: `Ajout d'un bloc "${COMPONENT_REGISTRY[args.type]?.label || args.type}"`,
      };
    }

    case 'update_block_props': {
      const updated = modules.map(m =>
        m.id === args.blockId ? applyPropsToModule(m, args.props) : m
      );
      return {
        updatedModules: updated,
        affectedIds: [args.blockId],
        themeConfig,
        description: `Mise à jour des propriétés du bloc`,
      };
    }

    case 'remove_block': {
      const updated = removeBlock(modules, args.blockId);
      return {
        updatedModules: updated,
        affectedIds: [args.blockId],
        themeConfig,
        description: `Suppression du bloc`,
      };
    }

    case 'reorder_blocks': {
      const updated = reorderBlocks(modules, args.order);
      return {
        updatedModules: updated,
        affectedIds: args.order,
        themeConfig,
        description: `Réorganisation des blocs`,
      };
    }

    case 'update_theme': {
      const newTheme = { ...themeConfig, ...args };
      return {
        updatedModules: modules,
        affectedIds: [],
        themeConfig: newTheme,
        description: `Mise à jour du thème`,
      };
    }

    default:
      throw new Error(`Tool call inconnu: ${toolName}`);
  }
}
