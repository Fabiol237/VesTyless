/**
 * aiService.js
 * 
 * La recherche visuelle est maintenant entièrement gérée côté serveur
 * via l'API Gemini (endpoint /api/search/visual).
 * 
 * Ce fichier est conservé pour compatibilité mais n'est plus utilisé
 * par VisualSearchModal.js.
 * 
 * Ancien modèle : Xenova/clip-vit-base-patch32 (150 Mo, local)
 * Nouveau modèle : gemini-1.5-flash vision (serveur, 0 Mo client)
 */

export const getAIExtractor = async () => {
  console.warn('[aiService] getAIExtractor est déprécié. La recherche visuelle utilise maintenant Gemini API côté serveur.');
  return null;
};
