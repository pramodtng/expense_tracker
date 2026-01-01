import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import type { TransactionSummary } from "@/types/transaction"
import type { Currency } from "@/lib/currency"
import { formatCurrency } from "@/lib/currency"

interface SummaryCardsProps {
  summary: TransactionSummary
  currency: Currency
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Total Income
          </CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(summary.income, currency)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
            <TrendingUp className="mr-1 h-3 w-3" />
            All time
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Total Expenses
          </CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(summary.expenses, currency)}
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-1">
            <TrendingDown className="mr-1 h-3 w-3" />
            All time
          </p>
        </CardContent>
      </Card>

      <Card className={`border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow ${
        summary.balance >= 0 
          ? "bg-emerald-50 dark:bg-emerald-950/30" 
          : "bg-red-50 dark:bg-red-950/30"
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            summary.balance >= 0 
              ? "text-emerald-900 dark:text-emerald-100" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatCurrency(summary.balance, currency)}
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
            Current balance
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
