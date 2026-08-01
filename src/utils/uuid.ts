export const matchUUID = (id1?: string, id2?: string): boolean => {
  if (!id1 || !id2) return false;
  if (id1.toLowerCase() === id2.toLowerCase()) return true;

  const flip = (s: string) => {
    let res = '';
    for (let i = s.length - 2; i >= 0; i -= 2) {
      res += s.substring(i, i + 2);
    }
    return res;
  };

  const flipUUID = (id: string) => {
    const parts = id.split('-');
    if (parts.length !== 5) return id;
    return `${flip(parts[0])}-${flip(parts[1])}-${flip(parts[2])}-${parts[3]}-${parts[4]}`;
  };

  return flipUUID(id1).toLowerCase() === id2.toLowerCase();
};

export const getCategoryFromMap = (categoryId: string, categories: Record<string, any>) => {
  if (!categoryId) return undefined;
  if (categories[categoryId]) return categories[categoryId];
  
  // Try case-insensitive exact match
  for (const key of Object.keys(categories)) {
    if (key.toLowerCase() === categoryId.toLowerCase()) {
      return categories[key];
    }
  }

  // Try flipped
  const flip = (s: string) => {
    let res = '';
    for (let i = s.length - 2; i >= 0; i -= 2) {
      res += s.substring(i, i + 2);
    }
    return res;
  };
  
  const parts = categoryId.split('-');
  if (parts.length === 5) {
    const flipped = `${flip(parts[0])}-${flip(parts[1])}-${flip(parts[2])}-${parts[3]}-${parts[4]}`;
    if (categories[flipped]) return categories[flipped];
    
    // Try case-insensitive flipped
    for (const key of Object.keys(categories)) {
      if (key.toLowerCase() === flipped.toLowerCase()) {
        return categories[key];
      }
    }
  }
  
  return undefined;
};
