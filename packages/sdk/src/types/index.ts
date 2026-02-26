export enum ChainId {
  BITCOIN = "bitcoin",
  STELLAR = "stellar",
  STARKNET = "starknet",
}

export interface WalletBalance {
  address: string;
  symbol: string;
  amount: string;
  chainId: ChainId;
}

export interface CrossChainSwapRequest {
  fromChain: ChainId;
  toChain: ChainId;
  fromToken: string;
  toToken: string;
  amount: string;
  destinationAddress: string;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// Recovery / Cleanup types for cross-chain flows
export enum RecoveryAction {
  RETRY_MINT = "retry_mint",
  REFUND_LOCK = "refund_lock",
  MANUAL_INTERVENTION = "manual_intervention",
}

export interface RecoveryContext {
  // Unique id for the BTC lock transaction
  lockTxId: string;
  // Lock details (addresses, script, amount, timestamps)
  lockDetails?: Record<string, unknown>;
  // Target mint tx id (if any)
  mintTxId?: string;
  // Amount and asset info
  amount: string;
  fromChain: ChainId;
  toChain: ChainId;
  destinationAddress: string;
  metadata?: Record<string, unknown>;
}

export interface RecoveryResult {
  actionTaken: RecoveryAction;
  success: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

export interface RetryHandler {
  retryMint: (context: RecoveryContext) => Promise<RecoveryResult>;
}

export interface RefundHandler {
  refundLock: (context: RecoveryContext) => Promise<RecoveryResult>;
}

export interface RecoveryEngineOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  retryHandler?: RetryHandler;
  refundHandler?: RefundHandler;
}

// ─── Soroban event subscription types ────────────────────────────────────────

/** Configuration for subscribing to Soroban contract events. */
export interface EventSubscriptionConfig {
  /** Network to subscribe to ("testnet" | "mainnet"). */
  network: "testnet" | "mainnet";
  /** Optional RPC URL override. */
  rpcUrl?: string;
  /** Contract ID(s) to subscribe to. */
  contractIds: string[];
  /** Optional topic filter (at least one topic must match). */
  topicFilter?: string[];
  /** Polling interval in milliseconds (default: 5000). Only used in polling mode. */
  pollingIntervalMs?: number;
  /** Start from a specific ledger sequence (default: latest). */
  startLedger?: number;
}

/** A single Soroban contract event. */
export interface SorobanEvent {
  /** Transaction hash that emitted the event. */
  transactionHash: string;
  /** Contract ID that emitted the event. */
  contractId: string;
  /** Event topics (usually human-readable identifiers). */
  topics: string[];
  /** Event data (typically a serialized value). */
  data: unknown;
  /** Ledger sequence the event was included in. */
  ledger: number;
  /** Unix timestamp of ledger close. */
  createdAt: number;
}

/** Callback handler for received events. */
export type EventHandler = (event: SorobanEvent) => Promise<void> | void;

/** Callback handler for subscription errors. */
export type ErrorHandler = (error: Error) => Promise<void> | void;

/** Event subscription lifecycle. */
export interface EventSubscription {
  /** Stop the subscription and clean up resources. */
  unsubscribe(): Promise<void>;
  /** Current subscription status. */
  isActive(): boolean;
  /** Last ledger that was checked. */
  getLastLedger(): number | null;
}

// ─── Soroban Fee Bumping types ───────────────────────────────────────────────

/** Resource limits for Soroban transactions */
export interface ResourceLimits {
  /** Maximum CPU instructions allowed */
  cpuInstructions: number;
  /** Maximum bytes that can be read */
  readBytes: number;
  /** Maximum bytes that can be written */
  writeBytes: number;
  /** Maximum number of ledger entries that can be read */
  readLedgerEntries: number;
  /** Maximum number of ledger entries that can be written */
  writeLedgerEntries: number;
  /** Maximum transaction size in bytes */
  txSizeByte: number;
}

/** Strategy for fee bumping */
export type FeeBumpStrategy = "conservative" | "moderate" | "aggressive";

/** Configuration for fee bumping engine */
export interface FeeBumpConfig {
  /** Strategy to use for calculating new limits (default: moderate) */
  strategy?: FeeBumpStrategy;
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial resource limits to use (uses defaults if not provided) */
  initialLimits?: ResourceLimits;
  /** Callback invoked when limits are bumped */
  onBump?: (info: FeeBumpInfo) => void;
}

/** Information about a fee bump adjustment */
export interface FeeBumpInfo {
  /** Current attempt number */
  attempt: number;
  /** Previous resource limits */
  previousLimits: ResourceLimits;
  /** New adjusted resource limits */
  newLimits: ResourceLimits;
  /** The resource error that triggered the bump */
  error: TransactionResourceError;
}

/** Parsed resource error from transaction failure */
export interface TransactionResourceError {
  /** The resource that exceeded limits */
  resource: keyof ResourceLimits;
  /** The required amount */
  required: number;
  /** The current limit */
  limit: number;
  /** Original error message */
  message: string;
}

/** Result of fee bumping operation */
export interface FeeBumpResult<T> {
  /** Whether the transaction succeeded */
  success: boolean;
  /** Transaction result if successful */
  result?: T;
  /** Error message if failed */
  error?: string;
  /** Final resource limits used */
  finalLimits: ResourceLimits;
  /** History of all attempts */
  attempts: Array<{
    attempt: number;
    limits: ResourceLimits;
    error?: string;
  }>;
  /** Estimated fee in stroops */
  estimatedFee: number;
}

/** Soroban network type */
export type SorobanNetwork = "testnet" | "mainnet";

// ─── Multi-sig Account Configuration types ───────────────────────────────────

/** Threshold category for multi-sig operations */
export enum ThresholdCategory {
  /** Low threshold for basic operations */
  LOW = "low",
  /** Medium threshold for standard operations */
  MEDIUM = "medium",
  /** High threshold for critical operations */
  HIGH = "high",
}

/** A signer with associated weight */
export interface Signer {
  /** Public key or address of the signer */
  address: string;
  /** Weight assigned to this signer (0-255) */
  weight: number;
}

/** Threshold requirements for different operation categories */
export interface ThresholdConfig {
  /** Threshold for low-security operations (default: 0) */
  low: number;
  /** Threshold for medium-security operations (default: 0) */
  medium: number;
  /** Threshold for high-security operations (master weight) */
  high: number;
}

/** Multi-signature account configuration */
export interface MultiSigConfig {
  /** Master account address */
  masterAccount: string;
  /** List of signers with their weights */
  signers: Signer[];
  /** Threshold requirements for operations */
  thresholds: ThresholdConfig;
}

/** Validation result for multi-sig configuration */
export interface MultiSigValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
}

/** Options for building multi-sig configuration */
export interface MultiSigBuilderOptions {
  /** Whether to validate configuration automatically (default: true) */
  autoValidate?: boolean;
  /** Whether to allow duplicate signers (default: false) */
  allowDuplicates?: boolean;
  /** Maximum number of signers allowed (default: 20) */
  maxSigners?: number;
}

/** Result of multi-sig configuration build */
export interface MultiSigBuildResult {
  /** The built configuration */
  config: MultiSigConfig;
  /** Validation result */
  validation: MultiSigValidationResult;
  /** Estimated transaction fee in stroops */
  estimatedFee?: number;
}
