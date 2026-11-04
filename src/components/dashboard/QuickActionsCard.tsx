import { ChevronRight, Inbox, Package, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../ui/Card'

interface QuickActionsCardProps {
  pendingCount: number
}

const actions = [
  {
    title: 'Demander du matériel',
    description: 'Parcourir le catalogue et envoyer une demande.',
    to: '/equipment',
    icon: Package,
  },
  {
    title: 'Valider des demandes',
    description: 'Traiter la file d’attente de l’administration.',
    to: '/admin/loans',
    icon: Inbox,
    badge: true,
  },
  {
    title: 'Consulter l’historique',
    description: 'Visualiser les transactions simulées.',
    to: '/blockchain',
    icon: WalletCards,
  },
]

export function QuickActionsCard({ pendingCount }: QuickActionsCardProps) {
  return (
    <Card>
      <CardHeader title="Accès rapides" description="Les actions les plus utilisées." />

      <div className="space-y-2 border-t border-line p-3 sm:p-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-brand-100 group-hover:text-brand-800">
                <Icon size={17} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-900">
                  {action.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                  {action.description}
                </span>
              </span>
              {action.badge && pendingCount > 0 ? (
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                  {pendingCount}
                </span>
              ) : (
                <ChevronRight
                  size={15}
                  className="shrink-0 text-slate-300 transition group-hover:text-brand-500"
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
