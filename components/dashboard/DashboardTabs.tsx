import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Receipt, Tag, Target } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import type { Currency } from "@/lib/currency"
import TransactionsList from "@/components/transactions-list"
import CategoriesManager from "@/components/categories-manager"
import BudgetsManager from "@/components/budgets-manager"
import AnalyticsChart from "@/components/analytics-chart"
import CategoryBreakdownChart from "@/components/category-breakdown-chart"
import { TransactionFilters } from "./TransactionFilters"
import type { FilterType, DateFilter, SortBy, SortOrder } from "@/types/transaction"

interface DashboardTabsProps {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  isLoading: boolean
  currency: Currency
  categoriesCount: number
  budgetsCount: number
  searchQuery: string
  typeFilter: FilterType
  dateFilter: DateFilter
  sortBy: SortBy
  sortOrder: SortOrder
  onSearchChange: (value: string) => void
  onTypeFilterChange: (value: FilterType) => void
  onDateFilterChange: (value: DateFilter) => void
  onSortByChange: (value: SortBy) => void
  onSortOrderToggle: () => void
  onExport: () => void
  onRefresh: () => void
}

export function DashboardTabs({
  transactions,
  filteredTransactions,
  isLoading,
  currency,
  categoriesCount,
  budgetsCount,
  searchQuery,
  typeFilter,
  dateFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onTypeFilterChange,
  onDateFilterChange,
  onSortByChange,
  onSortOrderToggle,
  onExport,
  onRefresh,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
        <TabsList className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 p-1 gap-1 flex w-max min-w-full sm:min-w-0 sm:w-auto">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all rounded-md shrink-0"
          >
            <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="transactions"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all rounded-md shrink-0"
          >
            <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden min-[375px]:inline">Transactions</span>
            <span className="min-[375px]:hidden">Txns</span>
            {transactions.length > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                {transactions.length > 99 ? "99+" : transactions.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="categories"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all rounded-md shrink-0"
          >
            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden min-[375px]:inline">Categories</span>
            <span className="min-[375px]:hidden">Cats</span>
            {categoriesCount > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                {categoriesCount > 99 ? "99+" : categoriesCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="budgets"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all rounded-md shrink-0"
          >
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Budgets</span>
            {budgetsCount > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                {budgetsCount > 99 ? "99+" : budgetsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg text-emerald-900 dark:text-emerald-100">
                Spending Analytics
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm dark:text-emerald-300">
                Your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <AnalyticsChart transactions={transactions} currency={currency} />
            </CardContent>
          </Card>
          <CategoryBreakdownChart transactions={transactions} currency={currency} />
        </div>

        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              Recent Transactions
            </CardTitle>
            <CardDescription className="dark:text-emerald-300">
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList
              transactions={transactions.slice(0, 5)}
              onRefresh={onRefresh}
              isLoading={isLoading}
              currency={currency}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="transactions" className="space-y-4">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              All Transactions
            </CardTitle>
            <CardDescription className="dark:text-emerald-300">
              Complete history of your income and expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TransactionFilters
              searchQuery={searchQuery}
              typeFilter={typeFilter}
              dateFilter={dateFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={onSearchChange}
              onTypeFilterChange={onTypeFilterChange}
              onDateFilterChange={onDateFilterChange}
              onSortByChange={onSortByChange}
              onSortOrderToggle={onSortOrderToggle}
              onExport={onExport}
            />
            <TransactionsList
              transactions={filteredTransactions}
              onRefresh={onRefresh}
              isLoading={isLoading}
              currency={currency}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesManager />
      </TabsContent>

      <TabsContent value="budgets">
        <BudgetsManager currency={currency} />
      </TabsContent>
    </Tabs>
  )
}