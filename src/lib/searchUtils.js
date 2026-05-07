/**
 * Supprime les accents et met en minuscule
 */
export function normalizeStr(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Score de correspondance floue entre 0 et 1
 * Gère les accents et les fautes légères
 */
export function fuzzyScore(query, target) {
  const q = normalizeStr(query);
  const t = normalizeStr(target);
  if (!q || !t) return 0;
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.95;
  if (t.includes(q)) return 0.9;

  // Correspondance mot par mot
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const matched = words.filter(w => t.includes(w)).length;
    if (matched > 0) return (matched / words.length) * 0.8;
  }

  // Correspondance caractère par caractère (tolérance de fautes)
  let qi = 0, consecutive = 0, lastMatch = -1;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (lastMatch === i - 1) consecutive++;
      lastMatch = i;
      qi++;
    }
  }
  if (qi < q.length) return 0;
  return 0.3 + (consecutive / q.length) * 0.4;
}

/**
 * Filtre et trie un tableau de suggestions par score de correspondance
 */
export function getSuggestions(query, items, maxResults = 7) {
  if (!query || !query.trim()) return [];
  return items
    .map(s => ({ ...s, score: fuzzyScore(query, s.label) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
