import type { Equipment } from '../../types'
import { categoryMeta, equipmentCategories } from '../../lib/categories'
import { cn } from '../../lib/utils'
import { Card, CardHeader } from '../ui/Card'

export function AvailabilityCard({ equipment }: { equipment: Equipment[] }) {
  const totalUnits = equipment.reduce((total, item) => total + item.totalUnits, 0)
  const availableUnits = equipment.reduce(
    (total, item) => total + Math.min(item.availableUnits, item.totalUnits),
    0,
  )

  return (
    <Card>
      <CardHeader
        title="Disponibilité par catégorie"
        description="Unités actuellement disponibles dans le parc de matériel."
        action={
          <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {availableUnits} / {totalUnits} unités
          </span>
        }
      />

      <div className="border-t border-line px-5 py-5 sm:px-6">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {equipmentCategories.map((category) => {
            const items = equipment.filter((item) => item.category === category)
            const categoryTotal = items.reduce((total, item) => total + item.totalUnits, 0)
            const categoryAvailable = items.reduce(
              (total, item) => total + Math.min(item.availableUnits, item.totalUnits),
              0,
            )
            const percentage =
              categoryTotal > 0 ? Math.round((categoryAvailable / categoryTotal) * 100) : 0
            const meta = categoryMeta[category]
            const Icon = meta.icon

            return (
              <div key={category}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset',
                        meta.tileClass,
                      )}
                      aria-hidden="true"
                    >
                      <Icon size={14} />
                    </span>
                    <span className="truncate text-xs font-medium text-slate-700">{category}</span>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                    {categoryAvailable} / {categoryTotal}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full', meta.barClass)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  {percentage}% du stock disponible
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
