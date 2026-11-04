import { NavLink } from 'react-router-dom'
import {
  Blocks,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Package,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '../../context/useApp'
import { cn } from '../../lib/utils'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  badge?: 'pending' | 'myLoans'
}

const mainNav: NavItem[] = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Matériel', to: '/equipment', icon: Package },
  { label: 'Mes emprunts', to: '/my-loans', icon: ClipboardList, badge: 'myLoans' },
]

const adminNav: NavItem[] = [
  { label: 'Demandes à valider', to: '/admin/loans', icon: Inbox, badge: 'pending' },
  { label: 'Historique blockchain', to: '/blockchain', icon: Blocks },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { currentUser, loans, pendingCount } = useApp()
  const myActiveLoans = loans.filter(
    (loan) => loan.studentId === currentUser.studentId && loan.status === 'approved',
  ).length

  function renderNav(items: NavItem[]) {
    return items.map((item) => {
      const Icon = item.icon
      const count =
        item.badge === 'pending'
          ? pendingCount
          : item.badge === 'myLoans'
            ? myActiveLoans
            : 0

      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={18}
                strokeWidth={isActive ? 2.1 : 1.9}
                className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-400')}
              />
              <span className="truncate">{item.label}</span>
              {count > 0 ? (
                <span
                  className={cn(
                    'ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-4',
                    isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {count}
                </span>
              ) : null}
            </>
          )}
        </NavLink>
      )
    })
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5">
          <NavLink to="/" onClick={onClose} className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-900 text-white shadow-sm">
              <Blocks size={18} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-tight text-slate-900">
                CampusChain
              </span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Prêt de matériel
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Principal
          </p>
          <nav className="space-y-1">{renderNav(mainNav)}</nav>

          <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Administration
          </p>
          <nav className="space-y-1">{renderNav(adminNav)}</nav>

          <div className="mx-1 mt-6 rounded-xl border border-brand-100 bg-brand-50/70 p-3">
            <div className="flex items-center gap-2 text-brand-800">
              <ShieldCheck size={14} className="shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                Démo frontend
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-brand-700/80">
              Blockchain non connectée. Les transactions affichées sont simulées localement.
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-line p-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-900 text-xs font-semibold text-white">
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="truncate text-[11px] text-slate-500">{currentUser.program}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="truncate">Session de démonstration</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-800 ring-1 ring-brand-100">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
