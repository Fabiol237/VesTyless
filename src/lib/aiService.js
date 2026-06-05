/**
 * aiService.js
 * 
 * La recherche visuelle est maintenant entièrement gérée côté serveur
 * via l'API Cohere (endpoint /api/search/visual).
 * Le chatbot utilise Mistral AI (endpoint /api/chat).
 * 
 * Ce fichier est conservé pour compatibilité mais n'est plus utilisé
 * par VisualSearchModal.js.
 * 
 * Ancien modèle : Xenova/clip-vit-base-patch32 (150 Mo, local)
 * Nouveau modèle : Cohere embed-english-v3.0 (serveur, 0 Mo client)
 */

export const getAIExtractor = async () => {
  console.warn('[aiService] getAIExtractor est déprécié. La recherche visuelle utilise maintenant Cohere API côté serveur.');
  return null;
};
