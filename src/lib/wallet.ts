import { CAMPUSCHAIN_LOCAL } from '../config/chain'
import type { InjectedEthereumProvider } from '../types/ethereum'
import type { WalletError } from '../types/wallet'

const knownNetworks: Record<number, string> = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia',
  31337: CAMPUSCHAIN_LOCAL.name,
}

export interface WalletSnapshot {
  address: string | null
  chainId: number
}

export function getInjectedProvider(): InjectedEthereumProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  const injected = window.ethereum
  if (Array.isArray(injected.providers) && injected.providers.length > 0) {
    return injected.providers.find((provider) => provider.isMetaMask) ?? injected.providers[0]
  }

  return injected
}

/** Uses ethers v6 so the same provider can later be reused for contract calls. */
export async function readInjectedWallet(
  ethereum: InjectedEthereumProvider,
  requestAccounts: boolean,
): Promise<WalletSnapshot> {
  const { BrowserProvider, getAddress } = await import('ethers')
  const provider = new BrowserProvider(ethereum)
  const accounts = (await provider.send(
    requestAccounts ? 'eth_requestAccounts' : 'eth_accounts',
    [],
  )) as unknown
  const network = await provider.getNetwork()
  const firstAccount =
    Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : null

  return {
    address: firstAccount ? getAddress(firstAccount) : null,
    chainId: Number(network.chainId),
  }
}

export async function switchToCampusChain(ethereum: InjectedEthereumProvider): Promise<void> {
  const { BrowserProvider } = await import('ethers')
  const provider = new BrowserProvider(ethereum)
  const switchParams = { chainId: CAMPUSCHAIN_LOCAL.chainIdHex }

  try {
    await provider.send('wallet_switchEthereumChain', [switchParams])
    return
  } catch (error) {
    if (readErrorCode(error) !== 4902) {
      throw error
    }
  }

  await provider.send('wallet_addEthereumChain', [
    {
      chainId: CAMPUSCHAIN_LOCAL.chainIdHex,
      chainName: CAMPUSCHAIN_LOCAL.name,
      nativeCurrency: CAMPUSCHAIN_LOCAL.nativeCurrency,
      rpcUrls: [CAMPUSCHAIN_LOCAL.rpcUrl],
    },
  ])

  try {
    await provider.send('wallet_switchEthereumChain', [switchParams])
  } catch (error) {
    if (readErrorCode(error) !== 4902) {
      throw error
    }
  }
}

export function toWalletError(error: unknown, title = 'Action impossible'): WalletError {
  const code = readErrorCode(error)

  if (code === 4001 || code === 'ACTION_REJECTED') {
    return {
      title: 'Demande refusée',
      message: 'La demande a été refusée dans MetaMask. Aucune transaction n’a été effectuée.',
    }
  }

  if (code === -32002) {
    return {
      title: 'Demande déjà en cours',
      message: 'Ouvrez MetaMask pour terminer la demande en attente, puis réessayez.',
    }
  }

  if (code === 4902) {
    return {
      title: 'Réseau introuvable',
      message: 'CampusChain Local n’est pas encore configuré dans MetaMask.',
    }
  }

  if (code === 4900 || code === 4901) {
    return {
      title: 'MetaMask indisponible',
      message: 'Le portefeuille n’est pas connecté au réseau. Vérifiez MetaMask puis réessayez.',
    }
  }

  return {
    title,
    message: readErrorMessage(error),
  }
}

export function shortenAddress(address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function getNetworkLabel(chainId: number | null) {
  if (chainId === null) return 'Réseau inconnu'
  return knownNetworks[chainId] ?? `Réseau #${chainId}`
}

function readErrorCode(error: unknown): number | string | undefined {
  if (!error || typeof error !== 'object') return undefined

  const root = error as { code?: unknown; error?: unknown; info?: unknown; data?: unknown }
  const codes: Array<number | string> = []

  function pushCode(value: unknown) {
    if (typeof value === 'number' || typeof value === 'string') codes.push(value)
  }

  function collect(node: unknown, depth: number) {
    if (depth > 2 || !node || typeof node !== 'object') return

    const entry = node as { code?: unknown; error?: unknown }
    pushCode(entry.code)
    collect(entry.error, depth + 1)
  }

  pushCode(root.code)
  collect(root.error, 0)
  collect(root.info, 0)
  collect(root.data, 0)

  // Ethers v6 wraps provider errors, so the numeric EIP-1193 code usually lives
  // one level deeper than the top-level `code` ('ACTION_REJECTED', 'UNKNOWN_ERROR').
  return codes.find((code) => typeof code === 'number') ?? codes[0]
}

function readErrorMessage(error: unknown): string {
  const fallback = 'Une erreur inattendue est survenue. Réessayez dans MetaMask.'

  if (!error || typeof error !== 'object') return fallback

  const candidate = error as { shortMessage?: unknown; message?: unknown }
  const shortMessage =
    typeof candidate.shortMessage === 'string' ? candidate.shortMessage.trim() : ''
  const message = typeof candidate.message === 'string' ? candidate.message.trim() : ''

  // Prefer ethers' shortMessage; its `message` dumps the whole error object.
  const readable = shortMessage || message

  if (!readable) return fallback
  if (readable.includes('user rejected') || readable.includes('user denied')) {
    return 'La demande a été refusée dans MetaMask. Aucune transaction n’a été effectuée.'
  }

  return readable
}
