import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useCounts() {
  const [categoriesCount, setCategoriesCount] = useState(0)
  const [budgetsCount, setBudgetsCount] = useState(0)
  const supabase = createClient()

  const fetchCounts = useCallback(async () => {
    const [categoriesResult, budgetsResult] = await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("budgets").select("id", { count: "exact", head: true }),
    ])
    
    setCategoriesCount(categoriesResult.count || 0)
    setBudgetsCount(budgetsResult.count || 0)
  }, [supabase])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return { categoriesCount, budgetsCount, fetchCounts }
}