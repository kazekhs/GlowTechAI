import { SKINCARE_KNOWLEDGE } from "@/lib/knowledge";
import { analyzeQuery } from "@/lib/analyzeQuery";
import { searchByIngredient, searchSkincareAPI } from "@/lib/searchSkincareAPI";

// bantu TypeScript tahu key-nya apa aja
type ComboKey = keyof typeof SKINCARE_KNOWLEDGE.combinations;

export async function handleMessage(message: string) {
  const analysis = analyzeQuery(message);

  if (
    analysis.isCompatibilityQuery &&
    "combination" in analysis &&
    analysis.combination &&
    (analysis.combination in SKINCARE_KNOWLEDGE.combinations)
  ) {
    const key = analysis.combination as ComboKey;
    const combo = SKINCARE_KNOWLEDGE.combinations[key];
    let response = `🧪 Compatibility: ${key.toUpperCase()}\n\n`;

    response += `${combo.compatible ? "✅ Compatible" : "❌ Not Recommended"}\n\n`;
    response += `📖 Explanation: ${combo.explanation}\n`;

    return response;
  }

  if (analysis.isProductQuery) {
    let results: any[] = [];

    if ("ingredient" in analysis && analysis.ingredient) {
      results = await searchByIngredient(analysis.ingredient) ?? [];
    } else if ("brand" in analysis && analysis.brand) {
      results = await searchSkincareAPI(analysis.brand) ?? [];
    }

    if (results.length) {
      return results.map((p, i) => `${i + 1}. ${p.brand} - ${p.name}`).join("\n");
    } else {
      return "No matching products found.";
    }
  }

  return "Sorry, I couldn't understand your query.";
}
