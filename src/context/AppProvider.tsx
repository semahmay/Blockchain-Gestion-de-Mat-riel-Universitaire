import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { adminName, currentUser, initialEquipment, initialLoans, initialTransactions } from '../data/mockData'
import { createSimulatedTransaction } from '../lib/blockchain'
import { parseDate, startOfToday } from '../lib/dates'
import type { ChainTransaction, Equipment, Loan, NewLoanInput, Toast } from '../types'
import { AppContext } from './AppContext'
import type { CreateLoanResult, DecisionInput } from './AppContext'

let toastSequence = 0

export function AppProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)
  const [loans, setLoans] = useState<Loan[]>(initialLoans)
  const [transactions, setTransactions] = useState<ChainTransaction[]>(initialTransactions)
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    toastSequence += 1
    const id = `toast-${Date.now()}-${toastSequence}`
    setToasts((current) => [...current, { ...toast, id }])

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 5200)

    timers.current.push(timer)
  }, [])

  const createLoan = useCallback(
    (input: NewLoanInput): CreateLoanResult => {
      const item = equipment.find((entry) => entry.id === input.equipment.id)

      if (!item) {
        return { ok: false, error: 'Ce matériel n’est plus disponible dans le catalogue.' }
      }

      if (item.status !== 'available' || item.availableUnits <= 0) {
        return {
          ok: false,
          error: 'Ce matériel n’est pas disponible actuellement. Choisissez une autre référence.',
        }
      }

      if (!input.startDate || !input.endDate) {
        return { ok: false, error: 'Veuillez renseigner les dates de retrait et de retour.' }
      }

      const start = parseDate(input.startDate)
      const end = parseDate(input.endDate)

      if (start < startOfToday()) {
        return { ok: false, error: 'La date de retrait ne peut pas être dans le passé.' }
      }

      if (end <= start) {
        return { ok: false, error: 'La date de retour doit être postérieure à la date de retrait.' }
      }

      const alreadyRequested = loans.some(
        (loan) =>
          loan.equipmentId === item.id &&
          loan.studentId === currentUser.studentId &&
          (loan.status === 'pending' || loan.status === 'approved'),
      )

      if (alreadyRequested) {
        return {
          ok: false,
          error: 'Vous avez déjà une demande en cours pour ce matériel.',
        }
      }

      const lastNumber = loans.reduce((max, loan) => {
        const numeric = Number(loan.id.split('-')[1])
        return Number.isFinite(numeric) ? Math.max(max, numeric) : max
      }, 2400)
      const loanId = `LN-${lastNumber + 1}`
      const requestedAt = new Date().toISOString()

      const newLoan: Loan = {
        id: loanId,
        equipmentId: item.id,
        equipmentName: item.name,
        category: item.category,
        studentName: currentUser.name,
        studentId: currentUser.studentId,
        studentEmail: currentUser.email,
        startDate: input.startDate,
        endDate: input.endDate,
        requestedAt,
        purpose: input.purpose.trim() || 'Aucun motif précisé.',
        status: 'pending',
      }

      setLoans((current) => [newLoan, ...current])
      setTransactions((current) => [
        createSimulatedTransaction({
          loanId,
          type: 'request',
          equipmentName: item.name,
          actor: currentUser.name,
          date: requestedAt,
        }),
        ...current,
      ])

      notify({
        variant: 'success',
        title: 'Demande envoyée',
        message: `Votre demande pour « ${item.name} » est en attente de validation.`,
      })

      return { ok: true }
    },
    [equipment, loans, notify],
  )

  const decideLoan = useCallback(
    ({ loanId, decision, note }: DecisionInput) => {
      const loan = loans.find((entry) => entry.id === loanId)

      if (!loan || loan.status !== 'pending') {
        notify({
          variant: 'error',
          title: 'Demande introuvable',
          message: 'Cette demande a peut-être déjà été traitée.',
        })
        return
      }

      if (decision === 'approved') {
        const item = equipment.find((entry) => entry.id === loan.equipmentId)

        if (!item || item.availableUnits <= 0) {
          notify({
            variant: 'error',
            title: 'Stock insuffisant',
            message: 'Aucune unité de ce matériel n’est disponible pour valider la demande.',
          })
          return
        }
      }

      const reviewedAt = new Date().toISOString()

      setLoans((current) =>
        current.map((entry) =>
          entry.id === loanId
            ? {
                ...entry,
                status: decision,
                reviewedBy: adminName,
                reviewedAt,
                adminNote:
                  decision === 'rejected'
                    ? note?.trim() || 'Aucun motif précisé.'
                    : undefined,
              }
            : entry,
        ),
      )

      if (decision === 'approved') {
        setEquipment((current) =>
          current.map((entry) =>
            entry.id === loan.equipmentId
              ? { ...entry, availableUnits: Math.max(0, entry.availableUnits - 1) }
              : entry,
          ),
        )
      }

      setTransactions((current) => [
        createSimulatedTransaction({
          loanId,
          type: decision === 'approved' ? 'approval' : 'rejection',
          equipmentName: loan.equipmentName,
          actor: adminName,
          date: reviewedAt,
        }),
        ...current,
      ])

      notify({
        variant: decision === 'approved' ? 'success' : 'info',
        title: decision === 'approved' ? 'Demande approuvée' : 'Demande refusée',
        message:
          decision === 'approved'
            ? `Le prêt de « ${loan.equipmentName} » a été validé pour ${loan.studentName}.`
            : `La demande de ${loan.studentName} a été refusée.`,
      })
    },
    [equipment, loans, notify],
  )

  const cancelLoan = useCallback(
    (loanId: string) => {
      const loan = loans.find((entry) => entry.id === loanId)

      if (!loan || loan.status !== 'pending') {
        notify({
          variant: 'error',
          title: 'Action impossible',
          message: 'Seule une demande en attente peut être annulée.',
        })
        return
      }

      setLoans((current) =>
        current.map((entry) =>
          entry.id === loanId ? { ...entry, status: 'cancelled' } : entry,
        ),
      )
      setTransactions((current) => [
        createSimulatedTransaction({
          loanId,
          type: 'cancellation',
          equipmentName: loan.equipmentName,
          actor: currentUser.name,
        }),
        ...current,
      ])

      notify({
        variant: 'info',
        title: 'Demande annulée',
        message: `Votre demande pour « ${loan.equipmentName} » a été annulée.`,
      })
    },
    [loans, notify],
  )

  const markReturned = useCallback(
    (loanId: string) => {
      const loan = loans.find((entry) => entry.id === loanId)

      if (!loan || loan.status !== 'approved') {
        notify({
          variant: 'error',
          title: 'Action impossible',
          message: 'Seul un emprunt en cours peut être marqué comme retourné.',
        })
        return
      }

      const returnedAt = new Date().toISOString()

      setLoans((current) =>
        current.map((entry) =>
          entry.id === loanId ? { ...entry, status: 'returned', returnedAt } : entry,
        ),
      )
      setEquipment((current) =>
        current.map((entry) =>
          entry.id === loan.equipmentId
            ? {
                ...entry,
                availableUnits: Math.min(entry.totalUnits, entry.availableUnits + 1),
              }
            : entry,
        ),
      )
      setTransactions((current) => [
        createSimulatedTransaction({
          loanId,
          type: 'return',
          equipmentName: loan.equipmentName,
          actor: currentUser.name,
          date: returnedAt,
        }),
        ...current,
      ])

      notify({
        variant: 'success',
        title: 'Retour enregistré',
        message: `Le retour de « ${loan.equipmentName} » a été enregistré.`,
      })
    },
    [loans, notify],
  )

  const pendingCount = useMemo(
    () => loans.filter((loan) => loan.status === 'pending').length,
    [loans],
  )

  const value = useMemo(
    () => ({
      currentUser,
      equipment,
      loans,
      transactions,
      pendingCount,
      createLoan,
      decideLoan,
      cancelLoan,
      markReturned,
      notify,
      toasts,
      dismissToast,
    }),
    [
      equipment,
      loans,
      transactions,
      pendingCount,
      createLoan,
      decideLoan,
      cancelLoan,
      markReturned,
      notify,
      toasts,
      dismissToast,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
