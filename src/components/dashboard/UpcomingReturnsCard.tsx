import { ArrowRight, CalendarCheck2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Loan } from '../../types'
import { categoryMeta } from '../../lib/categories'
import { daysUntil, dueLabelCompact, formatDate } from '../../lib/dates'
import { cn } from '../../lib/utils'
import { Card, CardHeader } from '../ui/Card'

export function UpcomingReturnsCard({ loans }: { loans: Loan[] }) {
  return (
    <Card>
      <CardHeader
        title="Vos prochains retours"
        description="Anticipez la restitution de vos emprunts en cours."
        action={
          <Link
            to="/my-loans"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
          >
            Gérer
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      <div className="border-t border-line p-3 sm:p-4">
        {loans.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
            <CalendarCheck2 size={22} className="mx-auto text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-xs font-medium text-slate-700">Aucun retour à venir</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Vos emprunts en cours apparaîtront ici.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {loans.map((loan) => {
              const days = daysUntil(loan.endDate)
              const meta = categoryMeta[loan.category]
              const Icon = meta.icon

              return (
                <li key={loan.id}>
                  <Link
                    to="/my-loans"
                    className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset',
                        meta.tileClass,
                      )}
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {loan.equipmentName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        Retour prévu le {formatDate(loan.endDate)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold',
                        days < 0
                          ? 'bg-red-50 text-red-700'
                          : days <= 2
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {dueLabelCompact(loan.endDate)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
