import type { Eip1193Provider } from 'ethers'

export interface InjectedEthereumProvider extends Eip1193Provider {
  isMetaMask?: boolean
  providers?: InjectedEthereumProvider[]
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: InjectedEthereumProvider
  }
}
