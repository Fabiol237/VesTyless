import { Meilisearch } from 'meilisearch';

// Client avec tous les droits (Master Key) - UTILISER UNIQUEMENT CÔTÉ SERVEUR OU DASHBOARD PRIVÉ
export const adminClient = new Meilisearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
});

// Client avec droits de recherche uniquement (Search Key) - SÉCURISÉ POUR LE FRONTEND PUBLIC
export const searchClient = new Meilisearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
});

export const productsIndex = adminClient.index('products');
export const storesIndex = adminClient.index('stores');
export const publicProductsIndex = searchClient.index('products');
export const publicStoresIndex = searchClient.index('stores');

export default adminClient;
