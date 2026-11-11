import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Inbox,
  Info,
  Menu,
  Search,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '../../context/useApp'
import { daysUntil, formatDate } from '../../lib/dates'
import { cn } from '../../lib/utils'
import { WalletButton } from '../wallet/WalletButton'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/equipment': 'Catalogue du matériel',
  '/my-loans': 'Mes emprunts',
  '/admin/loans': 'Demandes à valider',
  '/blockchain': 'Historique blockchain',
}

interface NotificationItem {
  id: string
  title: string
  description: string
  to: string
  icon: LucideIcon
  tone: 'amber' | 'red' | 'navy'
}

const notificationTones = {
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  navy: 'bg-brand-50 text-brand-700',
}

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { currentUser, loans } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [readNotificationKey, setReadNotificationKey] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const pageTitle = pageTitles[location.pathname] ?? 'CampusChain'

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = []
    const pending = loans.filter((loan) => loan.status === 'pending')
    const myUpcoming = loans.filter(
      (loan) =>
        loan.studentId === currentUser.studentId &&
        loan.status === 'approved' &&
        daysUntil(loan.endDate) >= 0 &&
        daysUntil(loan.endDate) <= 7,
    )
    const overdue = loans.filter(
      (loan) => loan.status === 'approved' && daysUntil(loan.endDate) < 0,
    )

    if (pending.length > 0) {
      items.push({
        id: 'pending-requests',
        title: `${pending.length} demande${pending.length > 1 ? 's' : ''} en attente`,
        description: 'Des demandes attendent une décision de l’administration.',
        to: '/admin/loans',
        icon: Inbox,
        tone: 'amber',
      })
    }

    myUpcoming.slice(0, 2).forEach((loan) => {
      items.push({
        id: `upcoming-${loan.id}`,
        title: 'Retour à préparer',
        description: `${loan.equipmentName} — échéance le ${formatDate(loan.endDate)}.`,
        to: '/my-loans',
        icon: CalendarClock,
        tone: 'navy',
      })
    })

    if (overdue.length > 0) {
      items.push({
        id: 'overdue-loans',
        title: `${overdue.length} retour${overdue.length > 1 ? 's' : ''} en retard`,
        description: `${overdue[0].equipmentName} — ${overdue[0].studentName}.`,
        to: '/admin/loans',
        icon: TriangleAlert,
        tone: 'red',
      })
    }

    return items.slice(0, 4)
  }, [loans, currentUser.studentId])

  const notificationKey = notifications.map((item) => item.id).join('|')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasUnread = notifications.length > 0 && readNotificationKey !== notificationKey

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOpenMenu(null)
    const trimmed = query.trim()
    navigate(trimmed ? `/equipment?q=${encodeURIComponent(trimmed)}` : '/equipment')
  }

  function openProfile() {
    setOpenMenu(null)
    setProfileOpen(true)
  }

  const profileRows = [
    { label: 'Adresse e-mail', value: currentUser.email },
    { label: 'Numéro étudiant', value: currentUser.studentId },
    { label: 'Filière', value: currentUser.program },
    { label: 'Rôle', value: currentUser.role },
    { label: 'Accès', value: 'Étudiante · Vue administration de démonstration' },
  ]

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Ouvrir le menu"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:block">
              Plateforme de prêt universitaire
            </p>
            <h2 className="truncate text-sm font-semibold text-slate-900">{pageTitle}</h2>
          </div>

          <form onSubmit={handleSearch} className="relative hidden w-56 md:block xl:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher du matériel…"
              aria-label="Rechercher du matériel"
              className="h-9 w-full rounded-xl border border-line bg-slate-50 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </form>

          <button
            type="button"
            onClick={() => navigate('/equipment')}
            aria-label="Rechercher du matériel"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            <Search size={18} />
          </button>

          <div ref={menuRef} className="flex items-center gap-1.5 sm:gap-2">
            <WalletButton onOpen={() => setOpenMenu(null)} />

            <div className="hidden h-8 w-px bg-line sm:block" />

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((current) => (current === 'notifications' ? null : 'notifications'))
                }
                aria-label="Notifications"
                aria-expanded={openMenu === 'notifications'}
                className="relative grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Bell size={18} />
                {hasUnread ? (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
                ) : null}
              </button>

              {openMenu === 'notifications' ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-xl animate-scale-in sm:w-80">
                  <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    {notifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setReadNotificationKey(notificationKey)}
                        className="text-[11px] font-semibold text-brand-700 hover:text-brand-900"
                      >
                        Tout marquer lu
                      </button>
                    ) : null}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">
                      Aucune notification pour le moment.
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto p-1.5">
                      {notifications.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.id}
                            to={item.to}
                            onClick={() => {
                              setReadNotificationKey(notificationKey)
                              setOpenMenu(null)
                            }}
                            className="flex gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-slate-50"
                          >
                            <span
                              className={cn(
                                'grid size-9 shrink-0 place-items-center rounded-xl',
                                notificationTones[item.tone],
                              )}
                            >
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-slate-900">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  <div className="border-t border-line bg-slate-50/70 px-4 py-2.5">
                    <p className="text-[10px] text-slate-400">
                      Notifications générées à partir des données locales de démonstration.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="hidden h-8 w-px bg-line sm:block" />

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((current) => (current === 'profile' ? null : 'profile'))
                }
                aria-label="Ouvrir le menu du profil"
                aria-expanded={openMenu === 'profile'}
                className="flex items-center gap-2 rounded-xl p-1 pr-1 transition hover:bg-slate-50 sm:pr-2"
              >
                <Avatar name={currentUser.name} size="sm" />
                <span className="hidden min-w-0 text-left lg:block">
                  <span className="block max-w-32 truncate text-xs font-semibold text-slate-900">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-500">{currentUser.role}</span>
                </span>
                <ChevronDown
                  size={14}
                  className="hidden shrink-0 text-slate-400 sm:block"
                  aria-hidden="true"
                />
              </button>

              {openMenu === 'profile' ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-xl animate-scale-in">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {currentUser.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{currentUser.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={openProfile}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <UserRound size={15} className="text-slate-400" />
                      Mon profil
                    </button>
                    <Link
                      to="/my-loans"
                      onClick={() => setOpenMenu(null)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <ClipboardList size={15} className="text-slate-400" />
                      Mes emprunts
                    </Link>
                  </div>
                  <div className="border-t border-line bg-slate-50/70 px-4 py-2.5">
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      Session de démonstration · aucune authentification réelle.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Mon profil"
        description="Informations de la session de démonstration."
        footer={
          <Button variant="secondary" onClick={() => setProfileOpen(false)}>
            Fermer
          </Button>
        }
      >
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-slate-900">
              {currentUser.name}
            </p>
            <p className="truncate text-sm text-slate-500">{currentUser.program}</p>
            <Badge tone="navy" className="mt-2">
              {currentUser.role}
            </Badge>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {profileRows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900 sm:text-right">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            Profil fictif créé pour la démonstration du frontend. Aucune donnée personnelle réelle
            n’est utilisée.
          </p>
        </div>
      </Modal>
    </>
  )
}
