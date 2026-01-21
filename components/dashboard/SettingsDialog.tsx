"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Currency } from "@/lib/currency"
import { getCurrencySymbol, CURRENCIES } from "@/lib/currency"
import { useCurrency } from "@/hooks/use-currency"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  currency,
  onCurrencyChange,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { mounted } = useCurrency()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your preferences and app settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dark Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Theme</Label>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "Currently enabled" : "Currently disabled"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Currency</Label>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-xs text-muted-foreground mb-3">
                Select your preferred currency for displaying amounts
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1">
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
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">{curr.symbol}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{curr.code}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          {curr.name}
                        </span>
                      </div>
                    </div>
                    {currency.code === curr.code && (
                      <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
