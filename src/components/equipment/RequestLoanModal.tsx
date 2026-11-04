import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, CalendarDays, Clock3, Info, Send, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/useApp'
import { categoryMeta } from '../../lib/categories'
import {
  addDays,
  dateFromToday,
  differenceInDays,
  parseDate,
  todayInput,
  toDateInput,
} from '../../lib/dates'
import { getEquipmentAvailability } from '../../lib/status'
import type { Equipment } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface RequestLoanModalProps {
  equipment: Equipment
  onClose: () => void
}

const fieldStyles =
  'h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10'

export function RequestLoanModal({ equipment, onClose }: RequestLoanModalProps) {
  const { createLoan } = useApp()
  const [startDate, setStartDate] = useState(dateFromToday(1))
  const [endDate, setEndDate] = useState(dateFromToday(8))
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState('')

  const category = categoryMeta[equipment.category]
  const CategoryIcon = category.icon
  const availability = getEquipmentAvailability(equipment)
  const duration =
    startDate && endDate && parseDate(endDate) > parseDate(startDate)
      ? differenceInDays(startDate, endDate)
      : 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!startDate || !endDate) {
      setError('Veuillez renseigner les dates de retrait et de retour.')
      return
    }

    if (parseDate(endDate) <= parseDate(startDate)) {
      setError('La date de retour doit être postérieure à la date de retrait.')
      return
    }

    if (purpose.trim().length < 5) {
      setError('Merci d’indiquer un motif d’au moins 5 caractères.')
      return
    }

    const result = createLoan({ equipment, startDate, endDate, purpose })

    if (!result.ok) {
      setError(result.error ?? 'La demande n’a pas pu être envoyée.')
      return
    }

    onClose()
  }

  function handleStartChange(value: string) {
    setStartDate(value)
    if (value && endDate && parseDate(endDate) <= parseDate(value)) {
      setEndDate(toDateInput(addDays(parseDate(value), 2)))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Demander un prêt"
      description="Soumettez votre demande à l’administration. Elle restera en attente jusqu’à validation."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="request-loan-form">
            <Send size={15} aria-hidden="true" />
            Envoyer la demande
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-line bg-slate-50 p-3.5">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${category.tileClass}`}
          aria-hidden="true"
        >
          <CategoryIcon size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{equipment.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {equipment.category} · {equipment.reference}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700">{availability.unitsLabel}</p>
        </div>
      </div>

      <form id="request-loan-form" onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="loan-start-date"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Date de retrait
            </label>
            <input
              id="loan-start-date"
              type="date"
              value={startDate}
              min={todayInput()}
              onChange={(event) => handleStartChange(event.target.value)}
              className={fieldStyles}
              required
            />
          </div>
          <div>
            <label
              htmlFor="loan-end-date"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Date de retour
            </label>
            <input
              id="loan-end-date"
              type="date"
              value={endDate}
              min={startDate || todayInput()}
              onChange={(event) => setEndDate(event.target.value)}
              className={fieldStyles}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-2 text-xs text-brand-800">
          <Clock3 size={14} aria-hidden="true" />
          <span>
            Durée du prêt : <strong>{duration > 0 ? `${duration} jours` : 'à préciser'}</strong>
          </span>
          <span className="hidden text-brand-300 sm:inline">•</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            Les dates seront confirmées par l’administration.
          </span>
        </div>

        <div>
          <label
            htmlFor="loan-purpose"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Motif de la demande
          </label>
          <textarea
            id="loan-purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={3}
            maxLength={280}
            className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
            placeholder="Décrivez brièvement l’usage prévu (projet, cours, soutenance…)"
            required
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">{purpose.length} / 280</p>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <div className="flex gap-2.5 rounded-xl border border-line bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-700" />
          <div>
            <p className="font-medium text-slate-800">Demande enregistrée localement</p>
            <p className="mt-0.5">
              Aucune transaction blockchain réelle n’est créée. La validation et l’historique
              on-chain seront ajoutés avec Solidity et Ethers.js.
            </p>
          </div>
        </div>
      </form>

      <div className="mt-4 flex gap-2 text-[10px] leading-relaxed text-slate-400">
        <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Vérifiez votre emploi du temps avant de confirmer. Un matériel non rendu à temps peut
          entraîner une suspension temporaire du compte.
        </p>
      </div>
    </Modal>
  )
}
