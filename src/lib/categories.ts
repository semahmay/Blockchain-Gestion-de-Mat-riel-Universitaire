import { Armchair, Camera, FlaskConical, Laptop } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { EquipmentCategory } from '../types'

export const equipmentCategories: EquipmentCategory[] = [
  'Informatique',
  'Audiovisuel',
  'Laboratoire',
  'Mobilier',
]

interface CategoryMeta {
  icon: LucideIcon
  tileClass: string
  barClass: string
}

export const categoryMeta: Record<EquipmentCategory, CategoryMeta> = {
  Informatique: {
    icon: Laptop,
    tileClass: 'bg-sky-50 text-sky-700 ring-sky-100',
    barClass: 'bg-sky-500',
  },
  Audiovisuel: {
    icon: Camera,
    tileClass: 'bg-violet-50 text-violet-700 ring-violet-100',
    barClass: 'bg-violet-500',
  },
  Laboratoire: {
    icon: FlaskConical,
    tileClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    barClass: 'bg-emerald-500',
  },
  Mobilier: {
    icon: Armchair,
    tileClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    barClass: 'bg-amber-500',
  },
}
