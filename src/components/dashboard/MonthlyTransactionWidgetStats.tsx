import type { MonthlyTransactionWidgetStatsProps } from "@/types/components";

import { formattedValue } from "@/utils/formatted-value";

const MonthlyTransactionWidgetStats = ({
  item,
}: MonthlyTransactionWidgetStatsProps) => {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className="font-medium">{item.month}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm">{formattedValue(Number(item.current))}</span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            parseFloat(item.growth) >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.growth}%
        </span>
      </div>
    </div>
  );
};

export default MonthlyTransactionWidgetStats;
