import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"
import type { Currency } from "@/lib/currency"
import { CurrencySelector } from "./CurrencySelector"

interface DashboardHeaderProps {
  user: User
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
  onSignOut: () => void
}

export function DashboardHeader({ 
  user, 
  currency, 
  onCurrencyChange, 
  onSignOut 
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Budget Tracker
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <CurrencySelector currency={currency} onCurrencyChange={onCurrencyChange} />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-emerald-700 dark:text-emerald-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <span className="text-sm text-emerald-700 dark:text-emerald-300 hidden sm:inline">
            {user.email}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSignOut}
            className="text-emerald-700 dark:text-emerald-300"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
