export type TransactionType = "income" | "expense"
export type FilterType = "all" | TransactionType
export type DateFilter = "all" | "today" | "week" | "month" | "year"
export type SortBy = "date" | "amount" | "description"
export type SortOrder = "asc" | "desc"

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  description: string
  date: string
  category_id: string | null
  categories: {
    name: string
    color: string
  } | null
}

export interface TransactionSummary {
  income: number
  expenses: number
  balance: number
}

export interface TransactionFilters {
  search: string
  type: FilterType
  date: DateFilter
  sortBy: SortBy
  sortOrder: SortOrder
}
