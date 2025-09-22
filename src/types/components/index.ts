export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
}

export interface TransactionsWidgetProps {
  salesCode?: string;
}
export interface MonthlyTransactionWidgetStatsProps {
  item: {
    month: string;
    current: string;
    growth: string;
  };
}

export interface TopCustomersWidgetProps {
  limit?: number;
}

export interface TopCustomerWidgetStatsProps {
  item: {
    customer: {
      name: string;
      code: string;
      companyType: string;
    };
    amount: string;
  };
  index: number;
}

export interface TransactionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}
