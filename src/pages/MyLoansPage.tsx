import { useState } from 'react'
import { Check, ClipboardList, Clock3, Plus, RotateCcw, X } from 'lucide-react'
import { useApp } from '../context/useApp'
import { formatDate } from '../lib/dates'
import { cn } from '../lib/utils'
import type { Loan } from '../types'
import { LoanCard } from '../components/loans/LoanCard'
import { Button, ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'

type LoanTab = 'all' | 'pending' | 'approved' | 'history'

const tabs: Array<{ id: LoanTab; label: string }> = [
  { id: 'all', label: 'Tous' },
  { id: 'pending', label: 'En attente' },
  { id: 'approved', label: 'En cours' },
  { id: 'history', label: 'Historique' },
]

function matchesTab(loan: Loan, tab: LoanTab) {
  if (tab === 'all') return true
  if (tab === 'pending') return loan.status === 'pending'
  if (tab === 'approved') return loan.status === 'approved'
  return ['returned', 'rejected', 'cancelled'].includes(loan.status)
}

export function MyLoansPage() {
  const { currentUser, loans, cancelLoan, markReturned } = useApp()
  const [activeTab, setActiveTab] = useState<LoanTab>('all')
  const [returnTarget, setReturnTarget] = useState<Loan | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Loan | null>(null)

  const myLoans = loans
    .filter((loan) => loan.studentId === currentUser.studentId)
    .sort((first, second) => Date.parse(second.requestedAt) - Date.parse(first.requestedAt))

  const filteredLoans = myLoans.filter((loan) => matchesTab(loan, activeTab))
  const activeCount = myLoans.filter((loan) => loan.status === 'approved').length
  const pendingCount = myLoans.filter((loan) => loan.status === 'pending').length
  const returnedCount = myLoans.filter((loan) => loan.status === 'returned').length

  function countForTab(tab: LoanTab) {
    return myLoans.filter((loan) => matchesTab(loan, tab)).length
  }

  function confirmReturn() {
    if (!returnTarget) return
    markReturned(returnTarget.id)
    setReturnTarget(null)
  }

  function confirmCancel() {
    if (!cancelTarget) return
    cancelLoan(cancelTarget.id)
    setCancelTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Mes emprunts"
        description="Suivez vos demandes, vos emprunts en cours et l’historique des retours de matériel."
        actions={
          <ButtonLink to="/equipment">
            <Plus size={16} aria-hidden="true" />
            Nouvelle demande
          </ButtonLink>
        }
      />

      <section
        className="mt-6 grid gap-4 sm:grid-cols-3"
        aria-label="Résumé de mes emprunts"
      >
        <StatCard
          label="Emprunts en cours"
          value={activeCount}
          icon={Clock3}
          tone="blue"
          hint="À rendre prochainement"
        />
        <StatCard
          label="En attente"
          value={pendingCount}
          icon={ClipboardList}
          tone="amber"
          hint="Validation administrative"
        />
        <StatCard
          label="Retours effectués"
          value={returnedCount}
          icon={RotateCcw}
          tone="green"
          hint="Historique personnel"
        />
      </section>

      <Card className="mt-6 p-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="scrollbar-none flex items-center gap-0.5 overflow-x-auto">
            {tabs.map((tab) => {
              const count = countForTab(tab.id)
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-medium transition',
                    isActive
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="px-3 pb-1 text-[11px] text-slate-400 sm:pb-0 sm:pr-2">
            {filteredLoans.length} emprunt{filteredLoans.length > 1 ? 's' : ''} affiché
            {filteredLoans.length > 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {filteredLoans.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={ClipboardList}
          title="Aucun emprunt dans cette catégorie"
          description="Vos demandes et emprunts correspondant à ce filtre apparaîtront ici."
          action={
            <ButtonLink to="/equipment" variant="secondary">
              Parcourir le matériel
            </ButtonLink>
          }
        />
      ) : (
        <div className="mt-5 space-y-4">
          {filteredLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onRequestReturn={setReturnTarget}
              onCancel={setCancelTarget}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title="Confirmer le retour"
        description="Vérifiez que le matériel a bien été restitué au bureau des prêts."
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturnTarget(null)}>
              Annuler
            </Button>
            <Button onClick={confirmReturn}>
              <Check size={15} aria-hidden="true" />
              Confirmer le retour
            </Button>
          </>
        }
      >
        {returnTarget ? (
          <>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{returnTarget.equipmentName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Réf. {returnTarget.id} · Retour prévu le {formatDate(returnTarget.endDate)}
              </p>
            </div>
            <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <RotateCcw size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                Le retour sera enregistré localement et une transaction simulée sera ajoutée à
                l’historique de démonstration. Aucune blockchain réelle n’est utilisée.
              </p>
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Annuler la demande"
        description="Cette action est définitive pour la demande en attente."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Conserver la demande
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              <X size={15} aria-hidden="true" />
              Annuler la demande
            </Button>
          </>
        }
      >
        {cancelTarget ? (
          <>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{cancelTarget.equipmentName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Du {formatDate(cancelTarget.startDate)} au {formatDate(cancelTarget.endDate)} · Réf.{' '}
                {cancelTarget.id}
              </p>
            </div>
            <div className="mt-4 flex gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
              <X size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                La demande sera retirée de la file d’attente de l’administration. Vous pourrez
                soumettre une nouvelle demande ultérieurement si le matériel est disponible.
              </p>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  )
}
