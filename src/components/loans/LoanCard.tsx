import {
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  RotateCcw,
  X,
} from 'lucide-react'
import type { Loan } from '../../types'
import { categoryMeta } from '../../lib/categories'
import {
  daysUntil,
  differenceInDays,
  dueLabel,
  formatDate,
} from '../../lib/dates'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { LoanStatusBadge } from '../ui/StatusBadge'

interface LoanCardProps {
  loan: Loan
  onRequestReturn: (loan: Loan) => void
  onCancel: (loan: Loan) => void
}

export function LoanCard({ loan, onRequestReturn, onCancel }: LoanCardProps) {
  const meta = categoryMeta[loan.category]
  const CategoryIcon = meta.icon
  const duration = differenceInDays(loan.startDate, loan.endDate)
  const remainingDays = daysUntil(loan.endDate)

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
              meta.tileClass,
            )}
            aria-hidden="true"
          >
            <CategoryIcon size={21} strokeWidth={1.9} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
                {loan.equipmentName}
              </h3>
              <LoanStatusBadge loan={loan} />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Réf. {loan.id} · {loan.category}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{loan.purpose}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {loan.status === 'pending' ? (
            <Button variant="dangerSoft" size="sm" onClick={() => onCancel(loan)}>
              <X size={14} aria-hidden="true" />
              Annuler la demande
            </Button>
          ) : null}

          {loan.status === 'approved' ? (
            <Button variant="secondary" size="sm" onClick={() => onRequestReturn(loan)}>
              <RotateCcw size={14} aria-hidden="true" />
              Enregistrer le retour
            </Button>
          ) : null}

          {loan.status === 'returned' && loan.returnedAt ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 size={14} aria-hidden="true" />
              Retourné le {formatDate(loan.returnedAt)}
            </span>
          ) : null}

          {loan.status === 'cancelled' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Ban size={14} aria-hidden="true" />
              Demande annulée
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-line bg-slate-50/70 p-4 sm:grid-cols-3">
        <div className="flex items-start gap-2.5">
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Date de retrait
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">
              {formatDate(loan.startDate)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CalendarClock size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Date de retour prévue
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">
              {formatDate(loan.endDate)}
            </p>
            {loan.status === 'pending' || loan.status === 'approved' ? (
              <p
                className={cn(
                  'mt-0.5 text-[10px] font-medium',
                  remainingDays < 0
                    ? 'text-red-600'
                    : remainingDays <= 2
                      ? 'text-amber-600'
                      : 'text-slate-400',
                )}
              >
                {dueLabel(loan.endDate)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Durée du prêt
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">{duration} jours</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Demande envoyée {formatDate(loan.requestedAt)}
            </p>
          </div>
        </div>
      </div>

      {loan.status === 'rejected' && loan.adminNote ? (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-red-100 bg-red-50/70 p-3 text-xs leading-relaxed text-red-700">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold">Motif du refus :</strong> {loan.adminNote}
          </p>
        </div>
      ) : null}
    </Card>
  )
}
