import { useState } from 'react'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  History,
  Inbox,
  Info,
  Package,
  ShieldCheck,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react'
import { useApp } from '../context/useApp'
import {
  daysUntil,
  differenceInDays,
  formatDate,
  formatRelative,
} from '../lib/dates'
import { cn } from '../lib/utils'
import type { Loan } from '../types'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { LoanStatusBadge } from '../components/ui/StatusBadge'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'

type AdminTab = 'pending' | 'history'
type DecisionType = 'approved' | 'rejected'

interface DecisionTarget {
  loan: Loan
  type: DecisionType
}

const quickReasons = [
  'Stock insuffisant',
  'Dates non conformes',
  'Justificatif manquant',
  'Matériel réservé à un autre usage',
]

export function AdminLoansPage() {
  const { equipment, loans, decideLoan } = useApp()
  const [activeTab, setActiveTab] = useState<AdminTab>('pending')
  const [decision, setDecision] = useState<DecisionTarget | null>(null)
  const [reason, setReason] = useState('')

  const pendingLoans = loans
    .filter((loan) => loan.status === 'pending')
    .sort((first, second) => Date.parse(first.requestedAt) - Date.parse(second.requestedAt))

  const reviewedLoans = loans
    .filter((loan) => Boolean(loan.reviewedAt))
    .sort(
      (first, second) =>
        Date.parse(second.reviewedAt ?? '') - Date.parse(first.reviewedAt ?? ''),
    )

  const approvedCount = loans.filter((loan) => loan.status === 'approved').length
  const overdueCount = loans.filter(
    (loan) => loan.status === 'approved' && daysUntil(loan.endDate) < 0,
  ).length
  const rejectedCount = loans.filter((loan) => loan.status === 'rejected').length

  const decisionEquipment = decision
    ? equipment.find((item) => item.id === decision.loan.equipmentId)
    : undefined
  const stockAvailable = Boolean(
    decisionEquipment &&
      decisionEquipment.status === 'available' &&
      decisionEquipment.availableUnits > 0,
  )

  function openDecision(loan: Loan, type: DecisionType) {
    setDecision({ loan, type })
    setReason('')
  }

  function closeDecision() {
    setDecision(null)
    setReason('')
  }

  function confirmDecision() {
    if (!decision) return

    decideLoan({
      loanId: decision.loan.id,
      decision: decision.type,
      note: decision.type === 'rejected' ? reason : undefined,
    })
    closeDecision()
  }

  return (
    <div>
      <PageHeader
        title="Demandes de prêt"
        description="Examinez les demandes des étudiants et prenez une décision. Les décisions mettent à jour les données locales de démonstration."
        eyebrow={
          <Badge tone="navy">
            <ShieldCheck size={12} aria-hidden="true" />
            Vue administrateur · démonstration
          </Badge>
        }
        actions={
          <ButtonLink to="/equipment" variant="secondary">
            <Package size={15} aria-hidden="true" />
            Voir le catalogue
          </ButtonLink>
        }
      />

      <div className="mt-4 flex gap-2.5 rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-xs leading-relaxed text-brand-800">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Cette page simule le rôle administrateur sans authentification réelle. Chaque approbation
          ou refus est conservé en mémoire et génère un enregistrement de démonstration.
        </p>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Résumé administratif">
        <StatCard
          label="En attente"
          value={pendingLoans.length}
          icon={Inbox}
          tone="amber"
          hint="Demandes à traiter"
        />
        <StatCard
          label="Emprunts en cours"
          value={approvedCount}
          icon={CheckCircle2}
          tone="blue"
          hint="Matériel actuellement prêté"
        />
        <StatCard
          label="Retours en retard"
          value={overdueCount}
          icon={TriangleAlert}
          tone="red"
          hint="À relancer"
        />
        <StatCard
          label="Demandes refusées"
          value={rejectedCount}
          icon={XCircle}
          tone="navy"
          hint="Historique des refus"
        />
      </section>

      <Card className="mt-6 p-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              aria-pressed={activeTab === 'pending'}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium transition',
                activeTab === 'pending'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              File d’attente
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                  activeTab === 'pending' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {pendingLoans.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              aria-pressed={activeTab === 'history'}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium transition',
                activeTab === 'history'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Décisions récentes
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                  activeTab === 'history' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {reviewedLoans.length}
              </span>
            </button>
          </div>

          <p className="px-3 pb-1 text-[11px] text-slate-400 sm:pb-0 sm:pr-2">
            {activeTab === 'pending'
              ? `${pendingLoans.length} demande${pendingLoans.length > 1 ? 's' : ''} en attente`
              : `${reviewedLoans.length} décision${reviewedLoans.length > 1 ? 's' : ''} enregistrée${reviewedLoans.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </Card>

      {activeTab === 'pending' ? (
        pendingLoans.length === 0 ? (
          <EmptyState
            className="mt-5"
            icon={Inbox}
            title="Aucune demande en attente"
            description="Toutes les demandes ont été traitées. Les nouvelles demandes des étudiants apparaîtront ici."
            action={
              <Button variant="secondary" onClick={() => setActiveTab('history')}>
                Voir les décisions récentes
              </Button>
            }
          />
        ) : (
          <div className="mt-5 space-y-4">
            {pendingLoans.map((loan) => {
              const item = equipment.find((entry) => entry.id === loan.equipmentId)
              const canApprove = Boolean(
                item && item.status === 'available' && item.availableUnits > 0,
              )
              const duration = differenceInDays(loan.startDate, loan.endDate)

              return (
                <Card key={loan.id} className="overflow-hidden">
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3.5">
                      <Avatar name={loan.studentName} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-semibold text-slate-900">{loan.studentName}</p>
                          <span className="text-[11px] text-slate-400">#{loan.studentId}</span>
                          <Badge tone="amber" dot>
                            En attente
                          </Badge>
                        </div>
                        <p className="mt-0.5 break-all text-[11px] text-slate-500">
                          {loan.studentEmail}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Package
                              size={13}
                              className="shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            <span className="truncate">{loan.equipmentName}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              size={13}
                              className="shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            Du {formatDate(loan.startDate)} au {formatDate(loan.endDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              size={13}
                              className="shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            {formatRelative(loan.requestedAt)}
                          </span>
                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                          « {loan.purpose} »
                        </div>

                        <p className="mt-2 text-[10px] text-slate-400">
                          Réf. {loan.id} · {loan.category} · {duration} jours
                          {item ? ` · ${item.availableUnits}/${item.totalUnits} unités disponibles` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex lg:flex-col xl:flex-row">
                      <Button
                        size="sm"
                        onClick={() => openDecision(loan, 'approved')}
                        disabled={!canApprove}
                        title={
                          canApprove
                            ? 'Approuver cette demande'
                            : 'Aucune unité disponible pour ce matériel'
                        }
                      >
                        <Check size={14} aria-hidden="true" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="dangerSoft"
                        onClick={() => openDecision(loan, 'rejected')}
                      >
                        <X size={14} aria-hidden="true" />
                        Refuser
                      </Button>
                    </div>
                  </div>

                  {!canApprove ? (
                    <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-5 py-2.5 text-[11px] text-amber-800">
                      <TriangleAlert size={13} className="shrink-0" aria-hidden="true" />
                      Stock indisponible : cette demande ne peut pas être approuvée actuellement.
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>
        )
      ) : reviewedLoans.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={History}
          title="Aucune décision enregistrée"
          description="Les approbations et les refus apparaîtront ici avec leur auteur et leur date."
        />
      ) : (
        <Card className="mt-5 divide-y divide-line overflow-hidden">
          {reviewedLoans.map((loan) => (
            <div
              key={loan.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={loan.studentName} size="sm" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {loan.studentName}
                    </p>
                    <LoanStatusBadge loan={loan} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {loan.equipmentName} · {formatDate(loan.startDate)} →{' '}
                    {formatDate(loan.endDate)}
                  </p>
                  {loan.adminNote ? (
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                      Motif : {loan.adminNote}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 pl-11 text-left sm:pl-0 sm:text-right">
                <p className="text-[11px] font-medium text-slate-600">
                  {loan.reviewedBy ?? 'Administration'}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {loan.reviewedAt ? formatRelative(loan.reviewedAt) : ''}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal
        open={Boolean(decision)}
        onClose={closeDecision}
        title={decision?.type === 'approved' ? 'Approuver la demande' : 'Refuser la demande'}
        description={
          decision?.type === 'approved'
            ? 'Confirmez la mise à disposition du matériel pour cet étudiant.'
            : 'Précisez si besoin le motif communiqué à l’étudiant.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeDecision}>
              Annuler
            </Button>
            <Button
              variant={decision?.type === 'rejected' ? 'danger' : 'primary'}
              onClick={confirmDecision}
              disabled={decision?.type === 'approved' && !stockAvailable}
            >
              {decision?.type === 'approved' ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <X size={15} aria-hidden="true" />
              )}
              {decision?.type === 'approved' ? 'Confirmer l’approbation' : 'Confirmer le refus'}
            </Button>
          </>
        }
      >
        {decision ? (
          <>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={decision.loan.studentName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {decision.loan.studentName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {decision.loan.studentId} · {decision.loan.studentEmail}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">Matériel :</span>{' '}
                  {decision.loan.equipmentName}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Période :</span> du{' '}
                  {formatDate(decision.loan.startDate)} au {formatDate(decision.loan.endDate)}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Référence :</span>{' '}
                  {decision.loan.id}
                </p>
              </div>
            </div>

            {decision.type === 'rejected' ? (
              <div className="mt-4">
                <label
                  htmlFor="rejection-reason"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Motif du refus (optionnel)
                </label>
                <textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  maxLength={240}
                  className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                  placeholder="Expliquez la raison du refus à l’étudiant…"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickReasons.map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() => setReason(quickReason)}
                      className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {decision.type === 'approved' && !stockAvailable ? (
              <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Aucune unité de ce matériel n’est disponible. L’approbation est désactivée jusqu’à
                  un prochain retour.
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                Cette décision génère une transaction simulée dans l’historique local. Aucune
                opération blockchain réelle n’est effectuée à ce stade.
              </p>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  )
}
