import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ChainTransaction } from '../../types'
import { formatRelative } from '../../lib/dates'
import { transactionTypeMeta } from '../../lib/status'
import { transactionTypeIcons } from '../../lib/transactionIcons'
import { Card, CardHeader } from '../ui/Card'

export function BlockchainActivityCard({ transactions }: { transactions: ChainTransaction[] }) {
  return (
    <Card>
      <CardHeader
        title="Activité blockchain"
        description="Aperçu des enregistrements locaux de démonstration."
        action={
          <Link
            to="/blockchain"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
          >
            Historique
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        }
      />

      <div className="border-t border-line p-3 sm:p-4">
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] leading-relaxed text-amber-800">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>Données simulées localement. Aucune transaction n’est enregistrée on-chain.</p>
        </div>

        <ul className="space-y-0.5">
          {transactions.map((transaction) => {
            const Icon = transactionTypeIcons[transaction.type]
            const meta = transactionTypeMeta[transaction.type]

            return (
              <li key={transaction.id}>
                <Link
                  to="/blockchain"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-slate-800">
                      {meta.label} · {transaction.equipmentName}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {formatRelative(transaction.date)} · Bloc #{transaction.blockNumber}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    Simulé
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}
