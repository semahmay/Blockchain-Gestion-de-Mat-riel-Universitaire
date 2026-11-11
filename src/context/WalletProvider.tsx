import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isCampusChain } from '../config/chain'
import {
  getInjectedProvider,
  readInjectedWallet,
  switchToCampusChain as requestNetworkSwitch,
  toWalletError,
} from '../lib/wallet'
import type { WalletError, WalletStatus } from '../types/wallet'
import { WalletContext } from './WalletContext'

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>(() =>
    getInjectedProvider() ? 'checking' : 'unavailable',
  )
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [error, setError] = useState<WalletError | null>(null)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const mountedRef = useRef(true)
  const requestRef = useRef(0)

  const showError = useCallback((cause: unknown, title: string) => {
    if (mountedRef.current) {
      setError(toWalletError(cause, title))
    }
  }, [])

  const syncWallet = useCallback(async (requestAccounts: boolean) => {
    const requestId = ++requestRef.current
    const ethereum = getInjectedProvider()

    if (!ethereum) {
      if (mountedRef.current && requestId === requestRef.current) {
        setAddress(null)
        setChainId(null)
        setStatus('unavailable')
      }
      return
    }

    const snapshot = await readInjectedWallet(ethereum, requestAccounts)

    if (!mountedRef.current || requestId !== requestRef.current) {
      return
    }

    setAddress(snapshot.address)
    setChainId(snapshot.chainId)
    setStatus(snapshot.address ? 'connected' : 'disconnected')
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const ethereum = getInjectedProvider()

    if (!ethereum) {
      return
    }

    void syncWallet(false).catch((cause: unknown) => {
      showError(cause, 'Lecture du wallet impossible')
      if (mountedRef.current) setStatus('disconnected')
    })

    const handleAccountsChanged = () => {
      setError(null)
      void syncWallet(false).catch((cause: unknown) => {
        showError(cause, 'Mise à jour du compte impossible')
      })
    }

    const handleChainChanged = () => {
      setError(null)
      void syncWallet(false).catch((cause: unknown) => {
        showError(cause, 'Mise à jour du réseau impossible')
      })
    }

    const handleDisconnect = () => {
      if (!mountedRef.current) return
      setAddress(null)
      setChainId(null)
      setStatus('disconnected')
      setError({
        title: 'Wallet déconnecté',
        message: 'MetaMask a interrompu la connexion. Reconnectez le portefeuille pour continuer.',
      })
    }

    ethereum.on?.('accountsChanged', handleAccountsChanged)
    ethereum.on?.('chainChanged', handleChainChanged)
    ethereum.on?.('disconnect', handleDisconnect)

    return () => {
      mountedRef.current = false
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
      ethereum.removeListener?.('disconnect', handleDisconnect)
    }
  }, [showError, syncWallet])

  const connect = useCallback(async () => {
    const ethereum = getInjectedProvider()

    if (!ethereum) {
      setStatus('unavailable')
      setError({
        title: 'MetaMask introuvable',
        message: 'Installez l’extension MetaMask pour connecter un portefeuille local.',
      })
      return
    }

    setError(null)
    setStatus('connecting')

    try {
      await syncWallet(true)
    } catch (cause) {
      showError(cause, 'Connexion impossible')
      if (mountedRef.current) {
        setStatus(address ? 'connected' : 'disconnected')
      }
    }
  }, [address, showError, syncWallet])

  const refresh = useCallback(async () => {
    if (!getInjectedProvider()) {
      setAddress(null)
      setChainId(null)
      setStatus('unavailable')
      return
    }

    setError(null)
    try {
      await syncWallet(false)
    } catch (cause) {
      showError(cause, 'Actualisation du wallet impossible')
      if (mountedRef.current) {
        setStatus(address ? 'connected' : 'disconnected')
      }
    }
  }, [address, showError, syncWallet])

  const switchNetwork = useCallback(async () => {
    const ethereum = getInjectedProvider()

    if (!ethereum) {
      setStatus('unavailable')
      setError({
        title: 'MetaMask introuvable',
        message: 'Impossible de changer de réseau sans portefeuille MetaMask.',
      })
      return
    }

    setIsSwitchingNetwork(true)
    setError(null)

    try {
      await requestNetworkSwitch(ethereum)
      await syncWallet(false)
    } catch (cause) {
      showError(cause, 'Changement de réseau impossible')
    } finally {
      if (mountedRef.current) setIsSwitchingNetwork(false)
    }
  }, [showError, syncWallet])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      status,
      address,
      chainId,
      isSupportedChain: isCampusChain(chainId),
      isSwitchingNetwork,
      error,
      connect,
      switchToCampusChain: switchNetwork,
      refresh,
      clearError,
    }),
    [
      status,
      address,
      chainId,
      isSwitchingNetwork,
      error,
      connect,
      switchNetwork,
      refresh,
      clearError,
    ],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
