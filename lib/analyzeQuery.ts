export function isCompatibilityQuery(message: string): boolean {
  const msg = message.toLowerCase();
  const keywords = ["can i use", "together", "with", "combine", "mix", "same time", "compatible"];
  return keywords.some(k => msg.includes(k));
}

export function analyzeCompatibilityQuery(msg: string) {
  const ingredients = ["niacinamide", "vitamin c", "retinol"];
  const found = ingredients.filter(i => msg.includes(i));
  return {
    isCompatibilityQuery: found.length >= 2,
    ingredients: found,
    combination: found.sort().join(" + ")
  };
}

export function analyzeQuery(msg: string) {
  const lower = msg.toLowerCase();
  if (isCompatibilityQuery(lower)) {
    return { ...analyzeCompatibilityQuery(lower), isProductQuery: false };
  }

  const ingredients = ["niacinamide", "retinol", "vitamin c"];
  const foundIngredient = ingredients.find(i => lower.includes(i));

  const brands = ["cerave", "ordinary", "somethinc"];
  const foundBrand = brands.find(b => lower.includes(b));

  return {
    ingredient: foundIngredient,
    brand: foundBrand,
    isCompatibilityQuery: false,
    isProductQuery: !!foundIngredient || !!foundBrand,
  };
}
