export type WalletStatus =
  | 'checking'
  | 'unavailable'
  | 'disconnected'
  | 'connecting'
  | 'connected'

export interface WalletError {
  title: string
  message: string
}

export interface WalletContextValue {
  status: WalletStatus
  address: string | null
  chainId: number | null
  isSupportedChain: boolean
  isSwitchingNetwork: boolean
  error: WalletError | null
  connect: () => Promise<void>
  switchToCampusChain: () => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}
