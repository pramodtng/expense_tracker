"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getCurrencySymbol, type Currency } from "@/lib/currency"

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
}

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category_id: string | null
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  transaction?: Transaction | null
  currency?: Currency
}

export default function AddTransactionDialog({ open, onOpenChange, onSuccess, transaction, currency }: AddTransactionDialogProps) {
  const supabase = createClient()
  const isEditMode = !!transaction
  const [type, setType] = useState<"income" | "expense">(transaction?.type || "expense")
  const [amount, setAmount] = useState(transaction?.amount.toString() || "")
  const [description, setDescription] = useState(transaction?.description || "")
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "")
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split("T")[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update categories when type changes
  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open, type]) // Added type to dependencies

  // Initialize form when dialog opens or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        setType(transaction.type)
        setAmount(transaction.amount.toString())
        setDescription(transaction.description || "")
        setCategoryId(transaction.category_id || "")
        setDate(transaction.date)
      } else {
        setType("expense")
        setAmount("")
        setDescription("")
        setCategoryId("")
        setDate(new Date().toISOString().split("T")[0])
      }
    }
  }, [open, transaction]) // Removed type from here to prevent infinite loop

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", type)
        .order("name")

      if (error) throw error
      
      setCategories(data || [])
      
      // Reset category if it's not valid for the current type
      if (data && data.length > 0) {
        const categoryExists = data.some(cat => cat.id === categoryId)
        if (!categoryExists) {
          setCategoryId("")
        }
      } else {
        setCategoryId("")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const transactionData = {
        type,
        amount: Number.parseFloat(amount),
        description,
        category_id: categoryId || null,
        date,
      }

      if (isEditMode && transaction) {
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transaction.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Transaction updated successfully.",
        })
      } else {
        const { error } = await supabase.from("transactions").insert({
          user_id: userData.user.id,
          ...transactionData,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Transaction added successfully.",
        })
      }

      setAmount("")
      setDescription("")
      setCategoryId("")
      setDate(new Date().toISOString().split("T")[0])
      setType("expense")
      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "add"} transaction`
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the transaction details" : "Record a new income or expense transaction"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as "income" | "expense")
                  // Reset category when type changes
                  setCategoryId("")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-medium">
                  {getCurrencySymbol(currency)}
                </span> */}
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`${getCurrencySymbol(currency)} 0.00`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category {categories.length === 0 && <span className="text-xs text-muted-foreground">(Create categories first)</span>}</Label>
              <Select 
                value={categoryId} 
                onValueChange={setCategoryId}
                disabled={categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No {type} categories found. Please add categories in the Categories section.
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update Transaction" : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
