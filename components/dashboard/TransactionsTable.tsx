import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Transaction } from "@/types/dashboard"
import { format, parseISO } from "date-fns"
import { formatCurrency, Currency } from "@/lib/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import * as React from "react"

const DEFAULT_PAGE_SIZE = 10

interface PaginationState {
  currentPage: number
  pageSize: number
}

type TransactionsTableProps = {
  transactions: Transaction[]
  isLoading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  currency: Currency
  pagination?: boolean
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  currentPage?: number
  pageSize?: number
  totalItems?: number
}

export function TransactionsTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  currency,
  pagination = true,
  pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions: customPageSizeOptions,
  onPageChange,
  onPageSizeChange,
  currentPage: controlledPage,
  totalItems: controlledTotalItems,
}: TransactionsTableProps) {
  const [uncontrolledPagination, setUncontrolledPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: initialPageSize,
  })

  const isControlled = controlledPage !== undefined
  const currentPage = isControlled ? controlledPage : uncontrolledPagination.currentPage
  const pageSize = isControlled ? initialPageSize : uncontrolledPagination.pageSize
  
  const totalItems = controlledTotalItems ?? transactions.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const pageSizeOptions = customPageSizeOptions || [5, 10, 20, 50, 100]
  const showPagination = pagination && totalItems > (pageSizeOptions[0] || DEFAULT_PAGE_SIZE)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    if (onPageChange) {
      onPageChange(page)
    } else if (!isControlled) {
      setUncontrolledPagination(prev => ({ ...prev, currentPage: page }))
    }
  }

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size)
    } else if (!isControlled) {
      setUncontrolledPagination({
        currentPage: 1,
        pageSize: size,
      })
    }
  }

  // Get current items
  const currentItems = !pagination 
    ? transactions 
    : transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (isLoading) {
    return <TransactionsTableSkeleton />
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No transactions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add your first transaction to get started
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {format(parseISO(transaction.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{transaction.description || 'No description'}</TableCell>
              <TableCell>
                {transaction.categories ? (
                  <Badge
                    variant="outline"
                    className="border-transparent"
                    style={{
                      backgroundColor: `${transaction.categories.color}20`,
                      color: transaction.categories.color,
                      borderColor: transaction.categories.color,
                    }}
                  >
                    {transaction.categories.name}
                  </Badge>
                ) : (
                  <Badge variant="outline">Uncategorized</Badge>
                )}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount), currency)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => onDelete(transaction)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showPagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> transactions
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">per page</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rows)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}
