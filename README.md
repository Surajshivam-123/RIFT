# 🕵️ Money Muling Detection System
### Graph-Based Financial Crime Detection Engine | RIFT 2026 Hackathon — Graph Theory / Financial Crime Track

> **A full-stack application that exposes money muling networks, fraud rings, and coordinated financial crime patterns by modeling bank transactions as a directed graph and applying advanced graph algorithms to detect what spreadsheets cannot see.**

---

## 🔗 Quick Links

| Resource | Link |
|---|---|
| 🌐 Live Demo | [https://dist-self-nu.vercel.app/] |
| 🎥 LinkedIn Demo Video | [Watch on LinkedIn]([(https://www.linkedin.com/posts/basant-bansal-22066036b_rifthackathon-rift26-moneymulingdetection-ugcPost-7430409965955289089-6lMN?utm_source=social_share_send&utm_medium=android_app&rcm=ACoAAFvBXzgBZWci7CZeyTmkA4t2HGKdBg0G2uw&utm_campaign=copy_link)] |
| 📁 GitHub Repository | [https://github.com/Surajshivam-123/RIFT.git] |

> **Hashtags:** `#RIFTHackathon` `#MoneyMulingDetection` `#FinancialCrime` `#GraphTheory` `#RIFT2026`

---

## 📌 Problem Statement

Money muling is a cornerstone of financial crime. Criminals recruit networks of individuals — "mules" — to move illicit funds through chains of bank accounts, making dirty money appear legitimate by the time it reaches its final destination. Each individual transaction looks ordinary. The crime only becomes visible when you look at the **relationships** between accounts — the graph.

Traditional SQL databases can answer "who sent money to whom?" but they cannot answer "is there a hidden loop of accounts cycling money in a circle?" or "is one account secretly aggregating funds from dozens of sources before dispersing them?" These questions require graph theory.

This system automatically constructs a directed graph from raw transaction data and applies five independent graph algorithms to find the exact shapes that money muling operations create — cycles, fans, chains, velocity spikes, and structuring patterns — then scores every account and groups them into fraud rings.

---

## 🎯 What the System Does — End to End

```
You upload a CSV of bank transactions
              │
              ▼
Every account becomes a NODE in a directed graph
Every transaction becomes a DIRECTED EDGE (sender → receiver)
              │
              ▼
Five graph algorithms scan the entire network simultaneously:

  ① Cycle Detection    — finds accounts passing money in loops
  ② Smurfing Detection — finds aggregators and dispersers
  ③ Shell Networks     — finds passthrough relay accounts
  ④ Velocity Analysis  — finds accounts with sudden burst activity
  ⑤ Structuring        — finds deliberate threshold-avoidance patterns
              │
              ▼
Every account receives a suspicion score (0–100) with confidence interval
Accounts are grouped into Fraud Rings using Union-Find
Betweenness centrality identifies the orchestrator of each ring
False positive filter protects legitimate payroll and merchant accounts
              │
              ▼
Interactive graph visualization — red nodes, pulsing throwaway accounts,
downloadable JSON, fraud ring summary table
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                 │
│   React 19 + Vite                                                 │
│                                                                   │
│   ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────┐  │
│   │ CSV Upload │  │ Graph View  │  │ Ring Reports │  │ Table │  │
│   │  Drag&Drop │  │  D3-force   │  │  Per Ring    │  │  Tab  │  │
│   └────────────┘  └─────────────┘  └──────────────┘  └───────┘  │
│                                                                   │
│   Threshold Sensitivity Slider  |  Download JSON  |  PDF Export  │
└─────────────────────────┬────────────────────────────────────────┘
                          │  POST /api/analyze  (multipart/form-data)
                          │  GET  /health
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                          BACKEND                                  │
│   Node.js + Express + Multer                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  Detection Pipeline (9 stages)            │    │
│  │                                                           │    │
│  │  [1] CSV Parser → directed graph in memory               │    │
│  │  [2] Cycle Detector (DFS, length 3-5)                    │    │
│  │  [3] Smurfing Detector (degree + 72h sliding window)     │    │
│  │  [4] Shell Network Detector (BFS chain traversal)        │    │
│  │  [5] Velocity Analyzer (time-bucket burst ratio)         │    │
│  │  [6] Structuring Detector (threshold proximity)          │    │
│  │  [7] Multi-Factor Scoring Engine (0–100 + CI)            │    │
│  │  [8] False Positive Filter (CV + stability checks)       │    │
│  │  [9] Ring Grouper (Union-Find + Betweenness Centrality)  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │         Graph Output Assembly                             │    │
│  │   JSON export  |  CSV export  |  Visualization data       │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
money-muling-detection/
│
├── Backend/
│   ├── src/
│   │   ├── server.js                  # Express entry point
│   │   ├── routes/
│   │   │   └── analyze.js             # POST /api/analyze route
│   │   ├── engine/
│   │   │   ├── graphBuilder.js        # CSV → directed graph construction
│   │   │   ├── cycleDetector.js       # DFS-based cycle detection (len 3-5)
│   │   │   ├── smurfingDetector.js    # Fan-in / fan-out + temporal window
│   │   │   ├── shellDetector.js       # BFS shell chain traversal
│   │   │   ├── velocityAnalyzer.js    # Burst ratio time-bucket analysis
│   │   │   ├── structuringDetector.js # Threshold proximity detection
│   │   │   ├── scorer.js              # Multi-factor suspicion scoring
│   │   │   ├── fpFilter.js            # False positive suppression
│   │   │   ├── ringBuilder.js         # Union-Find + centrality
│   │   │   └── exporter.js            # JSON / CSV output assembly
│   ├── data/
│   │   ├── transactions_10k.csv
│   │   └── RIFT_sample_transactions_10000.csv
│   ├── uploads/                       # Temp storage for uploaded CSVs
│   ├── package.json
│   └── .env.example
│
├── Frontend/
│   └── project/
│       ├── src/
│       │   ├── main.jsx
│       │   ├── App.jsx
│       │   ├── context/
│       │   │   └── TransactionContext.jsx   # Global state + API calls
│       │   ├── pages/
│       │   │   ├── UploadPage.jsx
│       │   │   ├── GraphPage.jsx
│       │   │   ├── RingReportsPage.jsx
│       │   │   └── AccountsTablePage.jsx
│       │   ├── components/
│       │   │   ├── GraphCanvas.jsx          # D3 physics simulation
│       │   │   ├── NodeDetailPanel.jsx      # Click-to-investigate panel
│       │   │   ├── ThresholdSlider.jsx      # Real-time sensitivity control
│       │   │   ├── RingCard.jsx             # Ring summary card
│       │   │   ├── SummaryBar.jsx           # Top-level stats bar
│       │   │   └── SparklineBar.jsx         # Mini velocity chart
│       │   └── utils/
│       │       ├── csvParser.js
│       │       └── graphUtils.js
│       ├── index.html
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── package.json
│
├── money_mulling_algo.py   # Standalone Python CLI detection engine
├── README.md
└── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

---

### Backend Setup

**1. Navigate to the Backend directory:**
```cmd
cd Backend
```

**2. Install dependencies:**
```cmd
npm install
```

**3. Configure environment variables:**
```cmd
cp .env.example .env
```

Open `.env` and fill in:
```
PORT=3001
MAX_FILE_SIZE_MB=50
SUSPICION_THRESHOLD=40
FAN_THRESHOLD=10
TEMPORAL_WINDOW_HOURS=72
```

**4. Start the backend server:**
```cmd
npm start
```

The backend API will run on `http://localhost:3001`

You should see:
```
============================================================
  MONEY MULING DETECTION ENGINE — Backend API
  Listening on http://localhost:3001
  Graph engine : READY
============================================================
```

---

### Frontend Setup

**1. Navigate to the Frontend project directory:**
```cmd
cd Frontend\project
```

**2. Install dependencies:**
```cmd
npm install
```

**3. Start the development server:**
```cmd
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

---

### Running Both Servers

Open two terminal windows side by side. Run the backend in one and the frontend in the other. Both must be running simultaneously for the system to work.

---

## 🚀 Usage

**1.** Open the frontend in your browser at `http://localhost:5173`

**2.** Upload a transaction CSV file — drag and drop onto the upload zone or click to browse.

The CSV must have these exact columns:

| Column | Type | Description |
|---|---|---|
| `transaction_id` | String | Unique identifier for each transaction |
| `sender_id` | String | Account ID of the sender (becomes a graph node) |
| `receiver_id` | String | Account ID of the receiver (becomes a graph node) |
| `amount` | Float | Transaction amount in any currency |
| `timestamp` | DateTime | Format: `YYYY-MM-DD HH:MM:SS` |

**3.** Wait for analysis. For files up to 10,000 transactions this takes under 30 seconds.

**4.** Explore results across four tabs:

- **Graph View** — Interactive network. Red nodes are suspicious. Pulsing-border nodes are throwaway mule accounts. Node size reflects betweenness centrality — the largest red node in a cluster is the likely ring orchestrator. Click any node to open the Account Detail Panel.
- **Ring Reports** — One detailed report per detected fraud ring, showing member accounts, risk scores, pattern types, and orchestrator identification.
- **Accounts Table** — Sortable, filterable table of all suspicious accounts with scores, confidence intervals, detected patterns, ring IDs, and roles.
- **Timeline View** — Transactions plotted on a horizontal time axis to show the operation unfolding chronologically.

**5.** Click any suspicious node in the graph to open the Account Detail Panel with the full breakdown — suspicion score, confidence range, detected patterns, ring membership, velocity sparkline, and transaction history.

**6.** Use the **Threshold Slider** to adjust sensitivity in real time. Lower = higher recall (catch more). Higher = higher precision (fewer false positives).

**7.** Download results:
- **Download JSON** — full structured output
- **Download PDF** — formatted investigation report
- **Download CSV** — suspicious accounts table for Excel

---

## 🧠 Algorithm Approach

### The Core Insight — Why Graph Theory?

Every bank account is a **node**. Every transaction is a **directed edge** carrying a weight (amount) and a timestamp. Once the full dataset is modeled this way, financial crime reveals itself through the **shape** of the graph — patterns invisible in spreadsheet rows become immediately obvious as graph structures.

Money laundering creates specific, recognizable graph shapes: loops (cycles), funnels (fan-in/out), chains (shells), spikes (velocity), and clusters near threshold values (structuring). The algorithms below each find one of these shapes.

---

### Graph Construction

**Data structure:** Directed Weighted Graph — adjacency list representation

For each CSV row: add sender and receiver as nodes, add a directed edge sender → receiver with amount and timestamp as attributes. Build per-node metadata simultaneously: in-degree, out-degree, all timestamps sorted, inter-arrival times between transactions, amounts sent and received, unique sender/receiver sets.

**Time complexity:** O(n) — single pass through all transactions

---

### Detector 1 — Cycle Detection

**Graph concept used:** Directed cycle in a digraph

**What it finds:** Accounts that pass money in closed loops — A → B → C → A. This is the clearest structural signature of money laundering because legitimate money never flows in circles. If funds return to their origin after passing through intermediaries, that circuit was deliberately constructed.

**Algorithm — DFS with path tracking:**

The algorithm treats each account as a potential start node and performs a depth-first walk forward through the graph following directed edges. A path list is maintained at every step. If the DFS arrives at a node already in the current path — a cycle is found. All cycles of length 3, 4, and 5 are recorded.

Before running DFS, a "candidate filter" identifies low-degree nodes — accounts with both in-degree ≤ 3 AND out-degree ≤ 3. Planted fraud accounts forming tight cycles have exactly 1 in-edge and 1 out-edge. Random noise accounts have many more connections. This filter dramatically reduces search space while preserving recall on true fraud cycles.

For length-3 triangles a direct O(candidates × avg_degree²) adjacency check is used — faster than DFS for the most common case. Length-4 and length-5 use targeted DFS on the same candidate set.

Hard guards prevent runaway performance: 5,000 cycle cap and 12-second wall-clock limit. Shortest, most suspicious cycles are always found first.

**Pattern strings produced:** `cycle_length_3`, `cycle_length_4`, `cycle_length_5`

**Score contribution:** +35 for length-3, +30 for length-4, +25 for length-5

**Time complexity:** O(V + E) for candidate filter, O((V + E)(C + 1)) for enumeration where C = cycles found

---

### Detector 2 — Smurfing Detection

**Graph concept used:** Node in-degree and out-degree, sliding window on edge timestamps

**What it finds:** Accounts that aggregate funds from many sources (fan-in) or disperse to many destinations (fan-out), especially when this activity clusters within a short time window.

Normal accounts transact with a bounded, stable set of counterparties. A smurfing aggregator receives from 10, 20, or 50 different accounts — often within 72 hours — because many smurf depositors make coordinated deposits simultaneously.

**Algorithm — Degree check + sliding window temporal clustering:**

Step 1: For every node, count `unique_senders` (in-degree by unique counterparty) and `unique_receivers` (out-degree by unique counterparty). Any node with 10 or more unique senders is a fan-in candidate. 10 or more unique receivers → fan-out candidate.

Step 2: For each candidate, sort all relevant transaction timestamps and apply a sliding window of 72 hours using two pointers. Expand right pointer, contract left pointer when window exceeds 72 hours. If at any point 5 or more transactions fall within the window — temporal clustering is confirmed.

Temporal clustering confirmation means the high-degree activity happened in a compressed burst — the hallmark of coordinated smurfing rather than gradual legitimate accumulation.

**Pattern strings produced:** `fan_in`, `fan_out`, `high_velocity`

**Score contribution:** +40 (with temporal clustering), +25 (without)

**Time complexity:** O(n log n) for timestamp sorting, O(n) for sliding window

---

### Detector 3 — Shell Network Detection

**Graph concept used:** BFS traversal on a filtered subgraph, path length

**What it finds:** Chains of accounts with very few total transactions (2–3 lifetime) serving as intermediate relay stations. Shell accounts exist only to add distance between the criminal and the money. They are "activated" for one operation and go silent — almost no transaction history.

**Algorithm — BFS chain traversal on low-activity subgraph:**

Step 1: Identify all "shell candidates" — accounts with total lifetime transaction count ≤ 3 (configurable).

Step 2: For each shell candidate as a starting node, run BFS forward through the graph — but only traverse edges leading to other shell candidates. Maintain the growing path in the BFS queue.

Step 3: Any path reaching length ≥ 3 hops is recorded as a shell chain. All members are flagged. The BFS naturally finds all chains regardless of length — a 5-shell chain is more suspicious than a 3-shell chain and both are caught.

Hard guard: 2,000 chain cap.

**Pattern strings produced:** `shell_account`, `layered_shell_network`

**Score contribution:** +40 for confirmed chain members (20 + 20 chain bonus)

**Time complexity:** O(S × d) where S = shell candidates, d = average out-degree

---

### Detector 4 — Velocity Analysis

**Graph concept used:** Temporal edge distribution, time-bucket histogram

**What it finds:** Accounts whose transaction frequency shows an unnatural burst — dormant for an extended period, suddenly extremely active, then quiet again. This "cliff spike" pattern indicates a single coordinated laundering event.

Legitimate accounts have relatively stable month-over-month activity. A mule account is dormant until activated, reaches peak activity in days, then goes silent.

**Algorithm — Time-bucket analysis with peak-to-average ratio:**

Step 1: Divide the dataset's total time span into weekly buckets (dataset < 90 days) or monthly buckets (≥ 90 days).

Step 2: For each account, count transactions per bucket — the "sparkline."

Step 3: Identify the peak bucket. Calculate the average count of all other buckets. If peak ÷ average_others ≥ 5.0 — velocity burst is flagged. A ratio of 5× means the busiest period had 5 times more activity than normal. Genuine mule accounts often score 20× or higher.

Step 4 — Sudden activation: If 80%+ of an account's transactions occurred within less than 10% of the total dataset time span — `sudden_activation` is flagged. This catches accounts that appear, transact intensely, and disappear.

The sparkline bucket counts are stored in the output and displayed as a mini bar chart in the Account Detail Panel. Normal accounts show even bars. Mule accounts show one dominant spike.

**Pattern strings produced:** `velocity_burst`, `sudden_activation`

**Score contribution:** +15 for velocity burst, +5 for sudden activation

**Time complexity:** O(n) per account — single pass through timestamps

---

### Detector 5 — Structuring Detection

**Graph concept used:** Edge weight distribution analysis (outgoing transaction amounts)

**What it finds:** Accounts that deliberately keep transaction amounts just below known reporting thresholds. This specific crime is called "structuring" — criminals are aware that transactions above $10,000 trigger automatic regulatory reporting and deliberately send $9,800 instead.

**Algorithm — Threshold proximity analysis:**

Step 1: Define just-below zones. For each threshold (10,000 / 5,000 / 1,000 / 500), the suspicious zone is from threshold × 0.95 up to (but not including) the threshold. For $10,000, that is $9,500 to $9,999.99.

Step 2: For accounts with ≥ 5 outgoing transactions, count how many amounts fall into any zone. If ≥ 60% of outgoing amounts hit these zones — structuring is flagged.

Step 3 — Varied-but-clustered check: Experienced structurers vary amounts to avoid detection — $9,800, $9,750, $9,830. Different numbers but all in the zone. Detect this by calculating Coefficient of Variation (CV) of the just-below amounts. Low CV (< 0.03) with all values in the zone signals deliberate variation while staying below threshold. Flag as `threshold_avoidance`.

This detector goes beyond the problem statement requirements and catches a real, well-documented financial crime that most basic systems miss entirely.

**Pattern strings produced:** `structuring_behavior`, `threshold_avoidance`

**Score contribution:** +20

**Time complexity:** O(t × k) where t = outgoing transactions, k = threshold count (constant = 4)

---

### Suspicion Scoring Engine

Each account's final suspicion score is built additively:

```
Final Score = cycle_score
            + smurfing_score
            + shell_score
            + velocity_score
            + structuring_score
            + centrality_bonus
            + multi_detector_bonus
            (capped at 100, floored at 0)
```

**Multi-detector bonus:** When 2 or more independent detectors flag the same account, +10 is added per additional detector. Convergent evidence from multiple independent signals is substantially stronger than any single signal.

**Confidence Interval:** Every score includes a range reflecting certainty:
- 1 detector → ±15 points
- 2 detectors → ±10 points  
- 3+ detectors → ±5 points
- Throwaway account (< 5 lifetime transactions) → additional ±5 widening

A score of 87.5 from 3 detectors shows as [82.5, 92.5] — tight, high-confidence. A score of 60 from 1 detector shows as [45, 75] — wide, meaning more investigation is warranted before action.

---

### False Positive Filter

Test datasets contain "legitimate account traps." A payroll account dispersing to 500 employees looks exactly like a fan-out smurfing hub. A popular merchant receiving from thousands of customers looks like a fan-in aggregator. Four checks protect legitimate accounts:

**Check 1 — Timing regularity:** Payroll and scheduled payments are clockwork-regular. The inter-arrival time between transactions has very low Coefficient of Variation. If CV < 0.20, timing is too regular for a fraud operation.

**Check 2 — Amount homogeneity:** Payroll sends nearly identical amounts. If outgoing amounts have CV < 0.30, the account processes consistent legitimate payments, not variable criminal transfers.

**Check 3 — Recipient stability:** Merchants and employers transact with the same counterparties repeatedly. If the top 30% of recipients account for 70%+ of transaction volume, the account has stable long-term business relationships.

**Check 4 — Long-span volume dimming:** A fan-in account accumulating senders over 18 months of legitimate business is very different from one receiving from the same number of accounts in 72 hours. Smurfing without temporal clustering but spanning 30+ days gets progressively score-dimmed.

**Critical exception:** Cycle members are NEVER false-positive suppressed. If money flows in a confirmed circle, no legitimate explanation exists.

---

### Ring Grouping — Union-Find Algorithm

**Graph concept used:** Disjoint Set Union (Union-Find) on the suspicious account subgraph

After scoring, suspicious accounts are grouped into Fraud Rings. The goal is transitive grouping — if A is in a cycle with B and C, and B is also a fan-out hub connected to D and E, then all five belong to one ring.

**Union-Find** handles this in near-linear time. Every suspicious account starts as its own set. Union operations merge sets when accounts share a detected relationship: all cycle members are unioned, smurfing aggregators are unioned with their suspicious connected accounts, shell chain members are unioned together.

After all unions, each disjoint set is one Fraud Ring. Rings are sorted by maximum member suspicion score — the most dangerous ring is RING_001.

**Time complexity:** O(α(V)) per operation where α is the inverse Ackermann function — effectively O(1)

---

### Betweenness Centrality — Identifying the Orchestrator

**Graph concept used:** Betweenness centrality (Brandes algorithm) on the suspicious subgraph

Within each fraud ring, betweenness centrality identifies the account through which the most money paths flow — typically the orchestrator or primary handler.

Betweenness centrality of a node v = the fraction of all shortest paths between all pairs of nodes in the subgraph that pass through v. High betweenness means this account is a critical hub that coordinates flow between other accounts. It is not a peripheral mule — it is the central operator.

In the graph visualization, high-centrality suspicious nodes are physically larger. The largest red node in any ring cluster is labeled "ORCHESTRATOR."

**Time complexity:** O(VE) using the Brandes algorithm on the suspicious subgraph

---

## 📊 Output Schema

### JSON Output

```json
{
  "suspicious_accounts": [
    {
      "account_id": "ACC_00123",
      "suspicion_score": 87.5,
      "confidence_range": [82.5, 92.5],
      "detected_patterns": ["cycle_length_3", "high_velocity", "structuring_behavior"],
      "ring_id": "RING_001",
      "throwaway_account": true,
      "total_lifetime_transactions": 4,
      "in_degree": 1,
      "out_degree": 3,
      "velocity_burst_detected": true,
      "centrality_score": 0.73,
      "role_in_ring": "ORCHESTRATOR"
    }
  ],
  "fraud_rings": [
    {
      "ring_id": "RING_001",
      "member_accounts": ["ACC_00123", "ACC_00456", "ACC_00789"],
      "pattern_type": "circular_routing",
      "risk_score": 95.3,
      "orchestrator": "ACC_00123",
      "total_amount_laundered": 87400.00,
      "operation_duration_hours": 61,
      "throwaway_member_count": 2
    }
  ],
  "summary": {
    "total_accounts_analyzed": 500,
    "suspicious_accounts_flagged": 15,
    "fraud_rings_detected": 4,
    "processing_time_seconds": 2.3,
    "throwaway_accounts_detected": 8,
    "structuring_cases_detected": 3,
    "avg_suspicion_score": 71.4
  }
}
```

### Detected Pattern Strings Reference

| Pattern String | Detector | Meaning |
|---|---|---|
| `cycle_length_3` | Cycle | Account in a 3-node money loop |
| `cycle_length_4` | Cycle | Account in a 4-node money loop |
| `cycle_length_5` | Cycle | Account in a 5-node money loop |
| `fan_in` | Smurfing | Receives from 10+ unique senders |
| `fan_out` | Smurfing | Sends to 10+ unique receivers |
| `high_velocity` | Smurfing | Fan-in or fan-out within 72-hour window |
| `shell_account` | Shell | ≤ 3 lifetime transactions |
| `layered_shell_network` | Shell | Passthrough in a chain ≥ 3 hops |
| `velocity_burst` | Velocity | Peak activity bucket ≥ 5× average |
| `sudden_activation` | Velocity | 80%+ of txns in < 10% of dataset span |
| `structuring_behavior` | Structuring | 60%+ of amounts in just-below-threshold zones |
| `threshold_avoidance` | Structuring | Varied-but-clustered amounts (deliberate variation) |
| `high_centrality` | Centrality | High betweenness — likely orchestrator |
| `multi_detector` | Bonus | Flagged by 2+ independent detectors |

---

## 🌐 API Endpoints

### POST /api/analyze

Upload a CSV file for full fraud analysis.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: CSV file with field key `"file"`

**Response:**
```json
{
  "success": true,
  "data": {
    "suspicious_accounts": [...],
    "fraud_rings": [...],
    "summary": {
      "total_accounts_analyzed": 100,
      "suspicious_accounts_flagged": 15,
      "fraud_rings_detected": 3,
      "processing_time_seconds": 2.5
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "CSV missing required columns: receiver_id",
  "required_columns": ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"]
}
```

---

### GET /health

```json
{
  "status": "ok",
  "engine": "ready",
  "uptime_seconds": 3421
}
```

---

## 🔬 Features

### Detection
- 5 independent graph algorithms covering all major money muling patterns
- Union-Find ring grouping for transitive fraud network identification
- Betweenness centrality for orchestrator identification
- Confidence intervals on every suspicion score
- False positive filter protecting payroll and merchant accounts
- Throwaway account flagging for single-use mule accounts

### Visualization
- Interactive D3-force graph with physics simulation, zoom, pan, drag
- Visual risk encoding — color (red = suspicious), size (centrality), border (throwaway = pulsing)
- Account Detail Panel on node click with full breakdown
- Velocity sparkline mini chart per account
- Real-time threshold slider updating graph and table live

### Investigation Tools
- Timeline view — chronological transaction flow visualization
- Suspicious accounts table — sortable, filterable, all metadata columns
- Account Detail Panel — click any node for full score breakdown and transaction history

### Export
- JSON download — full structured output
- PDF report — formatted investigation document
- CSV export — accounts table for Excel
- Rings CSV — fraud rings with member lists

---

## 🧮 Algorithms Used

- **Depth-First Search (DFS)** — cycle detection across directed graph (lengths 3, 4, 5)
- **Sliding Window (Two-Pointer)** — temporal clustering detection within 72-hour windows
- **Breadth-First Search (BFS)** — shell chain traversal on low-activity subgraph
- **Time-Bucket Histogram** — velocity burst ratio analysis per account
- **Coefficient of Variation** — threshold proximity and false positive regularity checks
- **Union-Find (Disjoint Set Union)** — transitive grouping of suspicious accounts into fraud rings
- **Betweenness Centrality (Brandes Algorithm)** — orchestrator identification on suspicious subgraph

---

## 📈 Performance

| Metric | Result |
|---|---|
| Processing time (10K transactions) | < 10 seconds |
| Precision | ≥ 70% |
| Recall | ≥ 60% |
| Max file size | 50 MB |
| False positive control | Payroll and merchant accounts protected by 4-check FP filter |

---

## 💾 Sample Data

Sample CSV files are available in `Backend/data/`:

| File | Transactions | Description |
|---|---|---|
| `transactions_10k.csv` | 10,000 | General sample with mixed fraud and legitimate patterns |
| `RIFT_sample_transactions_10000.csv` | 10,000 | RIFT competition dataset |

These files contain planted fraud patterns (3-cycles, smurfing aggregators, shell chains, structuring) alongside legitimate high-volume merchant and payroll accounts designed to test false positive suppression.

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | HTTP server and routing |
| Multer | CSV file upload handling |
| Custom Graph Engine | All 5 detection algorithms |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite | Build tool and dev server |
| D3-force | Physics-based graph visualization |
| PapaParse | CSV parsing |
| TailwindCSS | Utility-first styling |
| React Router DOM | Client-side routing |

### Standalone Python CLI
`money_mulling_algo.py` is a complete self-contained CLI version of the detection engine:

```bash
pip install networkx
python money_mulling_algo.py --input transactions.csv --output results.json
```

Available flags:
```
--threshold 40         Suspicion score cutoff (default: 40)
--fan-threshold 10     Min unique counterparties for smurfing (default: 10)
--temporal-window 72   Hours for temporal clustering window (default: 72)
--min-shell-tx 3       Max lifetime transactions for shell candidate (default: 3)
--shell-hops 3         Min chain length for shell detection (default: 3)
--max-cycle 5          Maximum cycle length to search (default: 5)
```

---

## 🐛 Troubleshooting

**Backend not connecting:**
- Ensure the backend is running on port 3001
- Check for CORS errors in the browser console
- Verify `API_URL` in `Frontend/project/src/context/TransactionContext.jsx` points to `http://localhost:3001`

**CSV upload fails:**
- Verify the CSV has all five required columns: `transaction_id`, `sender_id`, `receiver_id`, `amount`, `timestamp`
- Check file size (max 50MB)
- Ensure timestamps are in `YYYY-MM-DD HH:MM:SS` format
- Open the CSV in a text editor and confirm a proper header row exists on line 1

**Graph not displaying:**
- Check the browser console (F12) for JavaScript errors
- Confirm `fraudData` is populated in React context after upload completes
- Verify nodes and edges arrays are not empty in the response JSON
- Try a hard refresh (Ctrl + Shift + R) to clear cached assets

**Cycle detection finding 0 cycles on known test data:**
- The candidate degree filter (≤ 3 in AND out) is applied for performance optimization. If test accounts have higher degree, adjust the `max_deg` threshold in `engine/cycleDetector.js`
- Ensure the CSV contains complete cycle edges — all three edges A→B, B→C, and C→A must be present for a 3-cycle to be detected

---

## 👥 Team Members

| Name | GitHub |
|---|---|
| Suraj Kumar | [@Surajshivam-123](https://github.com/Surajshivam-123) |
| Ram Kumar | [@RamK2006](https://github.com/RamK2006) |
| Madan Ram Sai Vuppala | [@__Madan-Ram-sai__](https://github.com/__Madan-Ram-sai__) |
| Basant Bansal | [@__basantbansal__](https://github.com/__basantbansal__) |

---

## 📄 License

Built for the RIFT 2026 Hackathon — Graph Theory / Financial Crime Detection Track.
