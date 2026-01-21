// components/dashboard/DashboardHeader.tsx
import { User } from "@supabase/supabase-js"
import { UserMenu } from "./UserMenu"

interface DashboardHeaderProps {
  user: User
  profile: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  onSignOut: () => void
  onSettingsClick: () => void
}

export function DashboardHeader({ user, profile, onSignOut, onSettingsClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Budget Tracker</span>
        </div>

        <div className="flex items-center gap-2">
          <UserMenu 
            user={user} 
            profile={profile}
            onSignOut={onSignOut}
            onSettingsClick={onSettingsClick}
          />
        </div>
      </div>
    </header>
  )
}