import { ArrowRight, Boxes, Clock3, Inbox, PackageCheck, Sparkles } from 'lucide-react'
import { useApp } from '../context/useApp'
import { parseDate, formatDateLong } from '../lib/dates'
import { AvailabilityCard } from '../components/dashboard/AvailabilityCard'
import { BlockchainActivityCard } from '../components/dashboard/BlockchainActivityCard'
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard'
import { RecentRequestsCard } from '../components/dashboard/RecentRequestsCard'
import { UpcomingReturnsCard } from '../components/dashboard/UpcomingReturnsCard'
import { ButtonLink } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'

const TODAY_LABEL = formatDateLong(new Date())

export function DashboardPage() {
  const { currentUser, equipment, loans, transactions, pendingCount } = useApp()

  const firstName = currentUser.name.split(' ')[0]
  const totalUnits = equipment.reduce((total, item) => total + item.totalUnits, 0)
  const availableUnits = equipment.reduce(
    (total, item) => total + Math.min(item.availableUnits, item.totalUnits),
    0,
  )
  const availablePercent = totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 0
  const activeLoans = loans.filter((loan) => loan.status === 'approved')
  const pendingLoans = loans.filter((loan) => loan.status === 'pending')

  const myActiveLoans = activeLoans
    .filter((loan) => loan.studentId === currentUser.studentId)
    .sort((first, second) => parseDate(first.endDate).getTime() - parseDate(second.endDate).getTime())

  const recentRequests = [...loans]
    .sort((first, second) => Date.parse(second.requestedAt) - Date.parse(first.requestedAt))
    .slice(0, 4)

  const recentTransactions = [...transactions]
    .sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-brand-900 px-6 py-6 text-white shadow-lift sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-grid-white opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-brand-500/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-50">
              <Sparkles size={12} aria-hidden="true" />
              Espace étudiant
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bonjour, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-100">
              {TODAY_LABEL} — Retrouvez ici l’activité du parc de matériel, vos prochains retours
              et les demandes à valider.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <ButtonLink to="/equipment" variant="white">
              Demander du matériel
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/my-loans" variant="light">
              Mes emprunts
            </ButtonLink>
          </div>
        </div>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Statistiques de la plateforme"
      >
        <StatCard
          label="Équipements"
          value={totalUnits}
          icon={Boxes}
          tone="navy"
          meta={{ label: `${equipment.length} références` }}
          hint="Parc universitaire"
        />
        <StatCard
          label="Disponibles"
          value={availableUnits}
          icon={PackageCheck}
          tone="green"
          meta={{ label: `${availablePercent} % du parc` }}
          hint="Prêts possibles"
        />
        <StatCard
          label="Emprunts actifs"
          value={activeLoans.length}
          icon={Clock3}
          tone="blue"
          meta={{ label: `${myActiveLoans.length} vous concernant` }}
          hint="En cours"
        />
        <StatCard
          label="Demandes en attente"
          value={pendingLoans.length}
          icon={Inbox}
          tone="amber"
          meta={{ label: pendingCount > 0 ? 'À traiter' : 'À jour', positive: pendingCount === 0 }}
          hint="File d’administration"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentRequestsCard loans={recentRequests} />
          <AvailabilityCard equipment={equipment} />
        </div>

        <div className="space-y-6">
          <UpcomingReturnsCard loans={myActiveLoans} />
          <QuickActionsCard pendingCount={pendingCount} />
          <BlockchainActivityCard transactions={recentTransactions} />
        </div>
      </div>
    </div>
  )
}
