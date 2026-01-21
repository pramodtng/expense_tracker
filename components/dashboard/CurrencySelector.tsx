import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Currency } from "@/lib/currency"
import { getCurrencySymbol, CURRENCIES } from "@/lib/currency"
import { useCurrency } from "@/hooks/use-currency"

interface CurrencySelectorProps {
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  const { mounted } = useCurrency()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-700 dark:text-emerald-300 gap-2 font-medium"
          suppressHydrationWarning
        >
          {mounted ? (
            <>
              <span className="text-lg">{getCurrencySymbol(currency)}</span>
              <span className="hidden sm:inline">{currency.code}</span>
            </>
          ) : (
            <>
              <span className="text-lg">$</span>
              <span className="hidden sm:inline">USD</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Select Currency
          </div>
          
          <div className="max-h-75 overflow-y-auto">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => onCurrencyChange(curr)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  currency.code === curr.code
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{curr.symbol}</span>
                  <span>{curr.code}</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    - {curr.name}
                  </span>
                </div>
                {currency.code === curr.code && (
                  <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}