"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Plus, Trash2, Target } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, getCurrencySymbol, type Currency } from "@/lib/currency"

interface Category {
  id: string
  name: string
  color: string
}

interface Budget {
  id: string
  amount: number
  period: string
  start_date: string
  end_date: string
  category_id: string
  categories: {
    name: string
    color: string
  }
  spent?: number
}

interface BudgetsManagerProps {
  currency?: Currency
}

export default function BudgetsManager({ currency }: BudgetsManagerProps) {
  const supabase = createClient()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").eq("type", "expense").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }

  const fetchBudgets = async () => {
    const { data: budgetData, error } = await supabase
      .from("budgets")
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching budgets:", error)
      return
    }

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      (budgetData || []).map(async (budget) => {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("category_id", budget.category_id)
          .eq("type", "expense")
          .gte("date", budget.start_date)
          .lte("date", budget.end_date)

        const spent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
        return { ...budget, spent }
      }),
    )

    setBudgets(budgetsWithSpent)
  }

  const calculateDateRange = (periodType: "weekly" | "monthly" | "yearly") => {
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)

    if (periodType === "weekly") {
      end.setDate(end.getDate() + 7)
    } else if (periodType === "monthly") {
      end.setMonth(end.getMonth() + 1)
    } else {
      end.setFullYear(end.getFullYear() + 1)
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const { start, end } = calculateDateRange(period)

      const { error } = await supabase.from("budgets").insert({
        user_id: userData.user.id,
        amount: Number.parseFloat(amount),
        category_id: categoryId,
        period,
        start_date: start,
        end_date: end,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Budget created successfully.",
      })
      setAmount("")
      setCategoryId("")
      fetchBudgets()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add budget"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, categoryName: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
      console.error("Error deleting budget:", error)
    } else {
      toast({
        title: "Success",
        description: `Budget for "${categoryName}" deleted successfully.`,
      })
      fetchBudgets()
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900 dark:text-emerald-100">Set New Budget</CardTitle>
          <CardDescription className="dark:text-emerald-300">Create spending limits for your categories</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-medium">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="pl-8"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget-period">Period</Label>
              <Select value={period} onValueChange={(value: "weekly" | "monthly" | "yearly") => setPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Budget"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900 dark:text-emerald-100">Active Budgets</CardTitle>
          <CardDescription className="dark:text-emerald-300">Track your spending against budgets</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Target className="h-6 w-6 text-emerald-600" />
                </EmptyMedia>
                <EmptyTitle className="text-sm">No budgets set</EmptyTitle>
                <EmptyDescription className="text-xs">Create budgets to track your spending limits</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = ((budget.spent || 0) / Number(budget.amount)) * 100
                const isOverBudget = percentage > 100
                const isWarning = percentage > 80 && percentage <= 100

                return (
                  <div key={budget.id} className="rounded-lg border border-emerald-100 dark:border-emerald-800 p-4 space-y-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: budget.categories.color }} />
                        <div>
                          <p className="font-medium text-emerald-900 dark:text-emerald-100">{budget.categories.name}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the budget for "{budget.categories.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget.id, budget.categories.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(budget.spent || 0, currency)} / {formatCurrency(Number(budget.amount), currency)}
                        </span>
                        <span
                          className={`font-medium ${
                            isOverBudget ? "text-red-600 dark:text-red-400" : isWarning ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 ${
                          isOverBudget
                            ? "[&>div]:bg-red-500"
                            : isWarning
                              ? "[&>div]:bg-orange-500"
                              : "[&>div]:bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      {new Date(budget.start_date).toLocaleDateString()} -{" "}
                      {new Date(budget.end_date).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
