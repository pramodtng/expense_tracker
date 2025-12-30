"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { formatCurrency, type Currency } from "@/lib/currency"

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  date: string
}

interface AnalyticsChartProps {
  transactions: Transaction[]
  currency?: Currency
}

export default function AnalyticsChart({ transactions, currency }: AnalyticsChartProps) {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("7days")

  const chartData = useMemo(() => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toISOString().split("T")[0]
    })

    return dateRange.map((date) => {
      const dayTransactions = transactions.filter((t) => t.date === date)
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
      const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        date: format(new Date(date), days <= 7 ? "EEE" : days <= 30 ? "MMM d" : "MMM"),
        fullDate: date,
        income,
        expenses,
        net: income - expenses,
      }
    })
  }, [transactions, timeRange])

  const isDark = theme === "dark"
  const gridColor = isDark ? "#1f2937" : "#d1fae5"
  const textColor = isDark ? "#d1fae5" : "#059669"

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Select value={timeRange} onValueChange={(value: "7days" | "30days" | "90days") => setTimeRange(value)}>
          <SelectTrigger className="w-[120px] border-emerald-200 dark:border-emerald-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={chartType} onValueChange={(value: "bar" | "line") => setChartType(value)}>
          <SelectTrigger className="w-[100px] border-emerald-200 dark:border-emerald-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="line">Line</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "bar" ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#d1fae5"}`,
                borderRadius: "8px",
                color: isDark ? "#d1fae5" : "#059669",
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#d1fae5"}`,
                borderRadius: "8px",
                color: isDark ? "#d1fae5" : "#059669",
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Net" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
