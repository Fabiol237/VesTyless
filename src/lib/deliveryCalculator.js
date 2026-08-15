/**
 * VesTyle — Calculateur de Frais de Livraison par Quartier
 * Matrice tarifaire officielle des courses moto / livreurs pour Douala et Yaoundé.
 */

export const NEIGHBORHOODS_DOUALA = [
  { id: 'dla_akwa', name: 'Akwa (Centre)', zone: 'centre', fee: 1000, timeMin: '15-25 min' },
  { id: 'dla_bonapriso', name: 'Bonapriso', zone: 'centre', fee: 1000, timeMin: '15-30 min' },
  { id: 'dla_bonanjo', name: 'Bonanjo', zone: 'centre', fee: 1000, timeMin: '15-25 min' },
  { id: 'dla_deido', name: 'Deido / Bepanda', zone: 'nord', fee: 1200, timeMin: '20-35 min' },
  { id: 'dla_makepe', name: 'Makepe / Kotto', zone: 'est', fee: 1500, timeMin: '25-40 min' },
  { id: 'dla_logbaba', name: 'Ndogpassi / Logbaba', zone: 'sud', fee: 1500, timeMin: '30-45 min' },
  { id: 'dla_bonaberi', name: 'Bonaberi (Grand-Pont)', zone: 'ouest', fee: 2000, timeMin: '35-50 min' },
  { id: 'dla_yassa', name: 'Yassa / Japoma', zone: 'sud_est', fee: 2000, timeMin: '40-60 min' },
];

export const NEIGHBORHOODS_YAOUNDE = [
  { id: 'yde_bastos', name: 'Bastos', zone: 'nord', fee: 1000, timeMin: '15-25 min' },
  { id: 'yde_centre', name: 'Centre Ville / Hippodrome', zone: 'centre', fee: 1000, timeMin: '15-25 min' },
  { id: 'yde_omnisports', name: 'Omnisports / Nlongkak', zone: 'centre', fee: 1200, timeMin: '20-30 min' },
  { id: 'yde_tsinga', name: 'Tsinga / Mokolo', zone: 'ouest', fee: 1200, timeMin: '20-35 min' },
  { id: 'yde_biyemassi', name: 'Biyem-Assi / Mendong', zone: 'sud', fee: 1500, timeMin: '25-40 min' },
  { id: 'yde_jouvence', name: 'Jouvence / Nsam', zone: 'sud', fee: 1500, timeMin: '30-45 min' },
  { id: 'yde_odza', name: 'Odza / Tropicana', zone: 'sud_est', fee: 2000, timeMin: '35-50 min' },
  { id: 'yde_emana', name: 'Emana / Messassi', zone: 'nord_est', fee: 2000, timeMin: '35-50 min' },
];

/**
 * Calcule l'estimation du tarif de livraison en fonction de la ville et du quartier du client.
 * @param {string} city - 'Douala' ou 'Yaoundé'
 * @param {string} neighborhoodId - ID du quartier
 * @returns {Object} - { fee: number, timeMin: string, name: string }
 */
export function estimateDelivery(city = 'Douala', neighborhoodId = '') {
  const isYde = (city || '').toLowerCase().includes('yaound');
  const list = isYde ? NEIGHBORHOODS_YAOUNDE : NEIGHBORHOODS_DOUALA;

  const found = list.find(n => n.id === neighborhoodId || n.name.toLowerCase().includes((neighborhoodId || '').toLowerCase()));

  if (found) {
    return {
      fee: found.fee,
      timeMin: found.timeMin,
      name: found.name,
      formattedFee: new Intl.NumberFormat('fr-FR').format(found.fee) + ' FCFA',
    };
  }

  // Tarif moyen par défaut
  return {
    fee: 1500,
    timeMin: '25-40 min',
    name: 'Autre Quartier',
    formattedFee: '1 500 FCFA',
  };
}
