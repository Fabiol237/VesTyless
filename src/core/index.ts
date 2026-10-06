/**
 * VesTyle / Vestin — Unified Design Core Index (v3.0 — Phase 2C)
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'accès unique au noyau unifié de Vestin :
 * - Contrats canoniques & Schémas Zod (DesignDefinition, VisualNodeTree, ContentBinding)
 * - Registre universel des designs (IDesignRegistry, LocalDesignRegistry, designRegistry)
 * - Moteur d'adaptation déterministe (VestinAdaptationEngine)
 * - Mapping Onboarding → Design canonique (OnboardingDesignMapper) [Phase 2C]
 * - Les 6 Master Designs canoniques (001 à 006)
 */

export * from './contracts/designDefinition';
export * from './registry/IDesignRegistry';
export * from './registry/LocalDesignRegistry';
export * from './adaptation/VestinAdaptationEngine';
export * from './onboarding/OnboardingDesignMapper';

// Les 6 Master Designs fondateurs
export * from './designs/vst_dsn_prestige_atelier_001';
export * from './designs/vst_dsn_resto_terroir_002';
export * from './designs/vst_dsn_services_vip_003';
export * from './designs/vst_dsn_agro_elevage_004';
export * from './designs/vst_dsn_location_standing_005';
export * from './designs/vst_dsn_commerce_librairie_006';
