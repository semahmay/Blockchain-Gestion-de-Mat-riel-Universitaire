import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Card } from './Card'

type StatTone = 'navy' | 'green' | 'amber' | 'red' | 'blue'

const iconToneStyles: Record<StatTone, string> = {
  navy: 'bg-brand-50 text-brand-800 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100',
  blue: 'bg-sky-50 text-sky-700 ring-sky-100',
}

const metaToneStyles: Record<StatTone, string> = {
  navy: 'text-brand-800',
  green: 'text-emerald-700',
  amber: 'text-amber-700',
  red: 'text-rose-700',
  blue: 'text-sky-700',
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  meta?: { label: string; positive?: boolean }
  tone?: StatTone
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  meta,
  tone = 'navy',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-2.5 text-[32px] font-semibold leading-none tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
            iconToneStyles[tone],
          )}
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        {meta ? (
          <span
            className={cn(
              'text-xs font-semibold',
              meta.positive === false ? 'text-amber-700' : metaToneStyles[tone],
            )}
          >
            {meta.label}
          </span>
        ) : null}
        {meta && hint ? <span className="text-[11px] text-slate-300">•</span> : null}
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
    </Card>
  )
}
