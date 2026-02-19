make javascript files which takes input in the format of csv like

Column Name Data Type Description

transaction_id  String  Unique transaction identifier

sender_id         String   Account ID of sender (becomes a node)

receiver_id       String   Account ID of receiver (becomes a node)

amount            Float     Transaction amount in currency units

timestamp     DateTime  Format: YYYY-MM-DD HH:MM:SS

Provide output in the format of JSON file

{ "suspicious_accounts": [

    { "account_id": "ACC_00123", "suspicion_score": 87.5,

      "detected_patterns": ["cycle_length_3", "high_velocity"],

      "ring_id": "RING_001" } ],

  "fraud_rings": [

    { "ring_id": "RING_001", "member_accounts": ["ACC_00123", ...],

      "pattern_type": "cycle", "risk_score": 95.3 } ],

  "summary": { "total_accounts_analyzed": 500,

    "suspicious_accounts_flagged": 15, "fraud_rings_detected": 4,

    "processing_time_seconds": 2.3 }

}



where

suspicious_accounts Array-Every account your algorithm decided is suspicious gets one entry here

account_id:-unique identifier of the account node from the CSV'

suspicion_score:-A number from 0 to 100 representing how confident your system is that this account is involved in financial crim .

suspicion_accounts must be sorted in descending order

detected-patterns :identified patterns must be must be one of the following 

1.cycle_length_n-algorithm will found out length of cycle.

2.high_velocity_fan_out-One sender → 10+ receivers in 72hr window

3.high_velocity_fan_in-10+ senders → one receiver in 72hr window

4.shell_account-if node whose total transactions is less than 3 and one of intermediate node in the chain

5.rapid-passthrough:-If received funds and forwarded within hours

ring_id:this is list of id of pattern or ring in which given account is considered as fraud it links this account entry to an entry in the fraud_rings array below.

fraud_rings Array-This is your per-subgraph verdict list. Where suspicious_accounts describes individual nodes, fraud_rings describes the connected criminal structure those nodes form together.

ring id:unique id for the detected-pattern

member_accounts-accounts involved in this pattern

pattern-type:-

1.cycle-Ring was detected because money flows in a loop

2.smurfing-Ring was detected via fan-in or fan-out patterns

3.shell-chain-Ring was detected via layered intermediate accounts

4.hybrid-Ring exhibits multiple pattern types simultaneously

risk_score-ring-level risk score, aggregated from the individual suspicion scores of all member accounts.

ring_risk = (0.6 × max_member_score) + (0.4 × avg_member_score) × size_multiplier





and last thing summary": { "total_accounts_analyzed": 500,

    "suspicious_accounts_flagged": 15, "fraud_rings_detected": 4,

    "processing_time_seconds": 2.3 }

will give summary about details



Careful calculation of suspicion score
suspicion score is a weighted aggregate of multiple signals detected during graph analysis. Each signal contributes points, and the final score is normalized to 0–100.
Use this formula to calculate Suspicion-Score=suspicion_score = Σ(signal_weight × signal_intensity) — penalties

Step 1 — Signals You Extract From Graph Analysis
For each account node, after running your algorithms, you collect these raw signals:
Signal A: Cycle Membership
javascript// From your DFS/Tarjan cycle detection
{
  in_cycle: true/false,
  cycle_length: 3,          // 3, 4, or 5
  cycle_count: 2            // how many cycles this node appears in
}
Signal B: Smurfing (Fan-in / Fan-out)
javascript{
  fan_out_degree: 15,       // unique receivers
  fan_in_degree: 3,         // unique senders
  temporal_fan_out: 12,     // unique receivers within 72hr window
  temporal_fan_in: 8        // unique senders within 72hr window
}
Signal C: Shell Account Role
javascript{
  total_transactions: 2,    // very low count
  is_intermediate: true,    // sits between two other accounts in a chain
  chain_length: 4           // how long the chain is
}
Signal D: Transaction Behavior
javascript{
  round_number_ratio: 0.85, // % of txns with round amounts (1000, 5000, etc.)
  amount_variance: 0.02,    // low variance = structuring/smurfing
  avg_amount: 9500,         // just under reporting thresholds
  rapid_passthrough: true   // receives money and sends it out within hours
}
Signal E: Network Centrality
javascript{
  betweenness_centrality: 0.73,  // how often node sits on shortest paths
  in_degree: 12,
  out_degree: 14
}

Step 2 — Score Each Signal (0 to Max Points)
SignalConditionPointsCycle membershipIn a cycle of length 340In a cycle of length 432In a cycle of length 525In 2+ cycles+10 bonusFan-out smurfing10–19 receivers in 72hr1520+ receivers in 72hr22Fan-in smurfing10–19 senders in 72hr1520+ senders in 72hr22Shell account≤3 txns AND intermediate15Chain length ≥ 4+5 bonusRound numbers>70% round transactions8Rapid passthroughSends within 6hr of receiving10Below thresholdAvg amount 9000–99998High centralityBetweenness > 0.55

