# Chen Pilot SDK Core

Core SDK for Chen Pilot cross-chain operations with support for Soroban contract interactions, event subscriptions, recovery mechanisms, and automatic fee bumping.

## Features

- **Multi-Sig Configuration**: High-level builder for complex multi-signature account setup
- **Fee Bumping**: Automatic resource limit adjustment for Soroban transactions
- **Event Subscriptions**: Subscribe to Soroban contract events
- **Recovery Engine**: Handle failed cross-chain transactions
- **Plan Verification**: Verify and validate transaction plans
- **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @chen-pilot/sdk-core
```

## Quick Start

### Multi-Sig Configuration

Set up complex multi-signature accounts with weight and threshold requirements:

```typescript
import { MultiSigBuilder, ThresholdCategory } from "@chen-pilot/sdk-core";

const builder = new MultiSigBuilder("GMASTER_ACCOUNT_ADDRESS")
  .addSigner("GSIGNER1_ADDRESS", 10)
  .addSigner("GSIGNER2_ADDRESS", 20)
  .addSigner("GSIGNER3_ADDRESS", 30)
  .setThreshold(ThresholdCategory.MEDIUM, 30)
  .setThreshold(ThresholdCategory.HIGH, 50);

const result = builder.build();

if (result.validation.valid) {
  console.log("Configuration:", result.config);
  console.log("Estimated fee:", result.estimatedFee, "stroops");
}

// Or use presets for common scenarios
const preset = MultiSigBuilder.createPreset(
  "2-of-3",
  "GMASTER_ADDRESS",
  ["GSIGNER1", "GSIGNER2", "GSIGNER3"]
);
```

### Fee Bumping

Automatically adjust resource limits for Soroban transactions:

```typescript
import { FeeBumpingEngine } from "@chen-pilot/sdk-core";

const engine = new FeeBumpingEngine({
  strategy: "moderate",
  maxAttempts: 3,
});

const result = await engine.bumpAndRetry(async (limits) => {
  return await sorobanClient.invokeContract({
    contractId: "CXXX...",
    method: "transfer",
    args: [...],
    resourceLimits: limits,
  });
});

if (result.success) {
  console.log("Transaction hash:", result.result.hash);
  console.log("Final fee:", result.estimatedFee, "stroops");
}
```

### Event Subscriptions

Subscribe to Soroban contract events:

```typescript
import { subscribeToEvents } from "@chen-pilot/sdk-core";

const subscription = await subscribeToEvents(
  {
    network: "testnet",
    contractIds: ["CXXX..."],
    topicFilter: ["transfer"],
    pollingIntervalMs: 5000,
  },
  async (event) => {
    console.log("Event received:", event);
  },
  (error) => {
    console.error("Subscription error:", error);
  }
);

// Later: stop subscription
await subscription.unsubscribe();
```

### Recovery Engine

Handle failed cross-chain transactions:

```typescript
import { RecoveryEngine } from "@chen-pilot/sdk-core";

const engine = new RecoveryEngine({
  maxRetries: 3,
  retryDelayMs: 5000,
});

const result = await engine.recover({
  lockTxId: "btc_tx_123",
  amount: "1000000",
  fromChain: ChainId.BITCOIN,
  toChain: ChainId.STELLAR,
  destinationAddress: "GXXX...",
});

console.log("Recovery action:", result.actionTaken);
```

## Documentation

- [Multi-Sig Configuration Guide](./docs/MULTI_SIG.md) - Complete guide to multi-signature accounts
- [Fee Bumping Guide](./docs/FEE_BUMPING.md) - Comprehensive guide to automatic fee bumping
- [API Reference](./docs/API.md) - Complete API documentation
- [Examples](./examples/) - Usage examples

## API Overview

### Multi-Sig Configuration

```typescript
// Create builder
const builder = new MultiSigBuilder(masterAccount, {
  autoValidate: boolean,
  allowDuplicates: boolean,
  maxSigners: number,
});

// Add signers
builder.addSigner(address, weight);
builder.addSigners([{ address, weight }, ...]);
builder.removeSigner(address);
builder.updateSignerWeight(address, newWeight);

// Set thresholds
builder.setThreshold(ThresholdCategory.MEDIUM, value);
builder.setThresholds({ low, medium, high });

// Validate and build
const validation = builder.validate();
const result = builder.build();

