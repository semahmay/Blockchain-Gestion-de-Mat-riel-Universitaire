import { createContext } from 'react'
import type {
  ChainTransaction,
  Equipment,
  Loan,
  NewLoanInput,
  Toast,
  User,
} from '../types'

export interface CreateLoanResult {
  ok: boolean
  error?: string
}

export interface DecisionInput {
  loanId: string
  decision: 'approved' | 'rejected'
  note?: string
}

export interface AppContextValue {
  currentUser: User
  equipment: Equipment[]
  loans: Loan[]
  transactions: ChainTransaction[]
  pendingCount: number
  createLoan: (input: NewLoanInput) => CreateLoanResult
  decideLoan: (input: DecisionInput) => void
  cancelLoan: (loanId: string) => void
  markReturned: (loanId: string) => void
  notify: (toast: Omit<Toast, 'id'>) => void
  toasts: Toast[]
  dismissToast: (id: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)
