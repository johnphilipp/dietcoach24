import {
  ChartEnergyMacroData,
  ChartEnergyMacroResponse,
  LanguageOptions,
  MetricOptions,
  Product,
  SelectedBasketIds,
} from "@/types/types";
import { getBasketProducts } from "./getBasketProducts";

const aggregateMacros = (products: Product[]): ChartEnergyMacroResponse[] => {
  const macros = {
    Carbohydrates: { de: "Kohlenhydrate", en: "Carbohydrates", kcal: 0, g: 0 },
    Fats: { de: "Fette", en: "Fats", kcal: 0, g: 0 },
    Proteins: { de: "Proteine", en: "Proteins", kcal: 0, g: 0 },
    Other: { de: "Weitere Nährstoffe", en: "Other Nutrients", kcal: 0, g: 0 },
  };

  products.forEach((product) => {
    const { nutrients } = product;
    const { carbohydrates, fats, proteins, fibers, kcal } = nutrients;
    macros.Carbohydrates.kcal += (carbohydrates - fibers) * 4 + fibers * 2;
    macros.Fats.kcal += fats * 9;
    macros.Proteins.kcal += proteins * 4;
    macros.Other.kcal +=
      kcal -
      ((carbohydrates - fibers) * 4 + fibers * 2) -
      fats * 9 -
      proteins * 4;
  });

  return Object.values(macros).map(({ de, en, kcal, g }) => ({
    name: { de, en },
    values: { kcal, g },
  }));
};

const mapChartEnergyMacroResponse = (
  chartMacroResponse: ChartEnergyMacroResponse[],
  selectedMetric: MetricOptions,
  language: LanguageOptions = "de"
): ChartEnergyMacroData[] => {
  return chartMacroResponse.map((item) => ({
    name: item.name[language],
    value: item.values[selectedMetric],
    metric: selectedMetric,
  }));
};

export const getChartEnergyMacroData = (
  selectedBasketIds: SelectedBasketIds, // API body parameter
  selectedMetric: MetricOptions // Client side selection
): ChartEnergyMacroData[] => {
  const basketProductsResponse = getBasketProducts(selectedBasketIds);

  const products = basketProductsResponse.flatMap((basket) => basket.products);

  const dynamicChartEnergyMacroResponse = aggregateMacros(products);

  return mapChartEnergyMacroResponse(
    dynamicChartEnergyMacroResponse,
    selectedMetric
  );
};
