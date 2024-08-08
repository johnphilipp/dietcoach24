import { getBasketProducts } from "@/api/getBasketProducts";
import { getSession } from "@/api/getSession";
import { useCounterStore } from "@/providers/useStoreProvider";
import { BasketProductFlat } from "@/types/types";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import RecommendationsHeader from "./RecommendationsHeader";

const Recommendations = () => {
  const basketProductsResponse = getBasketProducts([16189, 17200, 18211]);

  const products: BasketProductFlat[] = basketProductsResponse.flatMap(
    (basket) => {
      return basket.products.map((product) => ({
        basketId: basket.basketId,
        basketIndex: basket.index,
        basketTimestamp: basket.timestamp,
        ...product,
      }));
    }
  );

  const { selectedSessionId } = useCounterStore((state) => ({
    selectedSessionId: state.selectedSessionId,
  }));
  const [selectedBasketProductsFlat, setSelectedBasketProductsFlat] = useState<
    BasketProductFlat[]
  >(products.slice(2, 4));
  const [selectedBasketProductIds, setSelectedBasketProductIds] = useState<
    { productId: number; basketId: number }[]
  >([]);
  const [selectedAlternativeProducts, setSelectedAlternativeProducts] =
    useState<BasketProductFlat[]>(products.slice(0, 2));

  if (selectedSessionId === null) {
    return (
      <div className="pt-6 bg-gray-50 flex flex-col flex-1 px-4 sm:px-6 lg:pl-8 xl:pl-6 border-b">
        <RecommendationsHeader numRecommendations={0} />
        <div className="shadow-inner -mx-6">
          <div className="flex-1 max-h-[calc(100vh-314px)] overflow-y-auto pb-6 px-6">
            <div className="text-center">
              <h3 className="mt-6 text-sm font-semibold text-gray-900">
                Keine Sitzung ausgewählt
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Bitte wählen Sie eine Sitzung aus, um Empfehlungen anzuzeigen.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const session = getSession(selectedSessionId);

  const handleRemoveSelectedProduct = (productId: number, basketId: number) => {
    const newSelectedBasketProductsFlat = selectedBasketProductsFlat.filter(
      (product) =>
        !(product.productId === productId && product.basketId === basketId)
    );
    setSelectedBasketProductsFlat(newSelectedBasketProductsFlat);

    const newSelectedBasketProductIds = selectedBasketProductIds.filter(
      (id) => !(id.productId === productId && id.basketId === basketId)
    );
    setSelectedBasketProductIds(newSelectedBasketProductIds);
  };

  const handleRemoveAlternativeProduct = (productId: number) => {
    setSelectedAlternativeProducts(
      selectedAlternativeProducts.filter(
        (product) => product.productId !== productId
      )
    );
  };

  return (
    <div className="pt-6 bg-gray-50 flex flex-col flex-1 px-4 sm:px-6 lg:pl-8 xl:pl-6 border-b">
      <RecommendationsHeader
        numRecommendations={session.recommendations.length}
      />
      <div className="shadow-inner -mx-6">
        <div className="flex-1 max-h-[calc(100vh-285px)] overflow-y-auto px-6">
          <ul className="mt-6 text-gray-500">
            {session.recommendations.map((recommendation) => (
              <li
                key={recommendation.recommendationId}
                className="bg-white p-4 border rounded-md mb-4"
              >
                <div>
                  {recommendation.rule.variant === "VAR1" && (
                    <div className="relative flex-1">
                      <div className="flex rounded-md items-center">
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.mode}
                        </span>
                        <span className="inline-flex items-center border rounded-md mx-2 border-gray-300 px-3 text-gray-500 sm:text-xs">
                          der Zufuhr von
                        </span>
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.nutrient}
                        </span>
                        <span className="inline-flex items-center border rounded-md mx-2 border-gray-300 px-3 text-gray-500 sm:text-xs">
                          aus
                        </span>
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.category}
                        </span>
                      </div>
                    </div>
                  )}
                  {recommendation.rule.variant === "VAR2" && (
                    <div className="relative flex-1">
                      <div className="flex rounded-md items-center">
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.mode}
                        </span>
                        <span className="inline-flex items-center border rounded-md mx-2 border-gray-300 px-3 text-gray-500 sm:text-xs">
                          der Zufuhr aus
                        </span>
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.category}
                        </span>
                      </div>
                    </div>
                  )}
                  {recommendation.rule.variant === "FREITEXT" && (
                    <div className="relative flex-1">
                      <div className="flex rounded-md items-center">
                        <span className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary">
                          {recommendation.rule.text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 rounded-lg">
                  <section className="bg-white border rounded-md">
                    <div className="flex items-center py-2 px-4 border border-0 border-b ">
                      <h3 className="w-full block text-sm font-medium text-gray-500">
                        Gekaufte Produkte
                      </h3>
                      <ShoppingCartIcon className="h-6 w-6 text-red-500" />
                      <ArrowDownIcon className="ml-1 h-4 w-4 text-red-500" />
                    </div>
                    <div className="p-4 h-[400px] overflow-y-scroll space-y-4">
                      {selectedBasketProductsFlat.length === 0 && (
                        <div className="text-center">
                          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-semibold text-gray-900">
                            Keine Produkte ausgewählt
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Bitte wählen Sie Produkte aus, zu denen Sie ihrem
                            Kunden Empfehlungen geben möchten.
                          </p>
                        </div>
                      )}
                      {selectedBasketProductsFlat.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center space-x-4 justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-md bg-gray-200 flex-shrink-0" />
                            <div>
                              <h4 className="text-gray-900 font-semibold">
                                {product.de.name}
                              </h4>
                              <p className="text-gray-500">
                                {
                                  product.nutriScoreV2023Detail
                                    .nutriScoreCalculated
                                }
                              </p>
                              <p className="text-gray-500">
                                {product.dietCoachCategoryL1.de}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white border rounded-md">
                    <div className="flex items-center py-2 px-4 border border-0 border-b ">
                      <h3 className="w-full block text-sm font-medium text-gray-500">
                        Alternative Produkte
                      </h3>
                      <ShoppingCartIcon className="h-6 w-6 text-primary" />
                      <ArrowUpIcon className="ml-1 h-4 w-4 text-primary" />
                    </div>
                    <div className="p-4 h-[400px] overflow-y-scroll space-y-4">
                      {selectedAlternativeProducts.length === 0 && (
                        <div className="text-center">
                          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-semibold text-gray-900">
                            Keine Produkte ausgewählt
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Bitte wählen Sie Produkte aus, um sie ihrem Kunden
                            vorzuschlagen.
                          </p>
                        </div>
                      )}
                      {selectedAlternativeProducts.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center space-x-4 justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-md bg-gray-200 flex-shrink-0" />
                            <div>
                              <h4 className="text-gray-900 font-semibold">
                                {product.de.name}
                              </h4>
                              <p className="text-gray-500">
                                {
                                  product.nutriScoreV2023Detail
                                    .nutriScoreCalculated
                                }
                              </p>
                              <p className="text-gray-500">
                                {product.dietCoachCategoryL1.de}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section>
                  {recommendation.notes && (
                    <div className="mt-4">
                      <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        defaultValue={recommendation.notes}
                      />
                    </div>
                  )}
                </section>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;