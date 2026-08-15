import Papa from 'papaparse';

/**
 * VesTyle — Helper CSV (PapaParse)
 * Permet aux vendeurs d'exporter et d'importer leur catalogue de produits en masse via CSV.
 */

/**
 * Exporte un tableau d'objets (ex: produits ou commandes) au format CSV et déclenche le téléchargement.
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier téléchargé (ex: 'catalogue_vestyle.csv')
 */
export function exportToCSV(data, filename = 'catalogue_vestyle.csv') {
  if (!data || data.length === 0) return false;

  const csv = Papa.unparse(data, {
    header: true,
    delimiter: ';', // Délimiteur point-virgule idéal pour Excel en français
  });

  // Ajouter le BOM UTF-8 pour la prise en charge correcte des accents sous Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Analyse un fichier CSV importé par le vendeur et retourne un tableau d'objets JSON.
 * @param {File} file - Fichier CSV sélectionné
 * @returns {Promise<Array>} - Tableau des produits analysés
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn('[PapaParse] Avertissements lors du parsing CSV:', results.errors);
        }

        // Normaliser les clés (nom, price, description, etc.)
        const normalized = results.data.map(row => {
          const keys = Object.keys(row);
          const getVal = (possibleKeys) => {
            const foundKey = keys.find(k => possibleKeys.some(pk => k.toLowerCase().trim() === pk.toLowerCase()));
            return foundKey ? row[foundKey] : null;
          };

          return {
            name: getVal(['name', 'nom', 'produit', 'title', 'nom du produit']) || 'Nouveau Produit',
            price: Number(getVal(['price', 'prix', 'montant', 'tarif']) || 0),
            original_price: Number(getVal(['original_price', 'old_price', 'ancien prix', 'prix original']) || 0) || null,
            category: getVal(['category', 'catégorie', 'categorie', 'type']) || 'Mode & Beauté',
            description: getVal(['description', 'details', 'détails', 'info']) || '',
            image_url: getVal(['image_url', 'image', 'photo', 'url_image']) || '',
            stock_quantity: Number(getVal(['stock', 'stock_quantity', 'quantité', 'quantite']) || 1),
            is_active: true,
          };
        });

        resolve(normalized);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}
