export const CAMPUSCHAIN_LOCAL = {
  chainId: 31337,
  chainIdHex: '0x7a69',
  name: 'CampusChain Local',
  rpcUrl: 'http://127.0.0.1:8545',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const

export function isCampusChain(chainId: number | null | undefined) {
  return chainId === CAMPUSCHAIN_LOCAL.chainId
}
