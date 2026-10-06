/**
 * VesTyle V1 — Mistral AI Structured Action Protocol
 * ─────────────────────────────────────────────────────────────────────────────
 * Contrat d'actions structurées pour les modifications assistées par Mistral AI.
 * 
 * RÈGLE ABSOLUE :
 * Mistral ne produit JAMAIS de code source JavaScript/JSX direct.
 * Il produit des payloads d'actions typés validés par Zod et exécutés par VesTyle.
 */

import { z } from 'zod';

export const ActionTargetSchema = z.object({
  page: z.string().default('home'),
  section: z.string().optional(),
  slot: z.string().optional(),
  nodeId: z.string().optional(),
});

export const UpdateSlotActionSchema = z.object({
  action: z.literal('update_slot'),
  target: ActionTargetSchema,
  payload: z.object({
    property: z.string().default('content'),
    value: z.unknown(),
    label: z.string().optional(),
    actionType: z.string().optional(),
  }),
});

export const UpdateStyleActionSchema = z.object({
  action: z.literal('update_style'),
  target: ActionTargetSchema.optional(),
  payload: z.object({
    primaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    fontFamilyHeading: z.string().optional(),
    fontFamilyBody: z.string().optional(),
    isDark: z.boolean().optional(),
    borderRadius: z.string().optional(),
  }),
});

export const AddItemActionSchema = z.object({
  action: z.literal('add_item'),
  payload: z.object({
    itemType: z.enum(['PRODUCT', 'SERVICE', 'ROOM', 'DISH', 'COURSE', 'PROPERTY']),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    description: z.string().optional(),
    category: z.string().optional(),
    imageUrl: z.string().optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const UpdateSeoActionSchema = z.object({
  action: z.literal('update_seo'),
  payload: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

export const ReorderSectionsActionSchema = z.object({
  action: z.literal('reorder_sections'),
  target: z.object({ page: z.string().default('home') }),
  payload: z.object({
    sectionIdsInOrder: z.array(z.string()),
  }),
});

export const ToggleSectionActionSchema = z.object({
  action: z.literal('toggle_section'),
  target: z.object({ page: z.string().default('home'), section: z.string() }),
  payload: z.object({
    isEnabled: z.boolean(),
  }),
});

export const VesTyleStructuredActionSchema = z.discriminatedUnion('action', [
  UpdateSlotActionSchema,
  UpdateStyleActionSchema,
  AddItemActionSchema,
  UpdateSeoActionSchema,
  ReorderSectionsActionSchema,
  ToggleSectionActionSchema,
]);

export type VesTyleStructuredAction = z.infer<typeof VesTyleStructuredActionSchema>;

/**
 * Valide un payload brut d'action émis par Mistral.
 */
export function validateMistralAction(rawJson: unknown): {
  success: boolean;
  action?: VesTyleStructuredAction;
  error?: string;
} {
  try {
    const action = VesTyleStructuredActionSchema.parse(rawJson);
    return { success: true, action };
  } catch (err: any) {
    return {
      success: false,
      error: `Validation échouée pour l'action IA: ${err?.message || 'Format d’action invalide.'}`
    };
  }
}
