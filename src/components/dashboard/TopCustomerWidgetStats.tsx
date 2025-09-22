import type { TopCustomerWidgetStatsProps } from "@/types/components";

import { formattedValue } from "@/utils/formatted-value";

const TopCustomerWidgetStats = ({
  item,
  index,
}: TopCustomerWidgetStatsProps) => {
  return (
    <div
      key={item.customer.code || index}
      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs sm:text-sm leading-tight truncate">
            {item.customer.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{item.customer.code}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-semibold text-xs sm:text-sm">
          {formattedValue(parseFloat(item.amount))}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {item.customer.companyType}
        </p>
      </div>
    </div>
  );
};

export default TopCustomerWidgetStats;
