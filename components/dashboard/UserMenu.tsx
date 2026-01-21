
import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: User
  profile?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  onSignOut: () => void
  onSettingsClick: () => void
}


function getInitials(input?: string) {
  const value = (input ?? "").trim()
  if (!value) return "US"

  // Split on whitespace and common separators, then take up to 2 initials
  const parts = value
    .split(/[\s._-]+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .join("")

  return initials || "US"
}

function getEmailLocalPart(email?: string | null) {
  if (!email) return ""
  const at = email.indexOf("@")
  return at >= 0 ? email.slice(0, at) : email
}

export function UserMenu({ user, profile, onSignOut, onSettingsClick }: UserMenuProps) {
  const avatarUrl =
    profile?.avatar_url ??
    ((user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined))

  const email = user.email ?? ""
  const emailName = getEmailLocalPart(user.email)

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    emailName ||
    "User"

  const initials = React.useMemo(() => getInitials(displayName), [displayName])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 rounded-full px-2 flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          aria-label="Open user menu"
        >
          <Avatar src={avatarUrl || undefined} alt={displayName} className="h-7 w-7">
            <AvatarFallback className="bg-emerald-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <ChevronDown className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="p-2">
          <div className="flex items-center gap-2">
            <Avatar src={avatarUrl || undefined} alt={displayName} className="h-8 w-8">
              <AvatarFallback className="bg-emerald-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex flex-col">
              <p className="text-sm font-medium leading-none truncate">
                {displayName}
              </p>
              {email ? (
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {email}
                </p>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onSettingsClick()}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
          onSelect={() => onSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}