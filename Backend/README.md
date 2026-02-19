# Fraud Detection System

Financial transaction fraud detection system using graph analysis algorithms to identify suspicious accounts and fraud rings.

## Features

### Core Capabilities
- **CSV Parsing**: Transaction data parsing with comprehensive validation
- **Graph Analysis**: Directed graph representation with adjacency list structure
- **Pattern Detection**: 7 core fraud detection patterns as specified in requirements
- **Smart Scoring**: Weighted scoring system with legitimacy detection (0-100 scale)
- **Multi-Signal Validation**: Requires multiple independent fraud indicators to reduce false positives
- **Fraud Rings**: Automatic identification and risk scoring of connected suspicious accounts
- **Performance**: Optimized O(V + E) to O(V × E) algorithms with progress tracking
- **Serialization**: Full JSON serialization/deserialization support

### Detection Patterns

**Core Patterns (Requirements 2-8)**:
- Cycle detection (circular money flow) - Requirement 2
- Fan-out patterns (rapid distribution) - Requirement 3
- Fan-in patterns (collection points) - Requirement 4
- Shell accounts (minimal pass-through activity) - Requirement 5
- Passthrough behavior (rapid forwarding) - Requirement 6
- Structuring (round number patterns) - Requirement 7
- Threshold avoidance (amounts near $10k) - Requirement 8

**Enhanced Patterns** (Implementation details for improved accuracy):
The system includes additional pattern detection beyond core requirements to improve detection accuracy and reduce false positives. These include velocity anomalies, amount anomalies, unusual timing, burst activity, dormancy reactivation, amount splitting, frequency anomalies, network influence, round-trip transactions, layering depth, counterparty diversity, amount progression, and temporal clustering.

## Project Structure

```
fraud-detection-system/
├── src/
│   ├── FraudDetectionSystemOptimized.js  # Main analysis pipeline
│   ├── models/                           # Core data models
│   │   ├── Transaction.js
│   │   ├── SuspiciousAccount.js
│   │   ├── FraudRing.js
│   │   └── PatternTypes.js
│   ├── graph/                            # Graph data structures
│   │   └── TransactionGraph.js
│   ├── parser/                           # CSV parsing
│   │   └── CSVParser.js
│   ├── analyzer/                         # Pattern detection
│   │   └── GraphAnalyzerEnhanced.js
│   ├── scorer/                           # Score calculation
│   │   └── ScoreCalculatorEnhanced.js
│   ├── formatter/                        # JSON formatting
│   │   └── JSONFormatter.js
│   └── index.js                          # Main exports
├── tests/                                # Unit and property-based tests
├── example-10k-optimized.js              # Usage examples
├── package.json
├── vitest.config.js
└── README.md
```

## Installation

```bash
npm install
```

## Usage

### Basic Analysis

```javascript
import { FraudDetectionSystemOptimized } from './src/FraudDetectionSystemOptimized.js';

const system = new FraudDetectionSystemOptimized();

const csvData = `transaction_id,sender_id,receiver_id,amount,timestamp
tx1,ACC001,ACC002,5000,2024-01-01 10:00:00
tx2,ACC002,ACC003,4800,2024-01-01 11:00:00
tx3,ACC003,ACC001,4600,2024-01-01 12:00:00`;

const results = system.analyze(csvData);
const parsed = JSON.parse(results);

console.log(`Suspicious accounts: ${parsed.suspicious_accounts.length}`);
console.log(`Fraud rings: ${parsed.fraud_rings.length}`);
```

### Serialization

```javascript
// Serialize analysis results
const serialized = FraudDetectionSystemOptimized.toJSON(
  suspiciousAccounts,
  fraudRings,
  summary
);

// Deserialize analysis results
const deserialized = FraudDetectionSystemOptimized.fromJSON(serialized);
```

### Running Examples

```bash
node example-10k-optimized.js
```

## Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test fraud-detection-system.test.js
```

## Core Components

### FraudDetectionSystemOptimized
Main orchestrator that wires together all components (Requirement 13):
- Parses CSV data (Requirement 1)
- Builds transaction graph (Requirement 1.6)
- Detects fraud patterns (Requirements 2-8)
- Calculates suspicion scores with multi-signal validation (Requirement 9)
- Identifies fraud rings (Requirement 10)
- Formats JSON output (Requirement 12)
- Tracks processing time (Requirement 13.3)

### Fraud Detection Philosophy
The system uses a **multi-signal approach** to reduce false positives (Requirement 9.4):
- Requires multiple independent fraud indicators
- Applies legitimacy penalties for normal business patterns (Requirement 9.2)
- Uses confidence thresholds (high/medium/low risk)
- Validates patterns against known legitimate behaviors

### CSVParser
Reads and validates CSV transaction data (Requirement 1):
- Validates required fields (Requirements 1.1, 1.2)
- Validates data types and formats (Requirements 1.4, 1.5)
- Constructs transaction graph (Requirement 1.6)
- Provides descriptive error messages (Requirement 1.3)

### GraphAnalyzerEnhanced
Detects fraud patterns using graph algorithms (Requirements 2-8):
- Cycle detection (length 3, 4, 5) - Requirement 2
- Fan-out/fan-in patterns (temporal windows) - Requirements 3, 4
- Shell account detection - Requirement 5
- Passthrough behavior (rapid forwarding) - Requirement 6
- Structuring patterns (round numbers) - Requirement 7
- Threshold avoidance (amounts near $10k) - Requirement 8
- Fraud ring identification (Requirement 10)

### ScoreCalculatorEnhanced
Computes suspicion and risk scores (Requirements 9, 11):
- Weighted aggregate scoring (Requirement 9.1)
- Legitimacy penalty detection (Requirement 9.2)
- Score clamping [0, 100] (Requirement 9.3)
- Suspicious classification (Requirement 9.4)
- Ring risk score calculation (Requirements 11.1, 11.2)

### JSONFormatter
Formats analysis results as JSON (Requirement 12):
- Sorts accounts by suspicion score (Requirement 12.5)
- Includes all required fields (Requirements 12.1-12.4)
- Formats numbers to 1 decimal place

## Core Data Models

- **Transaction**: Represents a financial transaction between accounts
- **SuspiciousAccount**: Account flagged as suspicious with score and patterns
- **FraudRing**: Group of connected suspicious accounts
- **TransactionGraph**: Directed graph with adjacency list representation

## Pattern Types

- **Cycle**: Circular money flow patterns
- **FanOutPattern**: One sender to many receivers
- **FanInPattern**: Many senders to one receiver
- **PassthroughEvent**: Rapid fund forwarding
- **StructuringPattern**: Round number transaction patterns
- **ThresholdPattern**: Threshold avoidance behavior

## Output Format

```json
{
  "suspicious_accounts": [
    {
      "account_id": "ACC001",
      "suspicion_score": 75.5,
      "detected_patterns": ["cycle", "shell_account"],
      "ring_id": "RING-001"
    }
  ],
  "fraud_rings": [
    {
      "ring_id": "RING-001",
      "member_accounts": ["ACC001", "ACC002", "ACC003"],
      "pattern_type": "cycle",
      "risk_score": 82.3
    }
  ],
  "summary": {
    "total_accounts_analyzed": 10,
    "suspicious_accounts_flagged": 3,
    "fraud_rings_detected": 1,
    "processing_time_seconds": 0.1
  }
}
```

## Error Handling

The system provides descriptive error messages for (Requirement 1):
- Missing required CSV fields (Requirement 1.3)
- Invalid data types (amounts, timestamps) (Requirements 1.4, 1.5)
- Malformed CSV structure
- Empty or invalid input data

Example:
```
ParseError: Line 2: Invalid amount: 'invalid_amount' is not a valid number
```

## Requirements Traceability

This implementation satisfies all 14 requirements specified in the requirements document:
- Requirement 1: Parse Transaction Data
- Requirement 2: Detect Cycle Patterns
- Requirement 3: Detect High Velocity Fan-Out Patterns
- Requirement 4: Detect High Velocity Fan-In Patterns
- Requirement 5: Detect Shell Accounts
- Requirement 6: Detect Rapid Passthrough Behavior
- Requirement 7: Detect Structuring Patterns
- Requirement 8: Detect Threshold Avoidance
- Requirement 9: Calculate Suspicion Scores
- Requirement 10: Identify Fraud Rings
- Requirement 11: Calculate Ring Risk Scores
- Requirement 12: Format Analysis Results
- Requirement 13: Ensure Processing Performance
- Requirement 14: Serialize and Deserialize Analysis Results
