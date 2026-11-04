import type { ChainTransaction, TransactionType } from '../types'

let blockCounter = 5_284_400

function pseudoHex(seed: string, length: number) {
  let hash = 2_166_136_261
  let output = ''

  for (let index = 0; index < length; index += 1) {
    const code = seed.charCodeAt(index % seed.length) + index * 131
    hash ^= code
    hash = Math.imul(hash, 16_777_619)
    output += ((hash >>> 0) % 16).toString(16)
  }

  return output
}

/** Demo-only hash. It is never submitted to a blockchain. */
export function createMockHash(seed: string) {
  return `0x${pseudoHex(seed, 64)}`
}

/** Demo-only wallet address. */
export function createMockAddress(seed: string) {
  return `0x${pseudoHex(`address-${seed}`, 40)}`
}

/** Demo-only block number. */
export function nextMockBlockNumber() {
  blockCounter += 1
  return blockCounter
}

interface SimulatedTransactionInput {
  loanId: string
  type: TransactionType
  equipmentName: string
  actor: string
  date?: string
  blockNumber?: number
  gasUsed?: number
}

/**
 * Creates a locally generated transaction record for interface demonstration.
 * No wallet, RPC node, contract or blockchain network is involved.
 */
export function createSimulatedTransaction({
  loanId,
  type,
  equipmentName,
  actor,
  date,
  blockNumber,
  gasUsed,
}: SimulatedTransactionInput): ChainTransaction {
  const timestamp = date ?? new Date().toISOString()

  return {
    id: `tx-${loanId}-${type}-${Date.parse(timestamp) || Date.now()}-${pseudoHex(`${actor}${timestamp}`, 4)}`,
    hash: createMockHash(`${loanId}-${type}-${timestamp}-${equipmentName}`),
    type,
    equipmentName,
    actor,
    actorAddress: createMockAddress(actor),
    date: timestamp,
    blockNumber: blockNumber ?? nextMockBlockNumber(),
    gasUsed: gasUsed ?? 21_000 + Math.floor(Math.random() * 58_000),
    loanId,
    isSimulated: true,
  }
}
