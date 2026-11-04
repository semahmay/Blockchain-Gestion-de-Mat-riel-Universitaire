import { Ban, CheckCircle2, RotateCcw, Send, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TransactionType } from '../types'

export const transactionTypeIcons: Record<TransactionType, LucideIcon> = {
  request: Send,
  approval: CheckCircle2,
  rejection: XCircle,
  return: RotateCcw,
  cancellation: Ban,
}
