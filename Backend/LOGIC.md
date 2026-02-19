# Fraud Detection System - Technical Logic & Algorithms

This document explains the technical implementation details, algorithms, and methodologies used in the fraud detection system as specified in the design document.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Structures](#data-structures)
3. [Core Detection Algorithms](#core-detection-algorithms)
4. [Scoring System](#scoring-system)
5. [Performance Optimizations](#performance-optimizations)

---

## System Architecture

### Pipeline Overview
The fraud detection system follows a 4-stage pipeline as specified in the design document:

1. **Data Ingestion** - Parse CSV transaction data and validate input
2. **Graph Construction** - Build directed graph representation of transaction flows
3. **Pattern Detection & Scoring** - Apply detection algorithms and calculate scores
4. **Result Formatting** - Generate JSON output with sorted results

### Component Interaction
```
CSV Input → CSV_Parser → Transaction_Graph → Graph_Analyzer → Score_Calculator → JSON_Formatter → JSON Output
```

The architecture emphasizes:
- Separation of concerns (parsing, analysis, scoring, formatting)
- Efficient graph algorithms for large-scale transaction analysis
- Modular pattern detection for extensibility
- Clear data flow from input to output

---

## Data Structures

### 1. Transaction Graph (Adjacency List)
**File**: `src/graph/TransactionGraph.js`

**Structure**:
- `outgoingEdges`: Map<AccountId, Transaction[]> - Outgoing transactions per account
- `incomingEdges`: Map<AccountId, Transaction[]> - Incoming transactions per account
- `transactions`: Map<TransactionId, Transaction> - All transactions by ID

**Complexity**:
- Space: O(V + E) where V = accounts, E = transactions
- Lookup: O(1) for account transactions
- Traversal: O(E) for all edges

**Why Adjacency List?**
- Efficient for sparse graphs (typical in financial networks)
- Fast neighbor lookup for pattern detection
- Memory efficient compared to adjacency matrix

### 2. Pattern Storage
Patterns are stored in Maps and Sets for O(1) lookup:
- `Map<AccountId, PatternData>` - For patterns with metadata
- `Set<AccountId>` - For binary flags (shell accounts, etc.)

---

## Core Detection Algorithms

The system implements 7 core fraud detection patterns as specified in the requirements document. The implementation includes additional enhanced patterns for improved detection accuracy, but the core patterns form the foundation of the fraud detection system.

### Core Pattern 1: Cycle Detection

### Core Pattern 1: Cycle Detection
**Requirement**: Requirement 2 - Detect Cycle Patterns
**Algorithm**: Depth-First Search (DFS) with path tracking
**File**: `GraphAnalyzerEnhanced.detectCyclesEfficient()`

**Logic**:
1. For each account, perform DFS with recursion stack
2. Track current path during traversal
3. When revisiting a node in current path, extract cycle
4. Normalize cycles (start with smallest account ID) to avoid duplicates
5. Filter cycles of length 3, 4, or 5

**Complexity**: O(V + E) with early termination
**Fraud Indicator**: Circular money flow to obscure origin

**Example**:
```
ACC001 → ACC002 → ACC003 → ACC001 (3-node cycle)
```

**Scoring** (Requirement 2.4):
- Length 3 cycles: 40 points
- Length 4 cycles: 32 points
- Length 5 cycles: 25 points
- Take maximum if account participates in multiple cycles

---

### Core Pattern 2: Fan-Out Pattern Detection
**Requirement**: Requirement 3 - Detect High Velocity Fan-Out Patterns
**Algorithm**: Sliding time window analysis
**File**: `GraphAnalyzerEnhanced.detectFanOutPatterns()`

**Logic**:
1. For each account, get all outgoing transactions
2. Sort transactions by timestamp
3. Use 72-hour sliding window
4. Count unique receivers in each window
5. Flag if ≥10 unique receivers in any window

**Complexity**: O(V × E_out × log(E_out))
**Fraud Indicator**: Rapid distribution to many accounts (smurfing)

**Scoring** (Requirement 3.3):
- 15-22 points based on number of receivers
- Linear scale from 10 to 20+ receivers

---

### Core Pattern 3: Fan-In Pattern Detection
**Requirement**: Requirement 4 - Detect High Velocity Fan-In Patterns
**Algorithm**: Sliding time window analysis (reverse of fan-out)
**File**: `GraphAnalyzerEnhanced.detectFanInPatterns()`

**Logic**:
1. For each account, get all incoming transactions
2. Sort transactions by timestamp
3. Use 72-hour sliding window
4. Count unique senders in each window
5. Flag if ≥10 unique senders in any window

**Complexity**: O(V × E_in × log(E_in))
**Fraud Indicator**: Collection point for distributed fraud (money mule)

**Scoring** (Requirement 4.3):
- 15-22 points based on number of senders
- Linear scale from 10 to 20+ senders

---

### Core Pattern 4: Shell Account Detection
**Requirement**: Requirement 5 - Detect Shell Accounts
**Algorithm**: Transaction count analysis with betweenness centrality
**File**: `GraphAnalyzerEnhanced.detectShellAccounts()`

**Logic**:
1. Count incoming and outgoing transactions
2. Flag if total ≤3 AND has both incoming and outgoing
3. Indicates minimal activity with pass-through behavior
4. Calculate betweenness centrality to identify intermediaries

**Complexity**: O(V) for basic detection, O(V × E) for centrality
**Fraud Indicator**: Temporary account for layering funds

**Scoring** (Requirement 5.3):
- 15-20 points based on betweenness centrality percentile
- Higher centrality = higher score

---

### Core Pattern 5: Passthrough Behavior Detection
**Requirement**: Requirement 6 - Detect Rapid Passthrough Behavior
**Algorithm**: Temporal correlation analysis
**File**: `GraphAnalyzerEnhanced.detectPassthroughBehavior()`

**Logic**:
1. For each account, get incoming and outgoing transactions
2. Sort both by timestamp
3. For each incoming transaction, find outgoing within 6 hours
4. Record time delta between correlated transactions
5. Flag accounts with multiple passthrough events

**Complexity**: O(V × E_in × E_out) with early termination
**Fraud Indicator**: Rapid forwarding of funds (layering)

**Scoring** (Requirement 6.2):
- 5-10 points based on frequency and speed
- More frequent passthrough = higher score

---

### Core Pattern 6: Structuring Detection
**Requirement**: Requirement 7 - Detect Structuring Patterns
**Algorithm**: Round number frequency analysis
**File**: `GraphAnalyzerEnhanced.detectStructuring()`

**Logic**:
1. For each account, analyze all transaction amounts
2. Count transactions with round numbers (divisible by 1000, 500, or 100)
3. Calculate percentage of round number transactions
4. Flag if >70% are round numbers

**Complexity**: O(V × E)
**Fraud Indicator**: Deliberate amount selection to avoid detection

**Scoring** (Requirement 7.3):
- 5-8 points based on percentage of round numbers
- Higher percentage = higher score

---

### Core Pattern 7: Threshold Avoidance Detection
**Requirement**: Requirement 8 - Detect Threshold Avoidance
**Algorithm**: Statistical clustering analysis
**File**: `GraphAnalyzerEnhanced.detectThresholdAvoidance()`

**Logic**:
1. Calculate average transaction amount per account
2. Flag if average is between $9,000-$9,999
3. Calculate clustering consistency (% near threshold)
4. Indicates deliberate avoidance of $10,000 reporting threshold

**Complexity**: O(V × E)
**Fraud Indicator**: Structuring to avoid regulatory reporting

**Scoring** (Requirement 8.3):
- 5-8 points based on clustering consistency
- Higher consistency = higher score

---

## Enhanced Detection Patterns

The implementation includes additional enhanced patterns beyond the core requirements to improve detection accuracy and reduce false positives. These patterns are implementation details and include:

- Velocity anomaly detection (transaction rate spikes)
- Amount anomaly detection (statistical outliers using IQR)
- Unusual timing patterns (night/weekend activity)
- Burst activity detection (sudden transaction spikes)
- Dormancy reactivation (inactive then active accounts)
- Amount splitting detection (breaking large amounts)
- Frequency anomaly detection (high transaction rates)
- Network influence calculation (PageRank-based centrality)
- Round-trip transaction detection (A→B→A patterns)
- Layering depth analysis (transaction chain complexity)
- Counterparty diversity analysis (repeated same parties)
- Amount progression patterns (escalating/de-escalating)
- Temporal clustering (automated timing patterns)

These enhanced patterns contribute additional points to the suspicion score but are not part of the core requirements.

---
## Scoring System

### Score Calculation
**File**: `ScoreCalculatorEnhanced.calculateSuspicionScore()`
**Requirement**: Requirement 9 - Calculate Suspicion Scores

**Total Possible Points**: ~125 points (clamped to 0-100 range)

#### Point Distribution

**Core Patterns (40 points max)**:
- Cycle (3-node): 40 points (Requirement 2.4)
- Cycle (4-node): 32 points (Requirement 2.4)
- Cycle (5-node): 25 points (Requirement 2.4)
- Fan-out: 15-22 points (Requirement 3.3)
- Fan-in: 15-22 points (Requirement 4.3)
- Shell account: 15-20 points (Requirement 5.3)
- Passthrough: 5-10 points (Requirement 6.2)
- Structuring: 5-8 points (Requirement 7.3)
- Threshold avoidance: 5-8 points (Requirement 8.3)

**Enhanced Patterns (additional points)**:
The implementation includes additional pattern detection beyond core requirements, contributing up to 85 additional points for improved accuracy.

### Legitimacy Penalties
**File**: `ScoreCalculatorEnhanced._calculateLegitimacyPenalty()`
**Requirement**: Requirement 9.2 - Apply Legitimacy Penalty Adjustments

Reduces false positives by identifying legitimate patterns:

1. **Payroll Pattern** (-20 to -25 points):
   - ≥10 outgoing transactions
   - ≤3 unique amounts (regular payments)
   - Regular timing (weekly/biweekly)

2. **Merchant Pattern** (-15 to -20 points):
   - ≥20 incoming transactions
   - Average amount <$100 (small purchases)
   - High diversity of senders

3. **Utility Pattern** (-10 to -15 points):
   - ≥5 outgoing transactions
   - All to same receiver (bill payments)
   - Regular intervals

4. **Business Account Pattern** (-20 points):
   - High transaction volume (>50 txs)
   - Balanced incoming/outgoing ratio (0.5-2.0)
   - Diverse counterparties (>30% unique)

5. **Savings Transfer Pattern** (-15 points):
   - Regular transfers to same account
   - Consistent amounts
   - Low frequency (<5 per month)

### Suspicion Score Bounds
**Requirement**: Requirement 9.3 - Ensure Score Remains Within [0, 100]

Final score is clamped using:
```javascript
score = Math.max(0, Math.min(100, rawScore))
```

### Suspicious Account Classification
**Requirement**: Requirement 9.4 - Classify Accounts with Score ≥50 as Suspicious

The implementation uses a multi-signal approach to reduce false positives:
- Score ≥80: Very high confidence (immediate flag)
- Score ≥70 AND 3+ patterns: High confidence with corroboration
- Score ≥60 AND cycle + 3+ patterns: Cycle involvement with other signals
- Score ≥50 AND cycle + 4+ patterns: Strong multi-signal evidence

This ensures multiple independent fraud indicators must align before flagging.

### Ring Risk Score
**Requirement**: Requirements 11.1, 11.2 - Calculate Ring Risk Scores
**Formula**:
```
ring_risk = (0.6 × max_member_score) + (0.4 × avg_member_score) × size_multiplier
size_multiplier = 1.0 + (0.1 × min(ring_size - 2, 8))
```

**Logic**:
- Weighted combination of max and average member scores
- Size multiplier increases risk for larger rings
- Caps multiplier at 10 members to prevent over-inflation

---

## Performance Optimizations

### 1. Early Termination
- Cycle detection stops at configurable limit (default 100 cycles)
- Round-trip detection limits to 10 per account
- BFS depth limited to 6 hops for layering analysis

### 2. Caching
- Global statistics calculated once and cached
- Centrality scores cached for reuse
- Time pattern analysis cached

### 3. Efficient Data Structures
- Adjacency list for O(1) neighbor lookup
- Maps and Sets for O(1) pattern membership checks
- Sorted arrays for binary search in time windows

### 4. Algorithmic Complexity
Core algorithms achieve O(V + E) or O(V × E) complexity:
- Cycle detection: O(V + E) with early termination
- Fan patterns: O(V × E × log(E)) due to sorting
- Shell accounts: O(V)
- Passthrough: O(V × E_in × E_out) with early termination
- Statistical patterns: O(V × E)

### 5. Memory Management
- Streaming CSV parsing (line-by-line)
- Limited pattern storage (top examples only)
- Garbage collection friendly (no circular references)

### 6. Progress Reporting
Optional progress callbacks for long-running operations:
```javascript
const system = new FraudDetectionSystemOptimized({
  progressCallback: (message, percent) => {
    console.log(`${percent}%: ${message}`);
  }
});
```

---

## Fraud Ring Identification

**Requirement**: Requirement 10 - Identify Fraud Rings
**Algorithm**: Connected components on suspicious account subgraph
**File**: `GraphAnalyzerEnhanced.identifyFraudRings()`

**Logic**:
1. Create subgraph containing only suspicious accounts
2. Use BFS to find connected components
3. Assign unique ring_id to each component
4. Classify ring pattern type based on detected patterns

**Pattern Classification** (Requirement 10.3, 10.4):
- **cycle**: Ring contains cycle patterns
- **smurfing**: Dominated by fan-in/fan-out patterns
- **shell_chain**: Contains multiple shell accounts
- **hybrid**: Multiple pattern types present

**Complexity**: O(V + E) where V = suspicious accounts, E = transactions between them

---

## Testing Strategy

### Unit Tests
- Individual pattern detection algorithms
- Score calculation logic
- Edge cases (empty graphs, single transactions)
- CSV parsing and validation
- Graph construction

### Property-Based Tests
**Testing Library**: fast-check for JavaScript
**Configuration**: Minimum 100 iterations per property test

**Key Properties** (from design document):
1. CSV Parsing Completeness (Properties 1-2)
2. Cycle Detection Completeness (Properties 3-4)
3. Pattern Detection (Properties 5-16)
4. Scoring Properties (Properties 17-19)
5. Ring Analysis (Properties 20-22)
6. Output Properties (Properties 23-26)

### Integration Tests
- Full pipeline with real-world-like data
- Performance benchmarks (10k+ transactions)
- Memory usage profiling
- End-to-end validation

---

## Algorithm Selection Rationale

### Why These Algorithms?

1. **Graph-Based Approach**: Financial transactions naturally form a directed graph
2. **Multiple Signals**: No single pattern catches all fraud; ensemble approach increases detection
3. **Statistical Methods**: IQR and trend analysis catch anomalies without hardcoded thresholds
4. **Temporal Analysis**: Time-based patterns reveal coordination and automation
5. **Network Analysis**: Centrality metrics identify key players in fraud networks

### Trade-offs

**Accuracy vs Performance**:
- Limited cycle depth (5 max) for speed
- Simplified centrality calculation
- Sampling for high-complexity algorithms

**False Positives vs False Negatives**:
- Legitimacy penalties reduce false positives
- Multiple pattern types reduce false negatives
- Multi-signal threshold (≥50 with multiple patterns) balances precision and recall

---

## References

### Algorithms
- **Cycle Detection**: DFS-based cycle detection (simplified Tarjan's algorithm)
- **Betweenness Centrality**: Brandes' algorithm (2001)
- **IQR Outlier Detection**: Tukey's method (1977)
- **Connected Components**: BFS-based component finding

### Fraud Detection Techniques
- **Structuring**: FinCEN guidance on currency transaction reporting
- **Layering**: FATF money laundering typologies
- **Smurfing**: Anti-money laundering best practices
- **Velocity Checks**: Payment fraud prevention standards

### Graph Theory
- **Adjacency List**: Cormen et al., "Introduction to Algorithms"
- **BFS/DFS**: Classic graph traversal algorithms
- **Connected Components**: Standard graph algorithm

---

## Glossary

- **Cycle**: Circular path in transaction graph (A→B→C→A)
- **Fan-out**: One account sending to many receivers
- **Fan-in**: Many senders to one receiver
- **Shell Account**: Minimal-activity pass-through account
- **Passthrough**: Rapid forwarding of received funds
- **Structuring**: Breaking amounts to avoid reporting thresholds
- **Smurfing**: Distributing funds across many accounts
- **Layering**: Multiple transaction hops to obscure origin
- **Mule Account**: Account used to receive/forward illicit funds
- **Wash Trading**: Fake transactions to create false activity
- **Betweenness Centrality**: Measure of node importance in network
- **IQR**: Interquartile Range (Q3 - Q1)
- **Fraud Ring**: Group of connected accounts exhibiting coordinated suspicious behavior
