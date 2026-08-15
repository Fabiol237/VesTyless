export function normalizeStoreModules(modules = []) {
  const sortedModules = [...modules]
    .filter(Boolean)
    .filter((modItem) => modItem && modItem.type)
    .sort((a, b) => {
      const aPosition = typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER;
      const bPosition = typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER;
      return aPosition - bPosition;
    });

  const deduped = [];

  for (const modItem of sortedModules) {
    const existingIndex = deduped.findIndex((entry) => entry.type === modItem.type);
    if (existingIndex !== -1) {
      const existing = deduped[existingIndex];
      if (existing.is_active === false && modItem.is_active !== false) {
        deduped[existingIndex] = {
          ...modItem,
          position: existing.position,
          is_active: modItem.is_active !== false,
        };
      }
      continue;
    }

    deduped.push({
      ...modItem,
      position: deduped.length,
      is_active: modItem.is_active !== false,
    });
  }

  return deduped;
}