Step 3 — Apply Penalties (False Positive Control)
javascriptfunction calculatePenalties(account) {
  let penalty = 0;

  // Legitimate merchant: high volume but not in any cycle
  if (account.fan_out_degree > 50 && !account.in_cycle) {
    penalty += 25; // probably a retailer
  }

  // Payroll pattern: high fan-out but transactions cluster on same weekday/month-end
  if (isPayrollPattern(account.transactions)) {
    penalty += 30;
  }

  // High diversity ratio: sends to many UNIQUE people (retail, not laundering)
  const diversityRatio = account.unique_counterparties / account.total_transactions;
  if (diversityRatio > 0.85 && !account.in_cycle) {
    penalty += 20;
  }

  // Established account: very old account with consistent long history
  if (account.transaction_span_days > 365 && account.amount_variance > 0.5) {
    penalty += 10;
  }

  return penalty;
}

Step 4 — Combine Into Final Score
javascriptfunction calculateSuspicionScore(account) {
  let raw = 0;

  // === CYCLE SIGNALS ===
  if (account.in_cycle) {
    const cyclePoints = { 3: 40, 4: 32, 5: 25 };
    raw += cyclePoints[account.cycle_length] || 20;
    if (account.cycle_count >= 2) raw += 10;
  }

  // === SMURFING SIGNALS ===
  if (account.temporal_fan_out >= 20) raw += 22;
  else if (account.temporal_fan_out >= 10) raw += 15;

  if (account.temporal_fan_in >= 20) raw += 22;
  else if (account.temporal_fan_in >= 10) raw += 15;

  // === SHELL SIGNALS ===
  if (account.total_transactions <= 3 && account.is_intermediate) {
    raw += 15;
    if (account.chain_length >= 4) raw += 5;
  }

  // === BEHAVIORAL SIGNALS ===
  if (account.round_number_ratio > 0.7) raw += 8;
  if (account.rapid_passthrough) raw += 10;
  if (account.avg_amount >= 9000 && account.avg_amount < 10000) raw += 8;
  if (account.betweenness_centrality > 0.5) raw += 5;

  // === PENALTIES ===
  raw -= calculatePenalties(account);

  // === NORMALIZE TO 0–100 ===
  // Max possible raw score ≈ 130 (all signals triggered)
  const MAX_RAW = 130;
  const normalized = (raw / MAX_RAW) * 100;

  return Math.min(100, Math.max(0, parseFloat(normalized.toFixed(1))));
}

Step 5 — Detected Patterns Array
Build the detected_patterns field based on which signals fired:
javascriptfunction getDetectedPatterns(account) {
  const patterns = [];

  if (account.in_cycle) {
    patterns.push(`cycle_length_${account.cycle_length}`);
  }
  if (account.temporal_fan_out >= 10) {
    patterns.push("high_velocity_fan_out");
  }
  if (account.temporal_fan_in >= 10) {
    patterns.push("high_velocity_fan_in");
  }
  if (account.total_transactions <= 3 && account.is_intermediate) {
    patterns.push("shell_account");
  }
  if (account.rapid_passthrough) {
    patterns.push("rapid_passthrough");
  }
  if (account.round_number_ratio > 0.7) {
    patterns.push("structuring");
  }
  if (account.avg_amount >= 9000 && account.avg_amount < 10000) {
    patterns.push("threshold_avoidance");
  }

  return patterns;
}

Step 6 — Ring Risk Score
The ring-level risk score aggregates member scores:
javascriptfunction calculateRingRiskScore(ring) {
  const memberScores = ring.members.map(id => accounts[id].suspicion_score);

  const avg = memberScores.reduce((a, b) => a + b, 0) / memberScores.length;
  const max = Math.max(...memberScores);
  const completeness = ring.members.length >= 3 ? 1.1 : 1.0; // bonus for larger rings

  // Weighted: 60% max member score + 40% average
  const ringScore = ((0.6 * max) + (0.4 * avg)) * completeness;

  return Math.min(100, parseFloat(ringScore.toFixed(1)));
}
```

---

## Visual Summary
```
Account Node
    │
    ├── Cycle detected?        → +25 to +40 pts
    ├── Smurfing (72hr)?       → +15 to +22 pts
    ├── Shell role?            → +15 to +20 pts
    ├── Behavioral signals?    → +5 to +26 pts
    │
    ├── Payroll pattern?       → -30 pts
    ├── Legitimate merchant?   → -25 pts
    └── High diversity ratio?  → -20 pts
                                   │
                              Normalize 0–100
                                   │
                           suspicion_score: 87.5
