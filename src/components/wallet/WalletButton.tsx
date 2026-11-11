import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react'
import { CAMPUSCHAIN_LOCAL } from '../../config/chain'
import { useWallet } from '../../context/useWallet'
import { getNetworkLabel, shortenAddress } from '../../lib/wallet'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface WalletButtonProps {
  onOpen?: () => void
}

export function WalletButton({ onOpen }: WalletButtonProps) {
  const {
    status,
    address,
    chainId,
    isSupportedChain,
    isSwitchingNetwork,
    error,
    connect,
    switchToCampusChain,
    clearError,
  } = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isConnected = status === 'connected' && Boolean(address)
  const isConnecting = status === 'connecting'

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  function togglePanel() {
    if (!open) onOpen?.()
    setOpen((current) => !current)
  }

  async function copyAddress() {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const badgeTone = isConnected ? (isSupportedChain ? 'green' : 'amber') : 'gray'
  const badgeLabel = isConnected
    ? isSupportedChain
      ? 'Connecté'
      : 'Réseau incorrect'
    : status === 'checking'
      ? 'Vérification'
      : status === 'connecting'
        ? 'Connexion'
        : status === 'unavailable'
          ? 'Indisponible'
          : 'Non connecté'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={togglePanel}
        aria-label={
          isConnected && address
            ? `Portefeuille connecté ${shortenAddress(address)}`
            : 'Connecter un portefeuille'
        }
        aria-expanded={open}
        className={cn(
          'flex h-9 items-center gap-2 rounded-xl border px-2.5 text-xs font-medium shadow-sm transition',
          isConnected && isSupportedChain
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            : isConnected
              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'border-line bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        )}
      >
        {isConnecting ? (
          <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <Wallet size={15} aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {isConnecting
            ? 'Connexion…'
            : isConnected && address
              ? shortenAddress(address)
              : 'Connecter'}
        </span>
        {isConnected ? (
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              isSupportedChain ? 'bg-emerald-500' : 'bg-amber-500',
            )}
            aria-hidden="true"
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Connexion du portefeuille MetaMask"
          className="fixed inset-x-4 top-[4.25rem] z-40 overflow-hidden rounded-2xl border border-line bg-white shadow-xl animate-scale-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Portefeuille</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                MetaMask · {CAMPUSCHAIN_LOCAL.name}
              </p>
            </div>
            <Badge tone={badgeTone} dot>
              {badgeLabel}
            </Badge>
          </div>

          <div className="p-4">
            {status === 'unavailable' ? (
              <div>
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    <Wallet size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">MetaMask introuvable</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Installez l’extension MetaMask pour connecter un portefeuille. Aucune donnée
                      sensible ne sera stockée par CampusChain.
                    </p>
                  </div>
                </div>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Installer MetaMask
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            ) : status === 'checking' || status === 'connecting' ? (
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {status === 'connecting' ? 'Connexion à MetaMask…' : 'Vérification du wallet…'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Confirmez la demande dans l’extension si elle s’affiche.
                  </p>
                </div>
              </div>
            ) : isConnected && address ? (
              <div>
                <div className="rounded-xl border border-line bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-900 text-white">
                      <Wallet size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {shortenAddress(address)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {getNetworkLabel(chainId)} · chain ID {chainId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyAddress()}
                      aria-label={copied ? 'Adresse copiée' : 'Copier l’adresse publique'}
                      title={copied ? 'Adresse copiée' : 'Copier l’adresse publique'}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                    >
                      {copied ? (
                        <Check size={15} className="text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy size={15} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Adresse publique
                    </p>
                    <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-slate-500">
                      {address}
                    </p>
                  </div>
                </div>

                {isSupportedChain ? (
                  <div className="mt-3 flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                    <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>Réseau local CampusChain détecté. Le wallet est prêt pour la suite.</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                      <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Réseau non pris en charge</p>
                        <p className="mt-1">
                          CampusChain Local exige le chain ID {CAMPUSCHAIN_LOCAL.chainId}. Les
                          interactions avec le contrat restent bloquées sur ce réseau.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => void switchToCampusChain()}
                      disabled={isSwitchingNetwork}
                    >
                      {isSwitchingNetwork ? (
                        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <RefreshCw size={14} aria-hidden="true" />
                      )}
                      {isSwitchingNetwork
                        ? 'Changement de réseau…'
                        : 'Basculer sur CampusChain Local'}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Wallet size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Connecter MetaMask</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Seule votre adresse publique et le réseau actif seront affichés. Aucune
                      transaction de prêt n’est envoyée pour le moment.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => void connect()}
                  disabled={isConnecting}
                >
                  <Wallet size={14} aria-hidden="true" />
                  Connecter le portefeuille
                </Button>
              </div>
            )}

            {error ? (
              <div
                role="alert"
                className="mt-3 flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700"
              >
                <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{error.title}</p>
                  <p className="mt-1">{error.message}</p>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  aria-label="Fermer le message d’erreur"
                  className="grid size-6 shrink-0 place-items-center rounded-md text-red-500 transition hover:bg-red-100 hover:text-red-700"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="border-t border-line bg-slate-50/70 px-4 py-2.5">
            <p className="text-[10px] leading-relaxed text-slate-400">
              Connexion wallet uniquement · les demandes et transactions de prêt restent
              simulées.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
