"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ArrowDownCircle, ArrowUpCircle, Trash2, Receipt, Edit, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import AddTransactionDialog from "@/components/add-transaction-dialog"
import { formatCurrency, type Currency } from "@/lib/currency"

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

interface TransactionsListProps {
  transactions: Transaction[]
  onRefresh: () => void
  isLoading?: boolean
  currency?: Currency
}

export default function TransactionsList({ transactions, onRefresh, isLoading = false, currency }: TransactionsListProps) {
  const supabase = createClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      })
      console.error("Error deleting transaction:", error)
    } else {
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      })
      onRefresh()
    }
    setDeletingId(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  const handleDuplicate = async (transaction: Transaction) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const { error } = await supabase.from("transactions").insert({
        user_id: userData.user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id,
        date: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Transaction duplicated successfully.",
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-emerald-100 dark:bg-emerald-900" />
              <Skeleton className="h-3 w-24 bg-emerald-100 dark:bg-emerald-900" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 bg-emerald-100 dark:bg-emerald-900" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <Empty className="border-emerald-100 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </EmptyMedia>
          <EmptyTitle className="text-emerald-900 dark:text-emerald-100">No transactions yet</EmptyTitle>
          <EmptyDescription className="text-emerald-700 dark:text-emerald-300">
            Start tracking your finances by adding your first transaction. Click the "Add Transaction" button to get
            started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-gray-800 p-3 sm:p-4 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:shadow-sm"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                transaction.type === "income" ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {transaction.type === "income" ? (
                <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm sm:text-base text-emerald-900 dark:text-emerald-100 truncate">{transaction.description || "No description"}</p>
                {transaction.categories && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: `${transaction.categories.color}20`,
                      color: transaction.categories.color,
                    }}
                  >
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full" style={{ backgroundColor: transaction.categories.color }} />
                    <span className="hidden min-[375px]:inline">{transaction.categories.name}</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                {format(new Date(transaction.date), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
            <p
              className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
                transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}{formatCurrency(Number(transaction.amount), currency)}
            </p>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(transaction)}
                className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                title="Edit transaction"
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDuplicate(transaction)}
                className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                title="Duplicate transaction"
              >
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === transaction.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this transaction? This action cannot be undone.
                    <br />
                    <span className="font-medium mt-2 block">
                      {transaction.description || "No description"} - {formatCurrency(Number(transaction.amount), currency)}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletingId === transaction.id ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>
        </div>
      ))}
      <AddTransactionDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingTransaction(null)
        }}
        onSuccess={() => {
          onRefresh()
          setIsEditDialogOpen(false)
          setEditingTransaction(null)
        }}
        transaction={editingTransaction}
        currency={currency}
      />
    </div>
  )
}
