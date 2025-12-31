import { User } from "@supabase/supabase-js"

export interface Transaction {
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

export interface Summary {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface DashboardClientProps {
  user: User
}

export interface TransactionFilters {
  search: string
  type: "all" | "income" | "expense"
  category: string
  sortBy: "date" | "amount"
  sortOrder: "asc" | "desc"
}

export interface CategoryData {
  name: string
  value: number
  color: string
  type: 'income' | 'expense'
}

export interface DashboardState {
  transactions: Transaction[]
  categories: any[]
  budgets: any[]
  categoryData: CategoryData[]
  summary: Summary
  filters: TransactionFilters
  selectedTransaction: Transaction | null
  isAddDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  isLoading: boolean
  isCategoryLoading: boolean
  currency: string
}
