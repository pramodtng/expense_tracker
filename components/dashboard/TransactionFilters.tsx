import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, Download } from "lucide-react"
import type { FilterType, DateFilter, SortBy, SortOrder } from "@/types/transaction"

interface TransactionFiltersProps {
  searchQuery: string
  typeFilter: FilterType
  dateFilter: DateFilter
  sortBy: SortBy
  sortOrder: SortOrder
  onSearchChange: (value: string) => void
  onTypeFilterChange: (value: FilterType) => void
  onDateFilterChange: (value: DateFilter) => void
  onSortByChange: (value: SortBy) => void
  onSortOrderToggle: () => void
  onExport: () => void
}

export function TransactionFilters({
  searchQuery,
  typeFilter,
  dateFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onTypeFilterChange,
  onDateFilterChange,
  onSortByChange,
  onSortOrderToggle,
  onExport,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-emerald-200 dark:border-emerald-800"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[140px] border-emerald-200 dark:border-emerald-800">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="amount">Sort by Amount</SelectItem>
            <SelectItem value="description">Sort by Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onSortOrderToggle}
          className="border-emerald-200 dark:border-emerald-800"
          title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>

        <Button
          variant="outline"
          onClick={onExport}
          className="border-emerald-200 dark:border-emerald-800"
          title="Export to CSV"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}