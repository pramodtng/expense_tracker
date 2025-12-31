import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Receipt, Tag, Target } from "lucide-react"
import { SummaryCards } from "./SummaryCards"
import { TransactionsTable } from "./TransactionsTable"
import CategoriesManager from "@/components/categories-manager"
import BudgetsManager from "@/components/budgets-manager"
import { Transaction, Summary, CategoryData } from "@/types/dashboard"
import { Currency } from "@/lib/currency"
import { CategoryBreakdownChart } from "./CategoryBreakdownChart"

type DashboardTabsProps = {
  activeTab: string
  onTabChange: (value: string) => void
  summary: Summary
  transactions: Transaction[]
  isLoading: boolean
  onEditTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (transaction: Transaction) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
  categoryData: CategoryData[]
  isCategoryLoading: boolean
}

export function DashboardTabs({
  activeTab,
  onTabChange,
  summary,
  transactions,
  isLoading,
  onEditTransaction,
  onDeleteTransaction,
  currency,
  onCurrencyChange,
  categoryData,
  isCategoryLoading,
}: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Transactions</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Categories</span>
        </TabsTrigger>
        <TabsTrigger value="budgets" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Budgets</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <SummaryCards summary={summary} currency={currency} />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
            <TransactionsTable
              transactions={transactions.slice(0, 5)}
              isLoading={isLoading}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
              currency={currency}
            />
          </div>
          <CategoryBreakdownChart 
            data={categoryData}
            isLoading={isCategoryLoading}
            currency={currency}
          />
        </div>
      </TabsContent>

      <TabsContent value="transactions">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Transactions</h2>
            {/* Add transaction button will go here */}
          </div>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
            currency={currency}
          />
        </div>
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesManager />
      </TabsContent>

      <TabsContent value="budgets">
        <BudgetsManager />
      </TabsContent>
    </Tabs>
  )
}
