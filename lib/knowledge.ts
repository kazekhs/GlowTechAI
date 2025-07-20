// lib/knowledge.ts

export type CombinationInfo = {
  compatible: boolean;
  explanation: string;
  how_to_use: string;
  benefits: string;
};

export type IngredientInfo = {
  benefits: string[];
  suitable_for: string;
  concentration: string;
  ph_range?: string;
  when_to_use: string;
  compatibility: {
    good_with: string[];
    avoid_with: string[];
    notes: string;
  };
};

export const SKINCARE_KNOWLEDGE = {
  ingredients: {
    niacinamide: {
      benefits: ["Reduces pore appearance", "Controls oil production", "Brightens skin tone", "Anti-inflammatory"],
      suitable_for: "All skin types, especially oily and acne-prone",
      concentration: "5-10% is most effective",
      ph_range: "5.0-7.0",
      when_to_use: "Morning or evening",
      compatibility: {
        good_with: ["hyaluronic acid", "ceramides", "peptides", "retinol", "vitamin c"],
        avoid_with: ["high pH products"],
        notes: "Can be used with Vitamin C - the myth about incompatibility has been debunked!",
      },
    },
    "vitamin c": {
      benefits: ["Antioxidant protection", "Brightening", "Collagen synthesis", "Anti-aging"],
      suitable_for: "Most skin types",
      concentration: "10-20% L-ascorbic acid",
      ph_range: "3.0-4.0",
      when_to_use: "Morning (with sunscreen)",
      compatibility: {
        good_with: ["vitamin e", "ferulic acid", "niacinamide", "hyaluronic acid"],
        avoid_with: ["retinol (same routine)", "benzoyl peroxide"],
        notes: "Works great with niacinamide despite old myths!",
      },
    },
    // ... tambahkan lainnya
  },
  combinations: {
    "niacinamide + vitamin c": {
      compatible: true,
      explanation: "MYTH BUSTED! Niacinamide and Vitamin C CAN be used together...",
      how_to_use: "Apply Vitamin C first, then niacinamide.",
      benefits: "Brightening, pore reduction, antioxidant protection",
    },
    "retinol + niacinamide": {
      compatible: true,
      explanation: "Niacinamide can help reduce retinol irritation.",
      how_to_use: "Use retinol at night, niacinamide can be used any time.",
      benefits: "Anti-aging with less irritation",
    },
  },
} as const;

export type SKType = typeof SKINCARE_KNOWLEDGE;
