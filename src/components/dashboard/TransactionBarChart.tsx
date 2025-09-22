import type { TransactionChartProps } from "@/types/components";

import { formattedValue } from "@/utils/formatted-value";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TransactionBarChart = ({ data }: TransactionChartProps) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="2 2" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formattedValue(value)}
          />
          <Tooltip
            formatter={(value) => [formattedValue(Number(value)), "Amount"]}
            labelStyle={{ color: "#000" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionBarChart;
