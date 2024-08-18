// -------------------
// Product
// -------------------

export type Nutrients = {
  kcal: number;
  proteins: number;
  fats: number;
  saturatedFats: number;
  carbohydrates: number;
  sugar: number;
  fibers: number;
  salt: number;
  sodium: number;
};

export type NutriScoreV2023Detail = {
  nutriScoreCalculated: string;
  nsPoints: number;
};

export type DietCoachCategory = {
  de: string;
  en: string;
};

export type Product = {
  productId: number;
  de: {
    name: string;
  };
  productSize: number;
  nutrients: Nutrients;
  nutriScoreV2023Detail: NutriScoreV2023Detail;
  dietCoachCategoryL1: DietCoachCategory;
  dietCoachCategoryL2: DietCoachCategory;
  imageUrl: string;
};

export type Products = {
  products: Product[];
  meta: {
    totalPages: number;
    totalProducts: number;
  };
};

export type CategorySelection = { major: string[]; sub: string[] };

// -------------------
// Basket
// -------------------

export type Basket = {
  basketId: string;
  index: number;
  timestamp: number;
  avgNutriScore: string;
  avgFsaScore: number;
};

export type BasketProduct = {
  basketId: string;
  index: number;
  timestamp: number;
  avgNutriScore: string;
  avgFsaScore: number;
  products: Product[];
};

export type BasketProductFlat = {
  basketId: string;
  basketIndex: number;
  basketTimestamp: number;
  productId: number;
  de: {
    name: string;
  };
  productSize: number;
  nutrients: Nutrients;
  nutriScoreV2023Detail: NutriScoreV2023Detail;
  dietCoachCategoryL1: DietCoachCategory;
  dietCoachCategoryL2: DietCoachCategory;
  imageUrl: string;
};

export type SelectedBasketIds = string[];

export type SelectedBasketProductId = {
  basketId: string;
  productId: number;
};

// -------------------
// Charts
// -------------------

export type MetricOptions = "g";

export type LanguageOptions = "en" | "de";

export type MacroCategory =
  | "Kohlenhydrate"
  | "Fette"
  | "Proteine"
  | "Nahrungsfasern";

export type MicroCategory = "Salz" | "Zucker" | "Gesättigte Fettsäuren";

export type ChartEnergyMacroResponse = {
  name: {
    de: string;
    en: string;
  };
  values: {
    percentage: number;
  };
};

export type ChartEnergyMacroData = {
  name: string;
  value: number;
};

export type ChartEnergyCategoriesResponse = {
  name: {
    de: string;
    en: string;
  };
  values: {
    percentage: number;
  };
};

export type ChartEnergyCategoriesData = {
  name: string;
  value: number;
};

export type NutriScoreTableResponse = {
  category: {
    de: string[];
    en: string[];
  };
  quantity: number;
  energyKj: number;
  energy: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
  fruitVegetables: number;
  fiber: number;
  protein: number;
};

export type NutriScoreTableData = {
  category: string[];
  quantity: number;
  energyKj: number;
  energy: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
  fruitVegetables: number;
  fiber: number;
  protein: number;
};

// -------------------
// Sessions
// -------------------

export type SessionOverview = {
  sessionId: number;
  index: number;
  timestamp: number;
};

export type Recommendation = {
  recommendationId: number;
  index: number;
  rule: {
    variant: string;
    mode: string;
    nutrient: string;
    category: string;
    text: string;
  };
  basketIds: string[];
  suggestions: {
    current: number[];
    alternatives: number[];
  };
  notes: string | null;
};

export type Session = {
  sessionId: number;
  index: number;
  timestamp: number;
  recommendations: Recommendation[];
  notes: {
    patient: string | null;
    personal: string | null;
  };
};
