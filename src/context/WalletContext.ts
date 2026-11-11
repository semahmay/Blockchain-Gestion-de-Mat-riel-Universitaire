import { createContext } from 'react'
import type { WalletContextValue } from '../types/wallet'

export const WalletContext = createContext<WalletContextValue | null>(null)
