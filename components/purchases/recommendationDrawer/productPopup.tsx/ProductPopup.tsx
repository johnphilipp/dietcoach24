"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { Product, Products } from "@/types/types";
import { useEffect, useState } from "react";
import { categories } from "@/data/categories";
import { useCounterStore } from "@/providers/useStoreProvider";
import SortMenu from "../../products/SortMenu";
import FilterPopover from "../../products/FilterPopover";
import NutriScoreMenu from "../../products/NutriScoreMenu";

const sortCriteria = [
  "Standard",
  "Kalorien",
  "Proteine",
  "Fette",
  "Kohlenhydrate",
  "Nahrungsfasern",
];

const sortProducts = (
  products: Product[],
  selectedSortCriteria: string,
  ascending: boolean
) => {
  const getSortValue = (product: Product) => {
    switch (selectedSortCriteria) {
      case "Kalorien":
        return product.nutrients.kcal;
      case "Proteine":
        return product.nutrients.proteins;
      case "Fette":
        return product.nutrients.fats;
      case "Kohlenhydrate":
        return product.nutrients.carbohydrates;
      case "Nahrungsfasern":
        return product.nutrients.fibers;
      default:
        return 0;
    }
  };

  return [...products].sort((a, b) =>
    ascending
      ? getSortValue(a) - getSortValue(b)
      : getSortValue(b) - getSortValue(a)
  );
};

type HeadersType = {
  retailer: string;
  Page: string;
  Limit: string;
  "Search-De"?: string;
  "DietCoach-Category-L2-De"?: string;
  "DietCoach-Category-L1-De"?: string;
  "Nutri-Score-Cutoff"?: string;
};

export default function ProductPopup({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [ascending, setAscending] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [nutriScoreCutOff, setNutriScoreCutOff] = useState("E");
  const [headers, setHeaders] = useState<HeadersType>({
    retailer: "Migros",
    Page: "1",
    Limit: "110",
  });

  const categoriesWithSub: { major: string; subs: string[] }[] = Object.entries(
    categories.de
  ).map(([major, subs]) => ({
    major,
    subs,
  }));

  const {
    selectedCategories,
    selectedSortCriteria,
    selectedAlternativeProducts,
    setSelectedSortCriteria,
    updateCategories,
    setSelectedAlternativeProducts,
  } = useCounterStore((state) => state);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      const query = new URLSearchParams(headers).toString();
      try {
        const response = await fetch(`/api?${query}`);
        const data: Products = await response.json();
        setAvailableProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch available products:", error);
      }
    };

    fetchAvailableProducts();
  }, [headers]);

  const updateHeaders = () => {
    const newHeaders: HeadersType = {
      retailer: "Migros",
      Page: "1",
      Limit: "110",
      "Nutri-Score-Cutoff": nutriScoreCutOff,
    };

    if (selectedCategories.major.length > 0) {
      newHeaders["DietCoach-Category-L1-De"] = selectedCategories.major[0];
    }

    if (selectedCategories.sub.length > 0) {
      newHeaders["DietCoach-Category-L2-De"] = selectedCategories.sub[0];
    }

    if (searchTerm.length > 0) {
      newHeaders["Search-De"] = searchTerm;
    }

    setHeaders(newHeaders);
  };

  useEffect(() => {
    updateHeaders();
  }, [selectedCategories, searchTerm, nutriScoreCutOff]);

  const handleAddProduct = (product: Product) => {
    setSelectedAlternativeProducts([...selectedAlternativeProducts, product]);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedAlternativeProducts(
      selectedAlternativeProducts.filter(
        (product) => product.productId !== productId
      )
    );
  };

  const sortedProducts = sortProducts(
    availableProducts,
    selectedSortCriteria,
    ascending
  );

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  Alternative Produkte auswählen
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Wählen Sie aus dem gesamten Sortiment alternative Produkte
                    aus, die Sie ihrem Kunden empfehlen möchten.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div className="px-6 -mt-2 pb-2 flex justify-between items-center">
                <div className="space-x-8">
                  <FilterPopover
                    categoriesWithSub={categoriesWithSub}
                    selectedCategories={selectedCategories}
                    updateCategories={updateCategories}
                    layout="right"
                  />

                  <SortMenu
                    sortCriteria={sortCriteria}
                    selectedSortCriteria={selectedSortCriteria}
                    setSelectedSortCriteria={setSelectedSortCriteria}
                  />

                  <NutriScoreMenu
                    selectedNutriScore={nutriScoreCutOff}
                    setSelectedNutriScore={setNutriScoreCutOff}
                  />
                </div>

                <div>
                  <button
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setAscending(!ascending)}
                  >
                    {ascending ? (
                      <ArrowUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="bg-white p-4 border rounded-md h-[420px] overflow-y-scroll space-y-4">
                {selectedCategories.major.length === 0 &&
                selectedCategories.sub.length === 0 &&
                searchTerm.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Bitte wählen Sie eine Kategorie oder geben Sie einen
                      Suchbegriff ein.
                    </p>
                  </div>
                ) : (
                  sortedProducts?.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center space-x-4 justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-md bg-gray-200"></div>
                        <div>
                          <h4 className="text-gray-900 font-semibold">
                            {product.de.name}
                          </h4>
                          <p className="text-gray-500">
                            {product.nutriScoreV2023Detail.nutriScoreCalculated}
                          </p>
                          <p className="text-gray-500">
                            {product.dietCoachCategoryL1.de}
                          </p>
                        </div>
                      </div>
                      {selectedAlternativeProducts.some(
                        (altProduct) =>
                          altProduct.productId === product.productId
                      ) ? (
                        <CheckCircleIcon
                          className="h-6 w-6 text-primary hover:text-gray-500 cursor-pointer"
                          onClick={() => handleRemoveProduct(product.productId)}
                        />
                      ) : (
                        <PlusCircleIcon
                          className="h-6 w-6 text-gray-500 hover:text-primary cursor-pointer"
                          onClick={() => handleAddProduct(product)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {selectedAlternativeProducts.length === 0 && "Zurück"}
                {selectedAlternativeProducts.length === 1 &&
                  "1 Produkt emphfehlen"}
                {selectedAlternativeProducts.length > 1 &&
                  `${selectedAlternativeProducts.length} Produkte emphfehlen`}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
