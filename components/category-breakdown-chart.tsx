"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, type Currency } from "@/lib/currency"

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  category_id: string | null
  categories: {
    name: string
    color: string
  } | null
}

interface CategoryBreakdownChartProps {
  transactions: Transaction[]
  currency?: Currency
}

export default function CategoryBreakdownChart({ transactions, currency }: CategoryBreakdownChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense" && t.categories)
    const categoryMap = new Map<string, { name: string; amount: number; color: string }>()

    expenseTransactions.forEach((transaction) => {
      if (transaction.categories) {
        const existing = categoryMap.get(transaction.categories.name) || {
          name: transaction.categories.name,
          amount: 0,
          color: transaction.categories.color,
        }
        existing.amount += Number(transaction.amount)
        categoryMap.set(transaction.categories.name, existing)
      }
    })

    const data = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8) // Top 8 categories

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    return data.map((item) => ({
      ...item,
      percentage: ((item.amount / total) * 100).toFixed(1),
    }))
  }, [transactions])

  if (chartData.length === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900 dark:text-emerald-100">Category Breakdown</CardTitle>
          <CardDescription className="dark:text-emerald-300">Spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-emerald-600 dark:text-emerald-400">
            <p>No expense data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg text-emerald-900 dark:text-emerald-100">Category Breakdown</CardTitle>
        <CardDescription className="text-xs sm:text-sm dark:text-emerald-300">Spending by category</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="w-full" style={{ height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="amount"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#d1fae5"}`,
                borderRadius: "8px",
                color: isDark ? "#d1fae5" : "#059669",
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
              formatter={(value) => {
                const item = chartData.find((d) => d.name === value)
                return item ? `${value} (${item.percentage}%)` : value
              }}
            />
          </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 sm:mt-4 space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-emerald-900 dark:text-emerald-100">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-xs text-emerald-500 dark:text-emerald-500">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

