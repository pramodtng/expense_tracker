import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet } from "lucide-react"
import type { TransactionSummary } from "@/types/transaction"
import type { Currency } from "@/lib/currency"
import { formatCurrency } from "@/lib/currency"

interface PeriodSummaryCardsProps {
  monthSummary: TransactionSummary
  yearSummary: TransactionSummary
  transactionCount: number
  currency: Currency
}

export function PeriodSummaryCards({ 
  monthSummary, 
  yearSummary, 
  transactionCount,
  currency 
}: PeriodSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            This Month
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(monthSummary.balance, currency)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 break-words">
            <span className="block sm:inline">Income: {formatCurrency(monthSummary.income, currency)}</span>
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">Expenses: {formatCurrency(monthSummary.expenses, currency)}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            This Year
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(yearSummary.balance, currency)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 break-words">
            <span className="block sm:inline">Income: {formatCurrency(yearSummary.income, currency)}</span>
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">Expenses: {formatCurrency(yearSummary.expenses, currency)}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Transactions
          </CardTitle>
          <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            {transactionCount}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Total transactions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}