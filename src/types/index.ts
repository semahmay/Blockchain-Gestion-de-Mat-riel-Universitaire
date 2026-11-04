export type EquipmentCategory = 'Informatique' | 'Audiovisuel' | 'Laboratoire' | 'Mobilier'

export type EquipmentStatus = 'available' | 'maintenance' | 'unavailable'

export type BadgeTone = 'navy' | 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'purple'

export interface Equipment {
  id: string
  reference: string
  name: string
  category: EquipmentCategory
  description: string
  location: string
  totalUnits: number
  availableUnits: number
  status: EquipmentStatus
  popular?: boolean
}

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled'

/** A loan can be displayed as overdue even though its stored status remains "approved". */
export type LoanDisplayStatus = LoanStatus | 'overdue'

export interface Loan {
  id: string
  equipmentId: string
  equipmentName: string
  category: EquipmentCategory
  studentName: string
  studentId: string
  studentEmail: string
  startDate: string
  endDate: string
  requestedAt: string
  purpose: string
  status: LoanStatus
  reviewedBy?: string
  reviewedAt?: string
  adminNote?: string
  returnedAt?: string
}

export type TransactionType = 'request' | 'approval' | 'rejection' | 'return' | 'cancellation'

export interface ChainTransaction {
  id: string
  hash: string
  type: TransactionType
  equipmentName: string
  actor: string
  actorAddress: string
  date: string
  blockNumber: number
  gasUsed: number
  loanId: string
  /** Always true in this frontend-only demo. Kept explicit so the UI never implies a real transaction. */
  isSimulated: true
}

export interface User {
  name: string
  email: string
  studentId: string
  program: string
  role: string
  initials: string
}

export interface NewLoanInput {
  equipment: Equipment
  startDate: string
  endDate: string
  purpose: string
}

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}
