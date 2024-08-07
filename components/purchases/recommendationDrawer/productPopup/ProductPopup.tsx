"use client";

import { categories } from "@/data/categories";
import { useCounterStore } from "@/providers/useStoreProvider";
import { Product, Products } from "@/types/types";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import NutriScoreMenu from "../../products/NutriScoreMenu";
import SortMenu from "../../products/SortMenu";
import FilterPopoverProduct from "./FilterPopoverProduct";

type CategoryKeys = keyof typeof categories.de;

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

export default function ProductPopup({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [ascending, setAscending] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [nutriScoreCutOff, setNutriScoreCutOff] = useState("E");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProductCategories, setSelectedProductCategories] = useState<{
    major: string[];
    sub: string[];
  }>({
    major: [],
    sub: [],
  });

  const categoriesWithSub: { major: string; subs: string[] }[] = Object.entries(
    categories.de
  ).map(([major, subs]) => ({
    major,
    subs,
  }));

  const {
    selectedSortCriteria,
    selectedAlternativeProducts,
    setSelectedSortCriteria,
    setSelectedAlternativeProducts,
  } = useCounterStore((state) => state);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (
      selectedProductCategories.major.length === 0 &&
      selectedProductCategories.sub.length === 0 &&
      searchTerm.length === 0
    ) {
      setTotalPages(1);
    } else {
      const fetchAvailableProducts = async () => {
        const queryParams = new URLSearchParams({
          retailer: "Migros",
          page: currentPage.toString(),
          limit: "100",
          "nutri-score-cutoff": nutriScoreCutOff,
        });

        if (selectedProductCategories.major.length > 0) {
          selectedProductCategories.major.forEach((major) =>
            queryParams.append("dietcoach-category-l1-de", major)
          );
        }

        if (selectedProductCategories.sub.length > 0) {
          selectedProductCategories.sub.forEach((sub) =>
            queryParams.append("dietcoach-category-l2-de", sub)
          );
        }

        if (searchTerm.length > 0) {
          queryParams.append("search-de", searchTerm);
        }

        const queryString = queryParams.toString();
        try {
          const response = await fetch(`/api?${queryString}`);
          const data: Products = await response.json();
          setAvailableProducts(data.products);
          setSortedProducts(
            sortProducts(data.products, selectedSortCriteria, ascending)
          );
          setTotalPages(data.meta.totalPages);
        } catch (error) {
          console.error("Failed to fetch available products:", error);
        }
      };

      fetchAvailableProducts();
    }
  }, [
    selectedProductCategories,
    searchTerm,
    nutriScoreCutOff,
    currentPage,
    selectedSortCriteria,
    ascending,
  ]);

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const updateCategories = (category: string, type: "major" | "sub") => {
    setSelectedProductCategories((prevState) => {
      let newMajor = [...prevState.major];
      let newSub = [...prevState.sub];

      if (type === "major") {
        if (newMajor.includes(category)) {
          newMajor = newMajor.filter((cat) => cat !== category);
          const relatedSubs = categories.de[category as CategoryKeys];
          newSub = newSub.filter((sub) => !relatedSubs.includes(sub));
        } else {
          newMajor.push(category);
          newSub = [...newSub, ...categories.de[category as CategoryKeys]];
        }
      } else if (type === "sub") {
        if (newSub.includes(category)) {
          newSub = newSub.filter((sub) => sub !== category);
          const parentMajor = Object.keys(categories.de).find((major) =>
            categories.de[major as CategoryKeys].includes(category)
          );
          if (
            parentMajor &&
            !newSub.some((sub) =>
              categories.de[parentMajor as CategoryKeys].includes(sub)
            )
          ) {
            newMajor = newMajor.filter((major) => major !== parentMajor);
          }
        } else {
          newSub.push(category);
          const parentMajor = Object.keys(categories.de).find((major) =>
            categories.de[major as CategoryKeys].includes(category)
          );
          if (parentMajor && !newMajor.includes(parentMajor)) {
            newMajor.push(parentMajor);
          }
        }
      }

      return {
        major: newMajor,
        sub: newSub,
      };
    });
  };

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
                  <FilterPopoverProduct
                    categoriesWithSub={categoriesWithSub}
                    selectedCategories={selectedProductCategories}
                    updateCategories={updateCategories}
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
                  onChange={handleSearchTermChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div
                ref={scrollableContainerRef}
                className="bg-white p-4 border rounded-md h-[420px] overflow-y-scroll space-y-4"
              >
                {selectedProductCategories.major.length === 0 &&
                selectedProductCategories.sub.length === 0 &&
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
                            {
                              product.nutriScoreV2023Detail
                                ?.nutriScoreCalculated
                            }
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

            <div className="mt-5 sm:mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ChevronLeftIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                Zurück
              </button>
              <span className="text-sm text-gray-700">
                Seite {currentPage} von {totalPages} mit{" "}
                {availableProducts?.length} Produkten
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Vor
                <ChevronRightIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-md w-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
            >
              Speichern
            </button>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}