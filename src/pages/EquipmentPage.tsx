import { useState } from 'react'
import { ClipboardList, SearchX, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { equipmentCategories } from '../lib/categories'
import { cn } from '../lib/utils'
import type { Equipment, EquipmentCategory } from '../types'
import { EquipmentCard } from '../components/equipment/EquipmentCard'
import { RequestLoanModal } from '../components/equipment/RequestLoanModal'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'

type CategoryFilter = 'Tous' | EquipmentCategory

const categoryFilters: CategoryFilter[] = ['Tous', ...equipmentCategories]

export function EquipmentPage() {
  const { equipment, loans, currentUser } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState<CategoryFilter>('Tous')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const search = searchParams.get('q') ?? ''
  const normalizedSearch = search.trim().toLowerCase()

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }

    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    setCategory('Tous')
    setAvailableOnly(false)
    setSearchParams({}, { replace: true })
  }

  const hasActiveRequest = (equipmentId: string) =>
    loans.some(
      (loan) =>
        loan.equipmentId === equipmentId &&
        loan.studentId === currentUser.studentId &&
        (loan.status === 'pending' || loan.status === 'approved'),
    )

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [item.name, item.category, item.reference, item.description, item.location]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)

    const matchesCategory = category === 'Tous' || item.category === category
    const matchesAvailability =
      !availableOnly || (item.status === 'available' && item.availableUnits > 0)

    return matchesSearch && matchesCategory && matchesAvailability
  })

  const availableUnits = equipment.reduce(
    (total, item) => total + Math.min(item.availableUnits, item.totalUnits),
    0,
  )
  const hasFilters = search.length > 0 || category !== 'Tous' || availableOnly

  function openRequestModal(item: Equipment) {
    setSelectedEquipment(item)
  }

  function closeRequestModal() {
    setSelectedEquipment(null)
  }

  return (
    <div>
      <PageHeader
        title="Catalogue du matériel"
        description="Parcourez le parc de matériel universitaire et envoyez votre demande de prêt en quelques clics."
        eyebrow={
          <Badge tone="green" dot>
            {availableUnits} unités disponibles
          </Badge>
        }
        actions={
          <ButtonLink to="/my-loans" variant="secondary">
            <ClipboardList size={15} aria-hidden="true" />
            Mes demandes
          </ButtonLink>
        }
      />

      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            value={search}
            onChange={updateSearch}
            placeholder="Rechercher un matériel…"
            ariaLabel="Rechercher dans le catalogue"
            className="xl:max-w-md"
          />

          <div className="scrollbar-none -mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 xl:justify-end xl:pb-0">
            {categoryFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCategory(filter)}
                aria-pressed={category === filter}
                className={cn(
                  'h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition',
                  category === filter
                    ? 'border-brand-900 bg-brand-900 text-white shadow-sm'
                    : 'border-line bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            <span
              className="relative h-5 w-9 shrink-0 rounded-full bg-slate-200 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-brand-900 peer-checked:after:translate-x-4"
              aria-hidden="true"
            />
            <span className="whitespace-nowrap">Disponibles uniquement</span>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-slate-500">
            <strong className="font-semibold text-slate-900">{filteredEquipment.length}</strong>{' '}
            résultat{filteredEquipment.length > 1 ? 's' : ''} sur {equipment.length} références
          </p>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <SlidersHorizontal size={13} aria-hidden="true" />
              Réinitialiser les filtres
            </Button>
          ) : null}
        </div>
      </Card>

      {filteredEquipment.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={SearchX}
          title="Aucun matériel ne correspond"
          description="Essayez un autre mot-clé, changez de catégorie ou désactivez le filtre de disponibilité."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          }
        />
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              hasActiveRequest={hasActiveRequest(item.id)}
              onRequest={openRequestModal}
            />
          ))}
        </div>
      )}

      {selectedEquipment ? (
        <RequestLoanModal equipment={selectedEquipment} onClose={closeRequestModal} />
      ) : null}
    </div>
  )
}
