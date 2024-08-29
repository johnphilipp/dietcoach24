import { useCounterStore } from "@/providers/useStoreProvider";
import { ChartEnergyCategoriesData, MacroCategory } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const tabs = ["Kohlenhydrate", "Fette", "Proteine", "Nahrungsfasern"];

const CustomLabel = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  percent = 0,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  percent?: number;
}) => {
  return (
    <text
      x={x + width + 5}
      y={y + height / 2}
      fill="#666"
      textAnchor="start"
      dominantBaseline="middle"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ChartEnergyMacroCategories({
  data,
  replace = false,
  className,
}: {
  data: ChartEnergyCategoriesData[];
  replace?: boolean;
  className?: string;
}) {
  const { selectedMacro, setSelectedMacro, setSelectedSortCriteria } =
    useCounterStore((state) => state);

  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const { selectedCategories, updateCategories } = useCounterStore(
    (state) => state
  );

  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  useEffect(() => {
    const updatedIndices = data
      .map((item, index) =>
        selectedCategories.major.includes(item.name) ? index : -1
      )
      .filter((index) => index !== -1);
    setActiveIndices(updatedIndices);
  }, [selectedCategories, data]);

  const handleMacroChange = (macro: MacroCategory) => {
    setSelectedMacro(macro);
    setActiveIndices([]); // Clear active indices when macro changes
  };

  const handleClick = (index: number | undefined) => {
    if (index !== undefined && index >= 0 && index < data.length) {
      const category = data[index].name;
      updateCategories(category, "major", replace);

      setActiveIndices((prevIndices) =>
        prevIndices.includes(index)
          ? prevIndices.filter((i) => i !== index)
          : [...prevIndices, index]
      );
    }
  };

  useEffect(() => {
    // Set the currently active tab to the selectedSortCriteria
    if (tabs.includes(selectedMacro)) {
      setSelectedSortCriteria(selectedMacro);
    }
  }, [selectedMacro, setSelectedSortCriteria]);

  return (
    <div
      className={`rounded-lg p-4 border border-gray-300 w-full ${className}`}
      style={{ height: "550px" }}
    >
      <div className="flex items-center justify-between space-x-4">
        {tabs.map((macro) => (
          <button
            key={macro}
            onClick={() => {
              handleMacroChange(macro as MacroCategory);
              setSelectedSortCriteria(macro);
            }}
            className={`w-full rounded-md px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:text-white ${
              selectedMacro === macro ? "bg-primary text-white" : "bg-gray-300"
            }`}
          >
            {macro}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 100, left: 70, bottom: 80 }}
          onClick={(e) => handleClick(e.activeTooltipIndex!)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
          <Bar dataKey="value" fill="#9ca3af" cursor={"pointer"}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={activeIndices.includes(index) ? "#009900" : "#9ca3af"}
                opacity={activeIndices.includes(index) ? 1 : 1}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              content={({ x = 0, y = 0, width = 0, height = 0, value = 0 }) => (
                <CustomLabel
                  x={Number(x)}
                  y={Number(y)}
                  width={Number(width)}
                  height={Number(height)}
                  percent={totalValue ? Number(value) / totalValue : 0}
                />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
