import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionFilters } from "@/types/dashboard"

type TransactionsFilterProps = {
  filters: TransactionFilters
  categories: Array<{ id: string; name: string }>
  onFilterChange: (filters: Partial<TransactionFilters>) => void
}

export function TransactionsFilter({
  filters,
  categories,
  onFilterChange,
}: TransactionsFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-9"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.type}
          onValueChange={(value) =>
            onFilterChange({ type: value as "all" | "income" | "expense" })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() =>
            onFilterChange({
              sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
            })
          }
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {filters.sortBy === "date" ? "Date" : "Amount"}
          {filters.sortOrder === "asc" ? " ↑" : " ↓"}
        </Button>
      </div>
    </div>
  )
}
