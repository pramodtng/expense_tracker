import type { DateFilter, Transaction, TransactionSummary } from "@/types/transaction"

export function calculateTransactionSummary(
  transactions: Transaction[],
  startDate?: Date
): TransactionSummary {
  const filtered = startDate 
    ? transactions.filter(t => new Date(t.date) >= startDate)
    : transactions
    
  const income = filtered
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)
    
  const expenses = filtered
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  return { income, expenses, balance: income - expenses }
}

export function getMonthStartDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

export function getYearStartDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
}

export function getDateFilterStartDate(filter: DateFilter): Date | null {
  if (filter === "all") return null
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (filter) {
    case "today":
      return today
    case "week": {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo
    }
    case "month": {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo
    }
    case "year": {
      const yearAgo = new Date(today)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      return yearAgo
    }
  }
}
