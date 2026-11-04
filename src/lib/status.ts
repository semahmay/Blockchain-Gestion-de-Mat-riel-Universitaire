import type {
  BadgeTone,
  Equipment,
  EquipmentStatus,
  Loan,
  LoanDisplayStatus,
  TransactionType,
} from '../types'
import { daysUntil } from './dates'

interface StatusMeta {
  label: string
  tone: BadgeTone
}

export const loanStatusMeta: Record<LoanDisplayStatus, StatusMeta> = {
  pending: { label: 'En attente', tone: 'amber' },
  approved: { label: 'En cours', tone: 'blue' },
  overdue: { label: 'En retard', tone: 'red' },
  rejected: { label: 'Refusée', tone: 'red' },
  returned: { label: 'Retourné', tone: 'green' },
  cancelled: { label: 'Annulée', tone: 'gray' },
}

export const equipmentStatusMeta: Record<EquipmentStatus, StatusMeta> = {
  available: { label: 'Disponible', tone: 'green' },
  maintenance: { label: 'En maintenance', tone: 'amber' },
  unavailable: { label: 'Indisponible', tone: 'gray' },
}

export const transactionTypeMeta: Record<TransactionType, StatusMeta & { description: string }> = {
  request: {
    label: 'Demande',
    tone: 'amber',
    description: "Création d'une demande de prêt",
  },
  approval: {
    label: 'Validation',
    tone: 'green',
    description: "Approbation d'une demande par l'administration",
  },
  rejection: {
    label: 'Refus',
    tone: 'red',
    description: "Refus d'une demande de prêt",
  },
  return: {
    label: 'Retour',
    tone: 'blue',
    description: 'Enregistrement du retour du matériel',
  },
  cancellation: {
    label: 'Annulation',
    tone: 'gray',
    description: "Annulation d'une demande par l'étudiant",
  },
}

export function isLoanOverdue(loan: Loan) {
  return loan.status === 'approved' && daysUntil(loan.endDate) < 0
}

export function getLoanDisplayStatus(loan: Loan): LoanDisplayStatus {
  return isLoanOverdue(loan) ? 'overdue' : loan.status
}

export function getEquipmentAvailability(item: Equipment): StatusMeta & {
  isAvailable: boolean
  unitsLabel: string
} {
  const meta = equipmentStatusMeta[item.status]

  if (item.status === 'maintenance') {
    return { ...meta, isAvailable: false, unitsLabel: 'En maintenance' }
  }

  if (item.availableUnits <= 0) {
    return {
      label: 'Indisponible',
      tone: 'gray',
      isAvailable: false,
      unitsLabel: 'Toutes les unités sont empruntées',
    }
  }

  return {
    label: 'Disponible',
    tone: 'green',
    isAvailable: true,
    unitsLabel: `${item.availableUnits} / ${item.totalUnits} unités disponibles`,
  }
}
