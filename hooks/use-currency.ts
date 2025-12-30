"use client"

import { useState, useEffect } from "react"
import { Currency, DEFAULT_CURRENCY, CURRENCIES } from "@/lib/currency"

const CURRENCY_STORAGE_KEY = "budget-tracker-currency"

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true)
    
    // Load currency from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const found = CURRENCIES.find((c) => c.code === parsed.code)
          if (found) {
            setCurrency(found)
          }
        } catch (e) {
          console.error("Error parsing stored currency:", e)
        }
      }
    }
  }, [])

  const updateCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(newCurrency))
    }
  }

  return { currency, setCurrency: updateCurrency, mounted }
}

