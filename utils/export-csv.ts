import type { Transaction } from "@/types/transaction"
import type { Currency } from "@/lib/currency"
import { formatCurrency } from "@/lib/currency"

export function exportTransactionsToCSV(
  transactions: Transaction[], 
  currency: Currency
): void {
  const headers = ["Date", "Type", "Description", "Category", "Amount"]
  const csvRows = [
    headers.join(","),
    ...transactions.map(t =>
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
  
  URL.revokeObjectURL(url)
}