// Presets
const preset = MultiSigBuilder.createPreset(
  "2-of-3" | "3-of-5" | "majority" | "unanimous",
  masterAccount,
  signerAddresses
);

// Utility functions
validateMultiSigConfig(config);
calculateTotalWeight(config);
canMeetThreshold(signers, config, threshold);
```

### Fee Bumping

```typescript
// Create engine
const engine = new FeeBumpingEngine({
  strategy: "conservative" | "moderate" | "aggressive",
  maxAttempts: number,
  initialLimits: ResourceLimits,
  onBump: (info) => void,
});

// Execute with automatic retries
const result = await engine.bumpAndRetry(txExecutor, initialLimits?);

// Manual adjustment calculation
const adjusted = engine.calculateAdjustment(error, currentLimits);

// Fee estimation
const fee = engine.estimateFee(limits);

// Get defaults
const defaults = FeeBumpingEngine.getDefaultLimits();
```

### Event Subscriptions

```typescript
const subscription = await subscribeToEvents(
  config: EventSubscriptionConfig,
  onEvent: EventHandler,
  onError?: ErrorHandler
);

await subscription.unsubscribe();
const isActive = subscription.isActive();
const lastLedger = subscription.getLastLedger();
```

### Recovery Engine

```typescript
const engine = new RecoveryEngine(options);
const result = await engine.recover(context);
```

## Types

```typescript
// Multi-Sig Types
interface MultiSigConfig {
  masterAccount: string;
  signers: Signer[];
  thresholds: ThresholdConfig;
}

interface Signer {
  address: string;
  weight: number; // 0-255
}

interface ThresholdConfig {
  low: number;
  medium: number;
  high: number;
}

enum ThresholdCategory {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

interface MultiSigBuildResult {
  config: MultiSigConfig;
  validation: MultiSigValidationResult;
  estimatedFee?: number;
}

// Resource Limits
interface ResourceLimits {
  cpuInstructions: number;
  readBytes: number;
  writeBytes: number;
  readLedgerEntries: number;
  writeLedgerEntries: number;
  txSizeByte: number;
}

// Fee Bump Result
interface FeeBumpResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  finalLimits: ResourceLimits;
  attempts: Array<{
    attempt: number;
    limits: ResourceLimits;
    error?: string;
  }>;
  estimatedFee: number;
}

// Event Subscription
interface SorobanEvent {
  transactionHash: string;
  contractId: string;
  topics: string[];
  data: unknown;
  ledger: number;
  createdAt: number;
}
```

## Examples

### Multi-Sig Configuration

```typescript
import { MultiSigBuilder, ThresholdCategory } from "@chen-pilot/sdk-core";

// Weighted multi-sig for corporate treasury
const builder = new MultiSigBuilder("GTREASURY_MASTER")
  .addSigner("GTREASURER", 40)
  .addSigner("GFINANCE1", 20)
  .addSigner("GFINANCE2", 20)
  .setThresholds({
    low: 20,   // Any finance member
    medium: 40, // Treasurer or both finance members
    high: 60,   // Treasurer + at least one finance member
  });

const result = builder.build();
console.log("Total weight:", calculateTotalWeight(result.config));
```

### Basic Fee Bumping

```typescript
import { FeeBumpingEngine } from "@chen-pilot/sdk-core";

const engine = new FeeBumpingEngine();

const result = await engine.bumpAndRetry(async (limits) => {
  return await invokeContract({ ...params, resourceLimits: limits });
});
```

### Custom Strategy

```typescript
const engine = new FeeBumpingEngine({
  strategy: "aggressive",
  maxAttempts: 5,
  onBump: (info) => {
    console.log(`Bumping ${info.error.resource}`);
  },
});
```

### Fee Estimation

```typescript
const engine = new FeeBumpingEngine();
const limits = FeeBumpingEngine.getDefaultLimits();
const fee = engine.estimateFee(limits);

console.log(`Estimated fee: ${fee / 10_000_000} XLM`);
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npx jest --coverage

# Run specific test file
npm test -- feeBumping.test.ts
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

ISC

## Support

- GitHub Issues: [github.com/gear5labs/chenpilot/issues](https://github.com/gear5labs/chenpilot/issues)
- Documentation: [Full Documentation](./docs/)

## Changelog

### v0.1.0

- Initial release
- Fee bumping engine with automatic resource limit adjustment
- Event subscription support
- Recovery engine for failed transactions
- Plan verification utilities
- Comprehensive TypeScript types
