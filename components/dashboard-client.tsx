"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import { useTransactionFilters, useTransactions } from "@/hooks/use-transactions"
import { useCounts } from "@/hooks/use-counts"
import { calculateTransactionSummary, getMonthStartDate, getYearStartDate } from "@/utils/transaction-calculations"
import { exportTransactionsToCSV } from "@/utils/export-csv"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { PeriodSummaryCards } from "@/components/dashboard/PeriodSummaryCards"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import AddTransactionDialog from "@/components/add-transaction-dialog"

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { currency, setCurrency } = useCurrency()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const { transactions, isLoading, fetchTransactions } = useTransactions()
  const { categoriesCount, budgetsCount, fetchCounts } = useCounts()
  const {
    filteredTransactions,
    filters,
    setSearch,
    setTypeFilter,
    setDateFilter,
    setSortBy,
    toggleSortOrder,
  } = useTransactionFilters(transactions)

  // Computed values - using useMemo would be better in real implementation
  const summary = calculateTransactionSummary(transactions)
  const monthSummary = calculateTransactionSummary(transactions, getMonthStartDate())
  const yearSummary = calculateTransactionSummary(transactions, getYearStartDate())

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
    router.push("/auth/login")
  }, [supabase, router])

  const handleTransactionSuccess = useCallback(() => {
    fetchTransactions()
    fetchCounts()
  }, [fetchTransactions, fetchCounts])

  const handleExportCSV = useCallback(() => {
    exportTransactionsToCSV(filteredTransactions, currency)
    toast({
      title: "Success",
      description: "Transactions exported successfully.",
    })
  }, [filteredTransactions, currency])

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
      <DashboardHeader
        user={user}
        currency={currency}
        onCurrencyChange={setCurrency}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              Dashboard
            </h1>
            <p className="text-emerald-700 dark:text-emerald-300">
              Track and manage your finances
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <div className="mb-8 space-y-4">
          <SummaryCards summary={summary} currency={currency} />
          <PeriodSummaryCards 
            monthSummary={monthSummary}
            yearSummary={yearSummary}
            transactionCount={transactions.length}
            currency={currency}
          />
        </div>

        <DashboardTabs
          transactions={transactions}
          filteredTransactions={filteredTransactions}
          isLoading={isLoading}
          currency={currency}
          categoriesCount={categoriesCount}
          budgetsCount={budgetsCount}
          searchQuery={filters.search}
          typeFilter={filters.type}
          dateFilter={filters.date}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSearchChange={setSearch}
          onTypeFilterChange={setTypeFilter}
          onDateFilterChange={setDateFilter}
          onSortByChange={setSortBy}
          onSortOrderToggle={toggleSortOrder}
          onExport={handleExportCSV}
          onRefresh={fetchTransactions}
        />
      </main>

      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={handleTransactionSuccess}
        currency={currency}
      />
    </div>
  )
}