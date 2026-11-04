import type { Equipment, Loan, LoanDisplayStatus, TransactionType } from '../../types'
import {
  getEquipmentAvailability,
  getLoanDisplayStatus,
  loanStatusMeta,
  transactionTypeMeta,
} from '../../lib/status'
import { Badge } from './Badge'

interface LoanStatusBadgeProps {
  loan: Loan
  status?: LoanDisplayStatus
}

export function LoanStatusBadge({ loan, status }: LoanStatusBadgeProps) {
  const meta = loanStatusMeta[status ?? getLoanDisplayStatus(loan)]
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}

export function EquipmentAvailabilityBadge({ equipment }: { equipment: Equipment }) {
  const meta = getEquipmentAvailability(equipment)
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const meta = transactionTypeMeta[type]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
