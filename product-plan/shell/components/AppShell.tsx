import type { ReactNode } from 'react'
import { MainNav } from './MainNav'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface AppShellUser {
  name: string
  avatarUrl?: string
}

export interface AppShellProps {
  children: ReactNode
  navigationItems?: NavigationItem[]
  user?: AppShellUser
  theme?: 'light' | 'dark'
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onOpenSettings?: () => void
  onToggleTheme?: () => void
  onLogoClick?: () => void
}

export function AppShell({
  children,
  navigationItems = [],
  user,
  theme = 'light',
  onNavigate,
  onLogout,
  onOpenSettings,
  onToggleTheme,
  onLogoClick,
}: AppShellProps) {
  return (
    <div className="h-dvh max-h-dvh overflow-hidden flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      <MainNav
        navigationItems={navigationItems}
        user={user}
        theme={theme}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenSettings={onOpenSettings}
        onToggleTheme={onToggleTheme}
        onLogoClick={onLogoClick}
      />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
