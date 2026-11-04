import { ArrowRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Loan } from '../../types'
import { categoryMeta } from '../../lib/categories'
import { formatDateShort, formatRelative } from '../../lib/dates'
import { Avatar } from '../ui/Avatar'
import { Card, CardHeader } from '../ui/Card'
import { LoanStatusBadge } from '../ui/StatusBadge'

export function RecentRequestsCard({ loans }: { loans: Loan[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Demandes récentes"
        description="Dernières demandes de prêt soumises sur la plateforme."
        action={
          <Link
            to="/admin/loans"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
          >
            Tout voir
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      {loans.length === 0 ? (
        <div className="border-t border-line px-6 py-10 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-400">
            <Inbox size={20} />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-700">Aucune demande récente</p>
          <p className="mt-1 text-xs text-slate-500">
            Les nouvelles demandes apparaîtront ici dès leur soumission.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {loans.map((loan) => {
            const CategoryIcon = categoryMeta[loan.category].icon

            return (
              <li key={loan.id}>
                <Link
                  to="/admin/loans"
                  className="flex flex-col gap-3 px-5 py-3.5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={loan.studentName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {loan.studentName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <CategoryIcon
                          size={12}
                          className="shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                        <span className="truncate">{loan.equipmentName}</span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDateShort(loan.startDate)} → {formatDateShort(loan.endDate)}
                        <span className="mx-1.5 text-slate-300">·</span>
                        Réf. {loan.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pl-11 sm:pl-0">
                    <span className="text-[11px] text-slate-400">
                      {formatRelative(loan.requestedAt)}
                    </span>
                    <LoanStatusBadge loan={loan} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
