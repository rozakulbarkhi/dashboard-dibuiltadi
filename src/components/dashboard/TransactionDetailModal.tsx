import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api";
import { formattedValue } from "@/utils/formatted-value";
import type { TransactionItem } from "@/types/api/response";

interface TransactionDetailModalProps {
  referenceNo: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({
  referenceNo,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const {
    data: transactionDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction-detail", referenceNo],
    queryFn: () => apiClient.getTransaction(referenceNo!),
    enabled: !!referenceNo && isOpen,
    retry: 2,
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[100vw] sm:max-w-4xl lg:max-w-6xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden p-0 m-0 sm:m-4 rounded-none sm:rounded-lg">
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="flex items-center justify-between text-lg sm:text-xl font-semibold">
            <span>Transaction Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-behavior-contain touch-pan-y sm:touch-auto px-4 sm:px-6 py-4 sm:py-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Loading transaction details...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 sm:py-12">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                  <X className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
                </div>
                <div>
                  <p className="text-destructive font-medium mb-2 text-sm sm:text-base">
                    Failed to load transaction details
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Please try again or contact support if the problem persists
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {transactionDetail && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-3 text-gray-900">
                    Transaction Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Reference:
                      </span>
                      <span className="text-sm font-mono break-all sm:text-right">
                        {transactionDetail.referenceNo}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Customer:
                      </span>
                      <span className="text-sm break-words sm:text-right">
                        {transactionDetail.customer.name}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Code:
                      </span>
                      <span className="text-sm font-mono sm:text-right">
                        {transactionDetail.customer.code}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Sales:
                      </span>
                      <span className="text-sm break-words sm:text-right">
                        {transactionDetail.sales}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-3 text-gray-900">
                    Dates
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Order:
                      </span>
                      <span className="text-sm sm:text-right">
                        {format(
                          new Date(transactionDetail.dateOrder),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Due:
                      </span>
                      <span className="text-sm sm:text-right">
                        {format(
                          new Date(transactionDetail.dateDue),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Paid:
                      </span>
                      <span className="text-sm text-green-600 font-medium sm:text-right">
                        {transactionDetail.paidAt
                          ? format(
                              new Date(transactionDetail.paidAt),
                              "MMM dd, yyyy"
                            )
                          : "Not paid"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Created:
                      </span>
                      <span className="text-sm sm:text-right">
                        {format(
                          new Date(transactionDetail.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between sm:items-center gap-2 mb-3">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                    Items
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                    {transactionDetail.items.length} items
                  </span>
                </div>

                <div className="block sm:hidden space-y-3">
                  {transactionDetail.items.map(
                    (item: TransactionItem, index: number) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="font-medium text-sm mb-2 text-gray-900">
                          {item.productName}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Qty:</span>
                            <span className="font-medium">
                              {parseFloat(item.quantity).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">
                              {formattedValue(parseFloat(item.price))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-orange-600 font-medium">
                              {parseFloat(item.discount) > 0
                                ? `${parseFloat(item.discount)}%`
                                : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">
                              {formattedValue(parseFloat(item.priceSubtotal))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="hidden sm:block border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                            Product
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Price
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Discount
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactionDetail.items.map(
                          (item: TransactionItem, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {item.productName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {parseFloat(item.quantity).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {formattedValue(parseFloat(item.price))}
                              </td>
                              <td className="px-4 py-3 text-sm text-orange-600 font-medium text-right">
                                {parseFloat(item.discount) > 0
                                  ? `${parseFloat(item.discount)}%`
                                  : "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">
                                {formattedValue(parseFloat(item.priceSubtotal))}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 sm:pt-6">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900">
                  Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      Amount Untaxed
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-gray-900">
                      {formattedValue(
                        parseFloat(transactionDetail.amountUntaxed)
                      )}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      Amount Due
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-orange-600">
                      {formattedValue(parseFloat(transactionDetail.amountDue))}
                    </div>
                  </div>
                  <div className="bg-gray-900 text-white p-3 sm:p-4 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-300 mb-1">
                      Total Amount
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-white">
                      {formattedValue(
                        parseFloat(transactionDetail.amountTotal)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
