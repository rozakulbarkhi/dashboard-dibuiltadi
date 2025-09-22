import { formattedValue } from "@/utils/formatted-value";

import type { YearlyTransactionsResponse } from "@/types/api/response";

const YearlyTransactionWidgetStats = ({
  response,
}: {
  response: YearlyTransactionsResponse;
}) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-muted-foreground">Previous Year</p>
        <p className="text-lg font-semibold">{response.previous.year}</p>
        <p className="text-sm">
          {formattedValue(parseFloat(response.previous.amount))}
        </p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-muted-foreground">Current Year</p>
        <p className="text-lg font-semibold">{response.current.year}</p>
        <p className="text-sm">
          {formattedValue(parseFloat(response.current.amount))}
        </p>
      </div>
    </div>
  );
};

export default YearlyTransactionWidgetStats;
