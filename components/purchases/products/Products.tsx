import React, { useState } from "react";
import { CakeIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { classNames } from "@/utils/classNames";
import ProductsHeader from "@/components/purchases/products/ProductsHeader";
import {
  BasketProductFlat,
  SelectedBasketIds,
  SelectedBasketProductId,
} from "@/app/p/[id]/purchases/page";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const Products = ({
  filteredBasketProductsFlat,
  selectedBasketProductIds,
  handleProductCheckboxChange,
  selectedBasketIds,
}: {
  filteredBasketProductsFlat: BasketProductFlat[];
  selectedBasketProductIds: SelectedBasketProductId[];
  handleProductCheckboxChange: any;
  selectedBasketIds: SelectedBasketIds;
}) => {
  const [sortCriteria, setSortCriteria] = useState("Einkaufsdatum");
  const [sortOrder, setSortOrder] = useState("Aufsteigend");

  const isProductSelected = (productId: number, basketId: number) =>
    selectedBasketProductIds.some(
      (item) => item.productId === productId && item.basketId === basketId
    );

  const sortProducts = (products: BasketProductFlat[]) => {
    const sortedProducts = [...products].sort((a, b) => {
      let aValue, bValue;

      switch (sortCriteria) {
        case "Kalorien":
          aValue = a.kcal;
          bValue = b.kcal;
          break;
        case "Protein":
          aValue = a.protein;
          bValue = b.protein;
          break;
        case "Fett":
          aValue = a.fat;
          bValue = b.fat;
          break;
        case "Kohlenhydrate":
          aValue = a.carbs;
          bValue = b.carbs;
          break;
        case "Nahrungsfasern":
          aValue = a.fiber;
          bValue = b.fiber;
          break;
        default:
          aValue = a.basketIndex;
          bValue = b.basketIndex;
      }

      if (sortOrder === "Aufsteigend") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sortedProducts;
  };

  const sortedProducts = sortProducts(filteredBasketProductsFlat);

  return (
    <div className="pt-6 -mr-8 bg-white border-x flex flex-col shrink-0 border-t border-b border-gray-200 lg:w-96 lg:border-t-0 lg:pr-8 xl:pr-6 max-h-[calc(100vh-187px)]">
      <ProductsHeader
        filteredProducts={filteredBasketProductsFlat}
        selectedBasketIds={selectedBasketIds}
      />

      <div className="px-6 pt-1 pb-2 flex gap-x-8 items-center">
        <div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Sortieren nach
                <ChevronDownIcon
                  aria-hidden="true"
                  className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                />
              </MenuButton>
            </div>

            <MenuItems className="absolute left-0 z-10 mt-2 w-50 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
              <div className="py-1">
                {[
                  "Einkaufsdatum",
                  "Kalorien",
                  "Protein",
                  "Fett",
                  "Kohlenhydrate",
                  "Nahrungsfasern",
                ].map((option) => (
                  <MenuItem key={option}>
                    {({ active }) => (
                      <div className=" ml-4 flex items-center">
                        <input
                          type="radio"
                          name="sortCriteria"
                          value={option}
                          checked={sortCriteria === option}
                          onChange={() => setSortCriteria(option)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label
                          className="block px-4 py-2 text-sm font-medium text-gray-900 data-[focus]:bg-gray-100"
                          onClick={() => setSortCriteria(option)}
                        >
                          {option}
                        </label>
                      </div>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
        </div>

        <div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                {sortOrder === "Aufsteigend" ? "Aufsteigend" : "Absteigend"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                />
              </MenuButton>
            </div>
            <MenuItems className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
              <div className="py-1">
                {["Aufsteigend", "Absteigend"].map((option) => (
                  <MenuItem key={option}>
                    {({ active }) => (
                      <button
                        className="w-full text-left block px-4 py-2 text-sm font-medium text-gray-900 data-[focus]:bg-gray-100"
                        onClick={() => setSortOrder(option)}
                      >
                        {option}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className="-mr-6 flex-1 overflow-y-auto min-h-0 min-h-80 shadow-inner">
        {selectedBasketIds.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-100">
            {sortedProducts.map((product) => {
              const uniqueId = `${product.basketId},${product.productId}`;
              const selected = isProductSelected(
                product.productId,
                product.basketId
              );
              return (
                <li
                  key={uniqueId}
                  className={classNames(
                    "pl-6 flex items-center gap-x-4 px-3 py-5",
                    selected ? "bg-primary text-white" : ""
                  )}
                >
                  <CakeIcon
                    className={classNames(
                      "border border-gray-200 h-20 w-20 p-2 flex-none rounded-md",
                      selected
                        ? "bg-white text-primary"
                        : "bg-gray-50 text-primary"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={classNames(
                        "text-base font-semibold leading-6",
                        selected ? "text-white" : "text-gray-900"
                      )}
                    >
                      {product.name}
                    </p>
                    <p
                      className={classNames(
                        "truncate text-sm leading-5",
                        selected ? "text-white" : "text-gray-500"
                      )}
                    >
                      {product.nutriscore}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 mx-auto mr-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selected}
                    onChange={() =>
                      handleProductCheckboxChange({
                        basketId: product.basketId,
                        productId: product.productId,
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-6 mt-6 text-gray-500">
            Bitte wählen Sie mindestens einen Einkauf aus, um die Artikel
            anzuzeigen.
          </p>
        )}
      </div>
    </div>
  );
};

export default Products;
