"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ArrowDownCircle, ArrowUpCircle, Wallet, LogOut, Plus, TrendingUp, TrendingDown, Search, Filter, Moon, Sun, Download, ArrowUpDown, LayoutDashboard, Receipt, Tag, Target } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"
import AddTransactionDialog from "@/components/add-transaction-dialog"
import TransactionsList from "@/components/transactions-list"
import CategoriesManager from "@/components/categories-manager"
import BudgetsManager from "@/components/budgets-manager"
import AnalyticsChart from "@/components/analytics-chart"
import CategoryBreakdownChart from "@/components/category-breakdown-chart"
import { toast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import { formatCurrency, getCurrencySymbol, CURRENCIES } from "@/lib/currency"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DashboardClientProps {
  user: User
}

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category_id: string | null
  categories: {
    name: string
    color: string
  } | null
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const { currency, setCurrency, mounted: currencyMounted } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "year">("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [categoriesCount, setCategoriesCount] = useState(0)
  const [budgetsCount, setBudgetsCount] = useState(0)

  const fetchTransactions = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .order("date", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      })
    } else {
      setTransactions(data || [])
      calculateSummary(data || [])
      fetchCounts() // Update counts when transactions change
    }
    setIsLoading(false)
  }

  const calculateSummary = (transactionsList: Transaction[]) => {
    const totalIncome = transactionsList
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpenses = transactionsList
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)
    setSummary({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    })
  }

  const calculatePeriodSummary = (period: "month" | "year") => {
    const now = new Date()
    const startDate = new Date(now)
    if (period === "month") {
      startDate.setMonth(0)
      startDate.setDate(1)
    } else {
      startDate.setFullYear(now.getFullYear(), 0, 1)
    }

    const periodTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate
    })

    const income = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expenses = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { income, expenses, balance: income - expenses }
  }

  const monthSummary = calculatePeriodSummary("month")
  const yearSummary = calculatePeriodSummary("year")

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        switch (dateFilter) {
          case "today":
            return transactionDate >= today
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return transactionDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return transactionDate >= monthAgo
          case "year":
            const yearAgo = new Date(today)
            yearAgo.setFullYear(yearAgo.getFullYear() - 1)
            return transactionDate >= yearAgo
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = Number(a.amount) - Number(b.amount)
          break
        case "description":
          comparison = (a.description || "").localeCompare(b.description || "")
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [transactions, searchQuery, typeFilter, dateFilter, sortBy, sortOrder])

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Description", "Category", "Amount"]
    const csvRows = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          t.date,
          t.type,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          t.categories?.name || "",
          formatCurrency(Number(t.amount), currency),
        ].join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Transactions exported successfully.",
    })
  }

  useEffect(() => {
    fetchTransactions()
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    const [categoriesResult, budgetsResult] = await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("budgets").select("id", { count: "exact", head: true }),
    ])
    setCategoriesCount(categoriesResult.count || 0)
    setBudgetsCount(budgetsResult.count || 0)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
    router.push("/auth/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Budget Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 dark:text-emerald-300 gap-2 font-medium"
                  suppressHydrationWarning
                >
                  {currencyMounted ? (
                    <>
                      <span className="text-lg">{getCurrencySymbol(currency)}</span>
                      <span className="hidden sm:inline">{currency.code}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">$</span>
                      <span className="hidden sm:inline">USD</span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Select Currency
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => setCurrency(curr)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${currency.code === curr.code
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100"
                          : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{curr.symbol}</span>
                          <span>{curr.code}</span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">- {curr.name}</span>
                        </div>
                        {currency.code === curr.code && (
                          <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-emerald-700 dark:text-emerald-300"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <span className="text-sm text-emerald-700 dark:text-emerald-300 hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-emerald-700 dark:text-emerald-300">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">Dashboard</h1>
            <p className="text-emerald-700 dark:text-emerald-300">Track and manage your finances</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <div className="mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Total Income</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(summary.totalIncome, currency)}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  All time
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Total Expenses</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(summary.totalExpenses, currency)}</div>
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-1">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  All time
                </p>
              </CardContent>
            </Card>
            <Card className={`border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow ${summary.balance >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Balance</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-emerald-900 dark:text-emerald-100" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(summary.balance, currency)}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Current balance</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(monthSummary.balance, currency)}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 break-words">
                  <span className="block sm:inline">Income: {formatCurrency(monthSummary.income, currency)}</span>
                  <span className="hidden sm:inline"> | </span>
                  <span className="block sm:inline">Expenses: {formatCurrency(monthSummary.expenses, currency)}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">This Year</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(yearSummary.balance, currency)}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 break-words">
                  <span className="block sm:inline">Income: {formatCurrency(yearSummary.income, currency)}</span>
                  <span className="hidden sm:inline"> | </span>
                  <span className="block sm:inline">Expenses: {formatCurrency(yearSummary.expenses, currency)}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Transactions</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{transactions.length}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Total transactions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
            <TabsList className="bg-white dark:bg-gray-800
    border border-emerald-200 dark:border-emerald-800
    p-1 gap-1
    flex w-max min-w-full
    sm:min-w-0 sm:w-auto">
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
                  <CardTitle className="text-base sm:text-lg text-emerald-900 dark:text-emerald-100">Spending Analytics</CardTitle>
                  <CardDescription className="text-xs sm:text-sm dark:text-emerald-300">Your spending patterns over time</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <AnalyticsChart transactions={transactions} currency={currency} />
                </CardContent>
              </Card>
              <CategoryBreakdownChart transactions={transactions} currency={currency} />
            </div>
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-900 dark:text-emerald-100">Recent Transactions</CardTitle>
                <CardDescription className="dark:text-emerald-300">Your latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsList
                  transactions={transactions.slice(0, 5)}
                  onRefresh={fetchTransactions}
                  isLoading={isLoading}
                  currency={currency}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-900 dark:text-emerald-100">All Transactions</CardTitle>
                <CardDescription className="dark:text-emerald-300">Complete history of your income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-emerald-200 dark:border-emerald-800"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={typeFilter} onValueChange={(value: "all" | "income" | "expense") => setTypeFilter(value)}>
                      <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={(value: "all" | "today" | "week" | "month" | "year") => setDateFilter(value)}>
                      <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: "date" | "amount" | "description") => setSortBy(value)}>
                      <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="amount">Sort by Amount</SelectItem>
                        <SelectItem value="description">Sort by Name</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="border-emerald-200 dark:border-emerald-800"
                      title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      className="border-emerald-200 dark:border-emerald-800"
                      title="Export to CSV"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <TransactionsList transactions={filteredTransactions} onRefresh={fetchTransactions} isLoading={isLoading} currency={currency} />
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
      </main>

      <AddTransactionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchTransactions} currency={currency} />
    </div>
  )
}
