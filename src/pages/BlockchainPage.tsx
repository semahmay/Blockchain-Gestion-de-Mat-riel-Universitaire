import { useMemo, useState } from 'react'
import {
  ChevronRight,
  Clock3,
  Copy,
  FileCode2,
  FlaskConical,
  Info,
  Link2,
  Network,
  SearchX,
  Wallet,
} from 'lucide-react'
import { useApp } from '../context/useApp'
import { formatDateShort, formatDateTime, formatRelative } from '../lib/dates'
import { transactionTypeMeta } from '../lib/status'
import { transactionTypeIcons } from '../lib/transactionIcons'
import { cn } from '../lib/utils'
import type { ChainTransaction, TransactionType } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { StatCard } from '../components/ui/StatCard'
import { TransactionTypeBadge } from '../components/ui/StatusBadge'

type TypeFilter = 'all' | TransactionType

const typeFilters: Array<{ id: TypeFilter; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'request', label: 'Demandes' },
  { id: 'approval', label: 'Validations' },
  { id: 'rejection', label: 'Refus' },
  { id: 'return', label: 'Retours' },
  { id: 'cancellation', label: 'Annulations' },
]

const integrationSteps = [
  {
    icon: FileCode2,
    title: 'Contrats Solidity',
    description: 'Définition des règles de prêt, des rôles et des états du matériel.',
  },
  {
    icon: Wallet,
    title: 'Connexion du wallet',
    description: 'Authentification et signature des actions par les étudiants et l’administration.',
  },
  {
    icon: Link2,
    title: 'Lecture on-chain',
    description: 'Remplacement progressif des enregistrements locaux par les événements du contrat.',
  },
]

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}

function shortAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-4)}`
}

export function BlockchainPage() {
  const { transactions, notify } = useApp()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [selected, setSelected] = useState<ChainTransaction | null>(null)

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (first, second) => Date.parse(second.date) - Date.parse(first.date),
      ),
    [transactions],
  )

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    const haystack = [
      transaction.hash,
      transaction.equipmentName,
      transaction.actor,
      transaction.actorAddress,
      transaction.loanId,
    ]
      .join(' ')
      .toLowerCase()

    return matchesType && haystack.includes(search.trim().toLowerCase())
  })

  const latestTransaction = sortedTransactions[0]
  const hasFilters = search.length > 0 || typeFilter !== 'all'

  function countForType(id: TypeFilter) {
    return id === 'all'
      ? sortedTransactions.length
      : sortedTransactions.filter((transaction) => transaction.type === id).length
  }

  function resetFilters() {
    setSearch('')
    setTypeFilter('all')
  }

  async function copyHash(hash: string) {
    try {
      await navigator.clipboard.writeText(hash)
      notify({
        variant: 'success',
        title: 'Hash copié',
        message: 'Rappel : ce hash est fictif et ne correspond à aucune transaction réelle.',
      })
    } catch {
      notify({
        variant: 'error',
        title: 'Copie impossible',
        message: 'Votre navigateur n’autorise pas l’accès au presse-papiers.',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Historique blockchain"
        description="Journal local illustrant les futurs échanges avec les smart contracts de la plateforme."
        eyebrow={
          <Badge tone="amber" dot>
            Données simulées · aucun réseau connecté
          </Badge>
        }
        actions={
          <Badge tone="gray">
            <Wallet size={12} aria-hidden="true" />
            Wallet non connecté
          </Badge>
        }
      />

      <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <FlaskConical size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Mode démonstration — transactions simulées
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            Tous les enregistrements de cette page sont générés localement pour illustrer
            l’interface. Aucun wallet n’est connecté, aucun contrat Solidity n’est déployé et aucune
            transaction réelle n’est envoyée sur une blockchain.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="amber">Aucun réseau connecté</Badge>
            <Badge tone="gray">Aucun contrat déployé</Badge>
            <Badge tone="gray">Hashs et blocs fictifs</Badge>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Résumé blockchain">
        <StatCard
          label="Transactions simulées"
          value={sortedTransactions.length}
          icon={FlaskConical}
          tone="amber"
          hint="Générées localement"
        />
        <StatCard
          label="Dernière activité"
          value={latestTransaction ? formatRelative(latestTransaction.date) : '—'}
          icon={Clock3}
          tone="navy"
          hint="Mise à jour locale"
        />
        <StatCard
          label="Réseau prévu"
          value="Ethereum"
          icon={Network}
          tone="blue"
          hint="Sepolia · non connecté"
        />
        <StatCard
          label="Contrat intelligent"
          value="Aucun"
          icon={FileCode2}
          tone="red"
          hint="Déploiement Solidity à venir"
        />
      </section>

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Journal des transactions"
          description="Chaque action de prêt est associée à un enregistrement de démonstration."
          action={
            <Badge tone="amber" dot>
              {filteredTransactions.length} simulée{filteredTransactions.length > 1 ? 's' : ''}
            </Badge>
          }
        />

        <div className="border-t border-line p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un hash…"
              ariaLabel="Rechercher dans l’historique"
              className="xl:max-w-sm"
            />

            <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 xl:pb-0">
              {typeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setTypeFilter(filter.id)}
                  aria-pressed={typeFilter === filter.id}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition',
                    typeFilter === filter.id
                      ? 'border-brand-900 bg-brand-900 text-white shadow-sm'
                      : 'border-line bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                      typeFilter === filter.id
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {countForType(filter.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {hasFilters ? (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <p className="text-[11px] text-slate-500">
                {filteredTransactions.length} résultat
                {filteredTransactions.length > 1 ? 's' : ''} sur {sortedTransactions.length}
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          ) : null}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center border-t border-line px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <SearchX size={22} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Aucune transaction trouvée</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
              Essayez un autre mot-clé ou un autre type d’enregistrement.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto border-t border-line md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Matériel</th>
                    <th className="px-4 py-3">Acteur</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Bloc</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredTransactions.map((transaction) => {
                    const Icon = transactionTypeIcons[transaction.type]

                    return (
                      <tr
                        key={transaction.id}
                        onClick={() => setSelected(transaction)}
                        className="cursor-pointer transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                              <Icon size={14} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="whitespace-nowrap font-mono text-[11px] text-slate-700">
                                {shortHash(transaction.hash)}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Réf. {transaction.loanId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <TransactionTypeBadge type={transaction.type} />
                        </td>
                        <td className="max-w-48 px-4 py-3.5">
                          <p className="truncate text-xs text-slate-700">
                            {transaction.equipmentName}
                          </p>
                        </td>
                        <td className="max-w-40 px-4 py-3.5">
                          <p className="truncate text-xs text-slate-700">{transaction.actor}</p>
                          <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                            {shortAddress(transaction.actorAddress)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="whitespace-nowrap text-xs text-slate-600">
                            {formatDateShort(transaction.date)}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap text-[10px] text-slate-400">
                            {formatRelative(transaction.date)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-slate-500">
                          #{transaction.blockNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone="gray" dot>
                            Simulée
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                void copyHash(transaction.hash)
                              }}
                              aria-label="Copier le hash simulé"
                              className="grid size-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Copy size={13} />
                            </button>
                            <ChevronRight size={15} className="text-slate-300" aria-hidden="true" />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 border-t border-line p-4 md:hidden">
              {filteredTransactions.map((transaction) => {
                const Icon = transactionTypeIcons[transaction.type]

                return (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => setSelected(transaction)}
                    className="w-full rounded-xl border border-line bg-white p-4 text-left transition hover:border-brand-200 hover:bg-brand-50/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon size={14} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {transaction.equipmentName}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                            {shortHash(transaction.hash)}
                          </p>
                        </div>
                      </div>
                      <TransactionTypeBadge type={transaction.type} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span className="truncate">{transaction.actor}</span>
                      <span className="text-slate-300">·</span>
                      <span>{formatDateShort(transaction.date)}</span>
                      <span className="text-slate-300">·</span>
                      <span>Bloc #{transaction.blockNumber}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                      <Badge tone="gray" dot>
                        Simulée
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700">
                        Voir le détail
                        <ChevronRight size={12} aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Prochaine étape : intégration blockchain"
          description="Le frontend est prêt à recevoir les contrats Solidity et Ethers.js lors d’une prochaine itération."
        />

        <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-3 sm:p-6">
          {integrationSteps.map((step) => {
            const Icon = step.icon

            return (
              <div key={step.title} className="rounded-xl border border-line bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-9 place-items-center rounded-lg bg-white text-brand-800 shadow-sm ring-1 ring-inset ring-line">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <Badge tone="gray">À venir</Badge>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Détail de la transaction"
        description="Enregistrement local de démonstration — aucune donnée on-chain."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Fermer
            </Button>
            <Button onClick={() => selected && void copyHash(selected.hash)}>
              <Copy size={15} aria-hidden="true" />
              Copier le hash
            </Button>
          </>
        }
      >
        {selected ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <TransactionTypeBadge type={selected.type} />
              <Badge tone="amber" dot>
                Transaction simulée
              </Badge>
              <span className="text-[11px] text-slate-400">Réf. {selected.loanId}</span>
            </div>

            <dl className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Type d’opération</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {transactionTypeMeta[selected.type].description}
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Matériel</dt>
                <dd className="text-sm font-medium text-slate-900">{selected.equipmentName}</dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Acteur</dt>
                <dd className="text-sm font-medium text-slate-900">{selected.actor}</dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Date simulée</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {formatDateTime(selected.date)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Hash fictif</dt>
                <dd className="break-all font-mono text-[11px] leading-relaxed text-slate-700 sm:max-w-[70%] sm:text-right">
                  {selected.hash}
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Numéro de bloc</dt>
                <dd className="font-mono text-xs text-slate-700">#{selected.blockNumber}</dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Adresse émettrice</dt>
                <dd className="break-all font-mono text-[11px] text-slate-700 sm:max-w-[70%] sm:text-right">
                  {selected.actorAddress}
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <dt className="text-xs font-medium text-slate-500">Gaz estimé</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {selected.gasUsed.toLocaleString('fr-FR')} unités
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                Le hash, le numéro de bloc, l’adresse et le gaz sont entièrement fictifs. Ils
                illustrent la structure des données qui sera fournie par Ethers.js une fois les
                smart contracts déployés.
              </p>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  )
}
