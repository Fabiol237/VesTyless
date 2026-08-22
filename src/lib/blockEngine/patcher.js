/**
 * VesTyle — Block Engine : Patcher
 * CRUD sur les listes de blocs. Extension de l'ancien blockPatcher.js
 * compatible avec le nouveau format { type, variant, settings, content }.
 */
import { BLOCK_REGISTRY, createBlockInstance, getDefaultBlockConfig } from './registry';
import { sanitizeBlock, sanitizeSettings, sanitizeContent } from './validators';

// ─── CREATE ──────────────────────────────────────────────────────────────────

/**
 * Crée un nouveau bloc avec config par défaut + overrides.
 */
export function createBlock(type, overrides = {}, position = 0) {
  const block = createBlockInstance(type, overrides);
  return { ...block, position };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Trouve un bloc par ID dans la liste.
 */
export function findBlock(blocks, id) {
  return blocks.find(b => b.id === id) || null;
}

/**
 * Trouve un bloc par type (retourne le premier trouvé).
 */
export function findBlockByType(blocks, type) {
  return blocks.find(b => b.type === type) || null;
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Insère un bloc dans la liste à la position donnée.
 * Recalcule les positions automatiquement.
 */
export function insertBlock(blocks, newBlock, position) {
  const pos = position ?? blocks.length;
  const updated = [...blocks];
  updated.splice(pos, 0, { ...newBlock, position: pos });
  return recalculatePositions(updated);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Met à jour les settings d'un bloc par ID.
 */
export function updateBlockSettings(blocks, blockId, newSettings) {
  return blocks.map(b => {
    if (b.id !== blockId) return b;
    return {
      ...b,
      settings: { ...(b.settings || {}), ...newSettings },
    };
  });
}

/**
 * Met à jour le content d'un bloc par ID.
 */
export function updateBlockContent(blocks, blockId, newContent) {
  return blocks.map(b => {
    if (b.id !== blockId) return b;
    return {
      ...b,
      content: { ...(b.content || {}), ...newContent },
    };
  });
}

/**
 * Met à jour le variant d'un bloc.
 */
export function updateBlockVariant(blocks, blockId, variant) {
  return blocks.map(b => {
    if (b.id !== blockId) return b;
    const def = BLOCK_REGISTRY[b.type];
    const validVariant = def?.variants?.includes(variant) ? variant : b.variant;
    return { ...b, variant: validVariant };
  });
}

/**
 * Active ou désactive un bloc.
 */
export function toggleBlock(blocks, blockId, enabled) {
  return blocks.map(b =>
    b.id === blockId ? { ...b, enabled: enabled ?? !b.enabled } : b
  );
}

/**
 * Applique des props génériques sur un bloc (rétrocompat avec ancien blockPatcher).
 * Détecte automatiquement si c'est settings ou content.
 */
export function applyPropsToBlock(blocks, blockId, props) {
  return blocks.map(b => {
    if (b.id !== blockId) return b;
    const def = BLOCK_REGISTRY[b.type];
    if (!def) return { ...b, settings: { ...(b.settings || {}), ...props } };

    const settingsKeys = new Set(Object.keys(def.settings || {}));
    const contentKeys  = new Set(Object.keys(def.content  || {}));

    const newSettings = {};
    const newContent  = {};
    const unknown     = {};

    Object.entries(props).forEach(([key, val]) => {
      if (settingsKeys.has(key))     newSettings[key] = val;
      else if (contentKeys.has(key)) newContent[key]  = val;
      else                           unknown[key]     = val;
    });

    return {
      ...b,
      settings: { ...(b.settings || {}), ...newSettings, ...unknown },
      content:  { ...(b.content  || {}), ...newContent  },
    };
  });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Supprime un bloc par ID et recalcule les positions.
 */
export function removeBlock(blocks, blockId) {
  return recalculatePositions(blocks.filter(b => b.id !== blockId));
}

// ─── REORDER ──────────────────────────────────────────────────────────────────

/**
 * Réordonne les blocs selon un tableau d'IDs ordonnés.
 */
export function reorderBlocks(blocks, orderedIds) {
  const map = Object.fromEntries(blocks.map(b => [b.id, b]));
  return orderedIds
    .filter(id => map[id])
    .map((id, i) => ({ ...map[id], position: i }));
}

/**
 * Déplace un bloc d'une position à une autre.
 */
export function moveBlock(blocks, blockId, newPosition) {
  const current = blocks.find(b => b.id === blockId);
  if (!current) return blocks;
  const without = blocks.filter(b => b.id !== blockId);
  without.splice(newPosition, 0, current);
  return recalculatePositions(without);
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────

/**
 * Recalcule les positions (0, 1, 2...) d'une liste de blocs.
 */
function recalculatePositions(blocks) {
  return blocks.map((b, i) => ({ ...b, position: i }));
}

/**
 * Trie les blocs par position croissante.
 */
export function sortByPosition(blocks) {
  return [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/**
 * Duplique un bloc avec un nouvel ID.
 */
export function duplicateBlock(blocks, blockId) {
  const original = blocks.find(b => b.id === blockId);
  if (!original) return blocks;

  const copy = {
    ...original,
    id: `block_${original.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    position: original.position + 1,
    created_at: new Date().toISOString(),
  };

  return recalculatePositions(insertBlock(blocks, copy, original.position + 1));
}

// ─── TOOL CALLS (compatibilité Mistral/AI) ────────────────────────────────────

/**
 * Applique un tool_call AI sur la liste de blocs.
 * Retourne { updatedBlocks, affectedIds, description }
 */
export function applyToolCall(toolName, args, blocks, themeConfig = {}) {
  switch (toolName) {

    case 'add_block': {
      const newBlock = createBlock(args.type, {
        variant:  args.variant,
        settings: args.settings || {},
        content:  args.content  || {},
      }, args.position ?? blocks.length);
      const updated = insertBlock(blocks, newBlock, args.position);
      return {
        updatedBlocks: updated,
        affectedIds:   [newBlock.id],
        themeConfig,
        description:   `Ajout d'un bloc "${BLOCK_REGISTRY[args.type]?.label || args.type}"`,
      };
    }

    case 'update_block_settings': {
      const updated = updateBlockSettings(blocks, args.blockId, args.settings || {});
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: 'Mise à jour des settings' };
    }

    case 'update_block_content': {
      const updated = updateBlockContent(blocks, args.blockId, args.content || {});
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: 'Mise à jour du contenu' };
    }

    // Compatibilité ancien format
    case 'update_block_props': {
      const updated = applyPropsToBlock(blocks, args.blockId, args.props || {});
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: 'Mise à jour des propriétés' };
    }

    case 'update_block_variant': {
      const updated = updateBlockVariant(blocks, args.blockId, args.variant);
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: `Variant changé en "${args.variant}"` };
    }

    case 'remove_block': {
      const updated = removeBlock(blocks, args.blockId);
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: 'Suppression du bloc' };
    }

    case 'reorder_blocks': {
      const updated = reorderBlocks(blocks, args.order);
      return { updatedBlocks: updated, affectedIds: args.order, themeConfig, description: 'Réorganisation des blocs' };
    }

    case 'toggle_block': {
      const updated = toggleBlock(blocks, args.blockId, args.enabled);
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: `Bloc ${args.enabled ? 'activé' : 'désactivé'}` };
    }

    case 'duplicate_block': {
      const updated = duplicateBlock(blocks, args.blockId);
      return { updatedBlocks: updated, affectedIds: [args.blockId], themeConfig, description: 'Bloc dupliqué' };
    }

    case 'update_theme': {
      return { updatedBlocks: blocks, affectedIds: [], themeConfig: { ...themeConfig, ...args }, description: 'Thème mis à jour' };
    }

    default:
      throw new Error(`[BlockPatcher] Tool call inconnu: "${toolName}"`);
  }
}
