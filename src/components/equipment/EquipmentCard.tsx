import { Boxes, MapPin, Send } from 'lucide-react'
import type { Equipment } from '../../types'
import { categoryMeta } from '../../lib/categories'
import { getEquipmentAvailability } from '../../lib/status'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EquipmentAvailabilityBadge } from '../ui/StatusBadge'

interface EquipmentCardProps {
  equipment: Equipment
  hasActiveRequest: boolean
  onRequest: (equipment: Equipment) => void
}

export function EquipmentCard({ equipment, hasActiveRequest, onRequest }: EquipmentCardProps) {
  const category = categoryMeta[equipment.category]
  const CategoryIcon = category.icon
  const availability = getEquipmentAvailability(equipment)
  const availabilityRatio =
    equipment.totalUnits > 0
      ? Math.round((equipment.availableUnits / equipment.totalUnits) * 100)
      : 0

  const buttonLabel = !availability.isAvailable
    ? 'Indisponible'
    : hasActiveRequest
      ? 'Demande en cours'
      : 'Demander un prêt'

  return (
    <Card className="group flex h-full flex-col p-5 transition duration-200 hover:border-brand-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
            category.tileClass,
          )}
          aria-hidden="true"
        >
          <CategoryIcon size={21} strokeWidth={1.9} />
        </span>
        <EquipmentAvailabilityBadge equipment={equipment} />
      </div>

      <div className="mt-4 min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
          {equipment.category} · {equipment.reference}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.7rem] text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
          {equipment.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">
          {equipment.description}
        </p>

        <div className="mt-4 space-y-2.5 border-t border-line pt-4">
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="line-clamp-1">{equipment.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Boxes size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span>{availability.unitsLabel}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                availability.isAvailable ? category.barClass : 'bg-slate-300',
              )}
              style={{ width: `${availabilityRatio}%` }}
            />
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant={availability.isAvailable && !hasActiveRequest ? 'primary' : 'secondary'}
        className="mt-5 w-full"
        onClick={() => onRequest(equipment)}
        disabled={!availability.isAvailable || hasActiveRequest}
      >
        <Send size={14} aria-hidden="true" />
        {buttonLabel}
      </Button>
    </Card>
  )
}
