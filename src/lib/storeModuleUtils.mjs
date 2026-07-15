export function normalizeStoreModules(modules = []) {
  const sortedModules = [...modules]
    .filter(Boolean)
    .filter((module) => module && module.type)
    .sort((a, b) => {
      const aPosition = typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER;
      const bPosition = typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER;
      return aPosition - bPosition;
    });

  const deduped = [];

  for (const module of sortedModules) {
    const existingIndex = deduped.findIndex((entry) => entry.type === module.type);
    if (existingIndex !== -1) {
      const existing = deduped[existingIndex];
      if (existing.is_active === false && module.is_active !== false) {
        deduped[existingIndex] = {
          ...module,
          position: existing.position,
          is_active: module.is_active !== false,
        };
      }
      continue;
    }

    deduped.push({
      ...module,
      position: deduped.length,
      is_active: module.is_active !== false,
    });
  }

  return deduped.map((module, index) => ({
    ...module,
    position: index,
  }));
}
