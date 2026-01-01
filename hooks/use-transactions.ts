import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
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
      setTransactions([])
    } else {
      setTransactions(data || [])
    }
    
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, isLoading, fetchTransactions }
}

// ============================================================================
// hooks/use-transaction-filters.ts
// ============================================================================
import { useState, useMemo, useCallback, useEffect } from "react"
import type { 
  Transaction, 
  TransactionFilters, 
  FilterType, 
  DateFilter, 
  SortBy, 
  SortOrder 
} from "@/types/transaction"
import { getDateFilterStartDate } from "@/utils/transaction-calculations"

const DEFAULT_FILTERS: TransactionFilters = {
  search: "",
  type: "all",
  date: "all",
  sortBy: "date",
  sortOrder: "desc",
}

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const setTypeFilter = useCallback((type: FilterType) => {
    setFilters(prev => ({ ...prev, type }))
  }, [])

  const setDateFilter = useCallback((date: DateFilter) => {
    setFilters(prev => ({ ...prev, date }))
  }, [])

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }, [])

  const toggleSortOrder = useCallback(() => {
    setFilters(prev => ({ 
      ...prev, 
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" 
    }))
  }, [])

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        t =>
          t.description?.toLowerCase().includes(query) ||
          t.categories?.name.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Date filter
    const startDate = getDateFilterStartDate(filters.date)
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= startDate)
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
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
      
      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [transactions, filters])

  return {
    filteredTransactions,
    filters,
    setSearch,
    setTypeFilter,
    setDateFilter,
    setSortBy,
    toggleSortOrder,
  }
}
