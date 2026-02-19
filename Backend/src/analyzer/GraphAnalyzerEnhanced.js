/**
 * Enhanced Graph Analyzer with Advanced Fraud Detection
 * 
 * Detection Features:
 * 1. Velocity-based anomaly detection
 * 2. Amount-based anomaly detection (statistical outliers)
 * 3. Time-based pattern analysis (unusual hours)
 * 4. Network centrality scoring (PageRank-like)
 * 5. Transaction frequency analysis
 * 6. Burst detection (sudden activity spikes)
 * 7. Dormancy detection (inactive then suddenly active)
 * 8. Cross-account correlation
 * 9. Amount splitting detection
 * 10. Geographic velocity (if location data available)
 * 11. Round-trip transactions (A→B→A patterns)
 * 12. Layering depth analysis (transaction chain complexity)
 * 13. Counterparty diversity (transaction partner patterns)
 * 14. Amount progression patterns (escalating/de-escalating)
 * 15. Temporal clustering (transactions at specific times)
 * 
 * Performance: O(V + E) for most operations
 * Space: O(V + E) - minimal overhead
 */

export class GraphAnalyzerEnhanced {
  constructor(transactionGraph, options = {}) {
    this.graph = transactionGraph;
    this.options = options;
    this.cache = {
      centrality: null,
      statistics: null,
      timePatterns: null
    };
  }

  /**
   * Run all enhanced fraud detection algorithms
   * @returns {Object} All detected patterns
   */
  detectAllPatterns() {
    const startTime = Date.now();
    
    // Calculate statistics once for all accounts
    this._calculateStatistics();
    
    console.log('Pattern detection: Cycles...');
    const cycles = this.detectCyclesEfficient();
    
    console.log('Pattern detection: Fan-out/Fan-in...');
    const fanOut = this.detectFanOutPatterns();
    const fanIn = this.detectFanInPatterns();
    
    console.log('Pattern detection: Shell accounts...');
    const shellAccounts = this.detectShellAccounts();
    
    console.log('Pattern detection: Passthrough...');
    const passthrough = this.detectPassthroughBehavior();
    
    console.log('Pattern detection: Structuring & Threshold...');
    const structuring = this.detectStructuring();
    const thresholdAvoidance = this.detectThresholdAvoidance();
    
    console.log('Pattern detection: Enhanced patterns...');
    const velocityAnomalies = this.detectVelocityAnomalies();
    const amountAnomalies = this.detectAmountAnomalies();
    const unusualTiming = this.detectUnusualTiming();
    const burstActivity = this.detectBurstActivity();
    const dormancyReactivation = this.detectDormancyReactivation();
    const amountSplitting = this.detectAmountSplitting();
    const frequencyAnomalies = this.detectFrequencyAnomalies();
    const networkInfluence = this.calculateNetworkInfluence();
    
    console.log('Pattern detection: Advanced patterns...');
    const roundTripTransactions = this.detectRoundTripTransactionsOptimized();
    const layeringDepth = this.analyzeLayeringDepth();
    const counterpartyDiversity = this.analyzeCounterpartyDiversity();
    const amountProgression = this.detectAmountProgression();
    const temporalClustering = this.detectTemporalClustering();
    
    console.log('Pattern detection: Deep analysis (high-evidence)...');
    // Note: Money laundering chains disabled by default due to high memory usage
    // Enable with options.enableDeepChainAnalysis = true
    const moneyLaunderingChains = this.options?.enableDeepChainAnalysis 
      ? this.detectMoneyLaunderingChains() 
      : new Map();
    const coordinatedBehavior = this.detectCoordinatedBehavior();
    const smurfingPatterns = this.detectSmurfingPatterns();
    const washTrading = this.detectWashTrading();
    
    console.log('Pattern detection: Louvain community detection...');
    const smurfingRingsLouvain = this.detectSmurfingRingsLouvain();
    
    const patterns = {
      // Original patterns (optimized)
      cycles,
      fanOut,
      fanIn,
      shellAccounts,
      passthrough,
      structuring,
      thresholdAvoidance,
      
      // Enhanced patterns (new)
      velocityAnomalies,
      amountAnomalies,
      unusualTiming,
      burstActivity,
      dormancyReactivation,
      amountSplitting,
      frequencyAnomalies,
      networkInfluence,
      
      // Additional advanced patterns
      roundTripTransactions,
      layeringDepth,
      counterpartyDiversity,
      amountProgression,
      temporalClustering,
      
      // Deep analysis patterns (high-evidence)
      moneyLaunderingChains,
      coordinatedBehavior,
      smurfingPatterns,
      washTrading,
      
      // Louvain community detection (industry-standard)
      smurfingRingsLouvain
    };
    
    const endTime = Date.now();
    console.log(`Pattern detection completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
    
    return patterns;
  }


  /**
   * Calculate global statistics for anomaly detection
   * @private
   */
  _calculateStatistics() {
    if (this.cache.statistics) return this.cache.statistics;
    
    const accounts = this.graph.getAllAccounts();
    const allAmounts = [];
    const allTimestamps = [];
    const accountActivity = new Map();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      accountActivity.set(accountId, txs.length);
      
      for (const tx of txs) {
        allAmounts.push(tx.amount);
        allTimestamps.push(tx.timestamp);
      }
    }
    
    // Calculate statistics
    allAmounts.sort((a, b) => a - b);
    const mean = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length;
    const variance = allAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allAmounts.length;
    const stdDev = Math.sqrt(variance);
    
    this.cache.statistics = {
      amountMean: mean,
      amountStdDev: stdDev,
      amountMedian: allAmounts[Math.floor(allAmounts.length / 2)],
      amountQ1: allAmounts[Math.floor(allAmounts.length * 0.25)],
      amountQ3: allAmounts[Math.floor(allAmounts.length * 0.75)],
      totalTransactions: allAmounts.length,
      accountActivity: accountActivity,
      timeRange: {
        min: new Date(Math.min(...allTimestamps)),
        max: new Date(Math.max(...allTimestamps))
      }
    };
    
    return this.cache.statistics;
  }

  /**
   * Detect velocity anomalies (too many transactions too quickly)
   * More sophisticated than simple fan-in/fan-out
   */
  detectVelocityAnomalies() {
    const anomalies = new Map();
    const accounts = this.graph.getAllAccounts();
    const VELOCITY_WINDOWS = [1, 6, 24, 72]; // hours
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);
      
      if (outgoing.length + incoming.length < 10) continue; // Increased threshold
      
      const allTxs = [...outgoing, ...incoming].sort((a, b) => a.timestamp - b.timestamp);
      
      let maxVelocity = 0;
      let anomalyWindow = null;
      
      // Check each time window
      for (const windowHours of VELOCITY_WINDOWS) {
        for (let i = 0; i < allTxs.length; i++) {
          const windowStart = allTxs[i].timestamp;
          const windowEnd = new Date(windowStart.getTime() + windowHours * 3600000);
          
          let txCount = 0;
          let totalAmount = 0;
          
          for (let j = i; j < allTxs.length && allTxs[j].timestamp <= windowEnd; j++) {
            txCount++;
            totalAmount += allTxs[j].amount;
          }
          
          const velocity = txCount / windowHours; // transactions per hour
          
          if (velocity > maxVelocity) {
            maxVelocity = velocity;
            anomalyWindow = {
              windowHours,
              txCount,
              totalAmount,
              velocity: velocity.toFixed(2)
            };
          }
        }
      }
      
      // Flag if velocity exceeds threshold (increased from 2 to 5)
      if (maxVelocity > 5) { // More than 5 transactions per hour sustained
        anomalies.set(accountId, anomalyWindow);
      }
    }
    
    return anomalies;
  }

  /**
   * Detect amount anomalies using statistical methods
   * Identifies transactions that are statistical outliers
   */
  detectAmountAnomalies() {
    const anomalies = new Map();
    const accounts = this.graph.getAllAccounts();
    const stats = this.cache.statistics;
    
    // Calculate IQR for outlier detection
    const iqr = stats.amountQ3 - stats.amountQ1;
    const lowerBound = stats.amountQ1 - 1.5 * iqr;
    const upperBound = stats.amountQ3 + 1.5 * iqr;
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      if (txs.length === 0) continue;
      
      const outliers = txs.filter(tx => 
        tx.amount < lowerBound || tx.amount > upperBound
      );
      
      if (outliers.length > 0) {
        const outlierRatio = outliers.length / txs.length;
        
        if (outlierRatio > 0.3) { // More than 30% are outliers
          anomalies.set(accountId, {
            outlierCount: outliers.length,
            totalCount: txs.length,
            outlierRatio: outlierRatio.toFixed(2),
            maxOutlier: Math.max(...outliers.map(tx => tx.amount)),
            minOutlier: Math.min(...outliers.map(tx => tx.amount))
          });
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Detect unusual timing patterns (transactions at odd hours)
   * Fraudsters often operate at night to avoid detection
   */
  detectUnusualTiming() {
    const unusual = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      if (txs.length < 5) continue;
      
      let nightCount = 0; // 11 PM - 5 AM
      let weekendCount = 0;
      
      for (const tx of txs) {
        const hour = tx.timestamp.getHours();
        const day = tx.timestamp.getDay();
        
        if (hour >= 23 || hour < 5) nightCount++;
        if (day === 0 || day === 6) weekendCount++;
      }
      
      const nightRatio = nightCount / txs.length;
      const weekendRatio = weekendCount / txs.length;
      
      if (nightRatio > 0.5 || weekendRatio > 0.7) {
        unusual.set(accountId, {
          nightRatio: nightRatio.toFixed(2),
          weekendRatio: weekendRatio.toFixed(2),
          totalTransactions: txs.length
        });
      }
    }
    
    return unusual;
  }

  /**
   * Detect burst activity (sudden spike in transactions)
   * Indicates possible account compromise or fraud campaign
   */
  detectBurstActivity() {
    const bursts = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ].sort((a, b) => a.timestamp - b.timestamp);
      
      if (txs.length < 10) continue;
      
      // Calculate average time between transactions
      const timeDiffs = [];
      for (let i = 1; i < txs.length; i++) {
        timeDiffs.push(txs[i].timestamp - txs[i-1].timestamp);
      }
      
      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      
      // Find bursts (periods with much shorter time between txs)
      let burstCount = 0;
      let maxBurstSize = 0;
      let currentBurst = 0;
      
      for (const diff of timeDiffs) {
        if (diff < avgTimeDiff * 0.2) { // 5x faster than average
          currentBurst++;
          maxBurstSize = Math.max(maxBurstSize, currentBurst);
        } else {
          if (currentBurst >= 3) burstCount++;
          currentBurst = 0;
        }
      }
      
      if (burstCount > 0 || maxBurstSize >= 5) {
        bursts.set(accountId, {
          burstCount,
          maxBurstSize,
          avgTimeBetweenTxs: (avgTimeDiff / 3600000).toFixed(2) + ' hours'
        });
      }
    }
    
    return bursts;
  }

  /**
   * Detect dormancy reactivation (inactive account suddenly active)
   * Common in compromised or mule accounts
   */
  detectDormancyReactivation() {
    const dormant = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ].sort((a, b) => a.timestamp - b.timestamp);
      
      if (txs.length < 5) continue;
      
      // Find longest gap between transactions
      let maxGap = 0;
      let maxGapStart = null;
      let maxGapEnd = null;
      
      for (let i = 1; i < txs.length; i++) {
        const gap = txs[i].timestamp - txs[i-1].timestamp;
        if (gap > maxGap) {
          maxGap = gap;
          maxGapStart = txs[i-1].timestamp;
          maxGapEnd = txs[i].timestamp;
        }
      }
      
      const maxGapDays = maxGap / (1000 * 60 * 60 * 24);
      
      // If there's a long dormancy period (> 30 days) followed by activity
      if (maxGapDays > 30) {
        // Count transactions after reactivation
        const reactivationTxs = txs.filter(tx => tx.timestamp >= maxGapEnd);
        
        if (reactivationTxs.length >= 3) {
          dormant.set(accountId, {
            dormancyDays: maxGapDays.toFixed(0),
            dormancyStart: maxGapStart,
            reactivationDate: maxGapEnd,
            txsAfterReactivation: reactivationTxs.length
          });
        }
      }
    }
    
    return dormant;
  }

  /**
   * Detect amount splitting (breaking large amounts into smaller ones)
   * Classic structuring technique
   */
  detectAmountSplitting() {
    const splitting = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      if (outgoing.length < 3) continue;
      
      // Look for groups of similar amounts sent close together
      for (let i = 0; i < outgoing.length - 2; i++) {
        const window = [];
        const windowStart = outgoing[i].timestamp;
        const windowEnd = new Date(windowStart.getTime() + 24 * 3600000); // 24 hours
        
        for (let j = i; j < outgoing.length && outgoing[j].timestamp <= windowEnd; j++) {
          window.push(outgoing[j]);
        }
        
        if (window.length >= 3) {
          // Check if amounts are similar (within 20% of each other)
          const amounts = window.map(tx => tx.amount);
          const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const maxDeviation = Math.max(...amounts.map(a => Math.abs(a - avgAmount) / avgAmount));
          
          if (maxDeviation < 0.2) { // Within 20%
            const totalAmount = amounts.reduce((a, b) => a + b, 0);
            
            if (!splitting.has(accountId) || splitting.get(accountId).totalAmount < totalAmount) {
              splitting.set(accountId, {
                splitCount: window.length,
                avgAmount: avgAmount.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                timeWindow: '24 hours'
              });
            }
          }
        }
      }
    }
    
    return splitting;
  }

  /**
   * Detect frequency anomalies (unusual transaction patterns)
   */
  detectFrequencyAnomalies() {
    const anomalies = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ].sort((a, b) => a.timestamp - b.timestamp);
      
      if (txs.length < 20) continue; // Increased threshold
      
      // Calculate transaction frequency
      const timeSpan = txs[txs.length - 1].timestamp - txs[0].timestamp;
      const days = timeSpan / (1000 * 60 * 60 * 24);
      const txsPerDay = txs.length / days;
      
      // Flag if very high frequency (increased from 10 to 20)
      if (txsPerDay > 20) { // More than 20 transactions per day average
        anomalies.set(accountId, {
          txsPerDay: txsPerDay.toFixed(2),
          totalTransactions: txs.length,
          timeSpanDays: days.toFixed(0)
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Calculate network influence using simplified PageRank
   * Identifies influential nodes in the transaction network
   */
  calculateNetworkInfluence() {
    const accounts = this.graph.getAllAccounts();
    const influence = new Map();
    
    // Initialize influence scores
    const initialScore = 1.0 / accounts.length;
    for (const account of accounts) {
      influence.set(account, initialScore);
    }
    
    // Run simplified PageRank (3 iterations for speed)
    const dampingFactor = 0.85;
    const iterations = 3;
    
    for (let iter = 0; iter < iterations; iter++) {
      const newInfluence = new Map();
      
      for (const account of accounts) {
        let score = (1 - dampingFactor) / accounts.length;
        
        // Add influence from incoming transactions
        const incoming = this.graph.getIncomingTransactions(account);
        for (const tx of incoming) {
          const senderOutgoing = this.graph.getOutgoingTransactions(tx.sender_id);
          if (senderOutgoing.length > 0) {
            score += dampingFactor * (influence.get(tx.sender_id) / senderOutgoing.length);
          }
        }
        
        newInfluence.set(account, score);
      }
      
      // Update influence scores
      for (const [account, score] of newInfluence) {
        influence.set(account, score);
      }
    }
    
    // Normalize and filter high-influence accounts
    const maxInfluence = Math.max(...influence.values());
    const highInfluence = new Map();
    
    for (const [account, score] of influence) {
      const normalizedScore = score / maxInfluence;
      if (normalizedScore > 0.5) { // Top 50% influence
        highInfluence.set(account, {
          influenceScore: normalizedScore.toFixed(3),
          rank: 'high'
        });
      }
    }
    
    return highInfluence;
  }

  // ===== Optimized versions of original patterns =====

  /**
   * Efficient cycle detection using DFS with path tracking
   * Finds all simple cycles of length 3, 4, or 5
   */
  detectCyclesEfficient(maxCycles = 100) {
    const accounts = this.graph.getAllAccounts();
    const cycles = [];
    const globalVisited = new Set(); // Track globally visited nodes
    
    for (const startAccount of accounts) {
      if (cycles.length >= maxCycles) break;
      if (globalVisited.has(startAccount)) continue;
      
      const visited = new Set();
      const recursionStack = new Set();
      const path = [];
      
      const dfs = (node, depth) => {
        if (depth > 5 || cycles.length >= maxCycles) return;
        
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        
        const outgoing = this.graph.getOutgoingTransactions(node);
        
        for (const tx of outgoing) {
          if (cycles.length >= maxCycles) break;
          
          const neighbor = tx.receiver_id;
          
          // Found a cycle back to a node in current path
          if (recursionStack.has(neighbor)) {
            const cycleStart = path.indexOf(neighbor);
            if (cycleStart >= 0) {
              const cycleLength = path.length - cycleStart;
              
              // Only keep cycles of length 3, 4, or 5
              if (cycleLength >= 3 && cycleLength <= 5) {
                const cycleAccounts = path.slice(cycleStart);
                
                // Normalize cycle representation (start with smallest account ID)
                const minIdx = cycleAccounts.indexOf(Math.min(...cycleAccounts));
                const normalizedCycle = [
                  ...cycleAccounts.slice(minIdx),
                  ...cycleAccounts.slice(0, minIdx)
                ];
                
                // Check if we already have this cycle
                const cycleKey = normalizedCycle.join(',');
                const isDuplicate = cycles.some(c => {
                  const minIdx2 = c.accounts.indexOf(Math.min(...c.accounts));
                  const normalized2 = [
                    ...c.accounts.slice(minIdx2),
                    ...c.accounts.slice(0, minIdx2)
                  ];
                  return normalized2.join(',') === cycleKey;
                });
                
                if (!isDuplicate) {
                  cycles.push({
                    accounts: cycleAccounts,
                    length: cycleLength
                  });
                }
              }
            }
          } else if (!visited.has(neighbor) && depth < 4) {
            // Continue DFS if not visited and within depth limit (reduced to 4)
            dfs(neighbor, depth + 1);
          }
        }
        
        path.pop();
        recursionStack.delete(node);
      };
      
      dfs(startAccount, 0);
      globalVisited.add(startAccount);
    }
    
    return cycles;
  }

  /**
   * Optimized fan-out detection
   */
  detectFanOutPatterns() {
    const patterns = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      if (outgoing.length < 15) continue; // Increased from 10 to 15
      
      const sorted = [...outgoing].sort((a, b) => a.timestamp - b.timestamp);
      let maxReceivers = 0;
      let bestWindow = null;
      
      for (let i = 0; i < sorted.length; i++) {
        const windowEnd = new Date(sorted[i].timestamp.getTime() + 72 * 3600000);
        const receivers = new Set();
        
        for (let j = i; j < sorted.length && sorted[j].timestamp <= windowEnd; j++) {
          receivers.add(sorted[j].receiver_id);
        }
        
        if (receivers.size > maxReceivers) {
          maxReceivers = receivers.size;
          bestWindow = {
            sender_id: accountId,
            receiver_count: receivers.size,
            window_start: sorted[i].timestamp,
            window_end: windowEnd
          };
        }
      }
      
      if (maxReceivers >= 15) { // Increased from 10 to 15
        patterns.set(accountId, bestWindow);
      }
    }
    
    return patterns;
  }

  /**
   * Optimized fan-in detection
   */
  detectFanInPatterns() {
    const patterns = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const incoming = this.graph.getIncomingTransactions(accountId);
      if (incoming.length < 15) continue; // Increased from 10 to 15
      
      const sorted = [...incoming].sort((a, b) => a.timestamp - b.timestamp);
      let maxSenders = 0;
      let bestWindow = null;
      
      for (let i = 0; i < sorted.length; i++) {
        const windowEnd = new Date(sorted[i].timestamp.getTime() + 72 * 3600000);
        const senders = new Set();
        
        for (let j = i; j < sorted.length && sorted[j].timestamp <= windowEnd; j++) {
          senders.add(sorted[j].sender_id);
        }
        
        if (senders.size > maxSenders) {
          maxSenders = senders.size;
          bestWindow = {
            receiver_id: accountId,
            sender_count: senders.size,
            window_start: sorted[i].timestamp,
            window_end: windowEnd
          };
        }
      }
      
      if (maxSenders >= 15) { // Increased from 10 to 15
        patterns.set(accountId, bestWindow);
      }
    }
    
    return patterns;
  }

  // Include other original methods (shell, passthrough, structuring, threshold)
  // with same optimizations as GraphAnalyzerOptimized
  
  detectShellAccounts() {
    const shells = new Set();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const incoming = this.graph.getIncomingTransactions(accountId);
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const total = incoming.length + outgoing.length;
      
      if (total <= 3 && total > 0 && incoming.length > 0 && outgoing.length > 0) {
        shells.add(accountId);
      }
    }
    
    return shells;
  }

  detectPassthroughBehavior() {
    const passthrough = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const incoming = this.graph.getIncomingTransactions(accountId);
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      
      if (incoming.length === 0 || outgoing.length === 0) continue;
      
      const events = [];
      const sortedIn = [...incoming].sort((a, b) => a.timestamp - b.timestamp);
      const sortedOut = [...outgoing].sort((a, b) => a.timestamp - b.timestamp);
      
      let outIdx = 0;
      for (const inTx of sortedIn) {
        while (outIdx < sortedOut.length && sortedOut[outIdx].timestamp < inTx.timestamp) {
          outIdx++;
        }
        
        for (let j = outIdx; j < sortedOut.length; j++) {
          const timeDelta = (sortedOut[j].timestamp - inTx.timestamp) / 3600000;
          if (timeDelta > 6) break;
          if (timeDelta >= 0) {
            events.push({
              incoming_transaction_id: inTx.transaction_id,
              outgoing_transaction_id: sortedOut[j].transaction_id,
              time_delta_hours: timeDelta
            });
            if (events.length >= 100) break;
          }
        }
        if (events.length >= 100) break;
      }
      
      if (events.length > 0) {
        passthrough.set(accountId, events);
      }
    }
    
    return passthrough;
  }

  detectStructuring() {
    const structuring = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      if (txs.length === 0) continue;
      
      const roundCount = txs.filter(tx => 
        tx.amount % 1000 === 0 || tx.amount % 500 === 0 || tx.amount % 100 === 0
      ).length;
      
      const percentage = roundCount / txs.length;
      
      if (percentage > 0.70) {
        structuring.set(accountId, {
          account_id: accountId,
          round_number_percentage: percentage,
          total_transactions: txs.length
        });
      }
    }
    
    return structuring;
  }

  detectThresholdAvoidance() {
    const threshold = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      if (txs.length === 0) continue;
      
      const avg = txs.reduce((sum, tx) => sum + tx.amount, 0) / txs.length;
      
      if (avg >= 9000 && avg <= 9999) {
        const nearThreshold = txs.filter(tx => tx.amount >= 9000 && tx.amount <= 9999).length;
        const clustering = nearThreshold / txs.length;
        
        threshold.set(accountId, {
          account_id: accountId,
          average_amount: avg,
          transaction_count: txs.length,
          clustering_consistency: clustering
        });
      }
    }
    
    return threshold;
  }

  identifyFraudRings(suspiciousAccounts) {
    if (!suspiciousAccounts || suspiciousAccounts.length === 0) {
      return [];
    }

    const suspiciousSet = new Set(suspiciousAccounts);
    const adjacency = new Map();

    for (const accountId of suspiciousAccounts) {
      adjacency.set(accountId, new Set());
    }

    for (const accountId of suspiciousAccounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);

      for (const tx of outgoing) {
        if (suspiciousSet.has(tx.receiver_id)) {
          adjacency.get(accountId).add(tx.receiver_id);
          adjacency.get(tx.receiver_id).add(accountId);
        }
      }

      for (const tx of incoming) {
        if (suspiciousSet.has(tx.sender_id)) {
          adjacency.get(accountId).add(tx.sender_id);
          adjacency.get(tx.sender_id).add(accountId);
        }
      }
    }

    const visited = new Set();
    const rings = [];
    let ringIdCounter = 1;

    for (const accountId of suspiciousAccounts) {
      if (visited.has(accountId)) continue;

      const component = [];
      const queue = [accountId];
      visited.add(accountId);

      while (queue.length > 0) {
        const current = queue.shift();
        component.push(current);

        for (const neighbor of adjacency.get(current)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (component.length > 0) {
        rings.push({
          ring_id: `RING-${String(ringIdCounter).padStart(3, '0')}`,
          member_accounts: component.sort(),
          pattern_type: this._classifyRingPattern(component),
          detection_method: 'connectivity_analysis'
        });
        ringIdCounter++;
      }
    }

    return rings;
  }

  /**
   * Enhanced fraud ring identification that includes Louvain-detected rings
   * This combines traditional connectivity analysis with Louvain community detection
   */
  identifyFraudRingsEnhanced(suspiciousAccounts, louvainRings) {
    // Get traditional connectivity-based rings
    const connectivityRings = this.identifyFraudRings(suspiciousAccounts);
    
    // Add Louvain-detected rings
    const allRings = [...connectivityRings];
    let ringIdCounter = connectivityRings.length + 1;
    
    if (louvainRings && Array.isArray(louvainRings)) {
      for (const louvainRing of louvainRings) {
        // Check if this ring overlaps significantly with existing rings
        const isNewRing = !connectivityRings.some(existingRing => {
          const overlap = louvainRing.members.filter(m => 
            existingRing.member_accounts.includes(m)
          ).length;
          const overlapRatio = overlap / Math.min(louvainRing.members.length, existingRing.member_accounts.length);
          return overlapRatio > 0.7; // 70% overlap = same ring
        });
        
        if (isNewRing) {
          allRings.push({
            ring_id: `RING-${String(ringIdCounter).padStart(3, '0')}`,
            member_accounts: louvainRing.members.sort(),
            pattern_type: this._mapLouvainPatternType(louvainRing.pattern),
            detection_method: 'louvain_community_detection',
            louvain_score: louvainRing.smurfingScore,
            louvain_pattern: louvainRing.pattern,
            density: louvainRing.density,
            central_beneficiaries: louvainRing.centralBeneficiaries
          });
          ringIdCounter++;
        }
      }
    }
    
    return allRings;
  }

  /**
   * Map Louvain pattern types to traditional ring pattern types
   */
  _mapLouvainPatternType(louvainPattern) {
    const mapping = {
      'SINGLE_BENEFICIARY_SMURFING': 'smurfing',
      'MULTI_BENEFICIARY_RING': 'smurfing',
      'COORDINATED_BURST_SMURFING': 'smurfing',
      'STRUCTURED_SMURFING': 'smurfing',
      'DISTRIBUTED_SMURFING_NETWORK': 'hybrid'
    };
    return mapping[louvainPattern] || 'smurfing';
  }

  _classifyRingPattern(members) {
    const totalTxs = members.reduce((sum, acc) => {
      return sum + this.graph.getIncomingTransactions(acc).length + 
             this.graph.getOutgoingTransactions(acc).length;
    }, 0);
    
    const avgTxs = totalTxs / members.length;
    
    if (avgTxs <= 3) return 'shell_chain';
    if (avgTxs > 20) return 'smurfing';
    if (members.length === 3) return 'cycle';
    return 'hybrid';
  }

  // Aliases for backward compatibility with tests
  detectCycles() {
    return this.detectCyclesEfficient();
  }

  calculateBetweennessCentrality() {
    // Simplified betweenness centrality calculation
    // Counts how many shortest paths pass through each node
    const accounts = this.graph.getAllAccounts();
    const centrality = new Map();
    
    // Initialize all accounts with 0 centrality
    for (const account of accounts) {
      centrality.set(account, 0);
    }
    
    // For each source node, do BFS to find shortest paths
    for (const source of accounts) {
      const stack = [];
      const paths = new Map(); // predecessors on shortest paths
      const pathCounts = new Map(); // number of shortest paths
      const distances = new Map(); // distance from source
      
      for (const account of accounts) {
        paths.set(account, []);
        pathCounts.set(account, 0);
        distances.set(account, -1);
      }
      
      pathCounts.set(source, 1);
      distances.set(source, 0);
      
      const queue = [source];
      
      // BFS to find shortest paths
      while (queue.length > 0) {
        const current = queue.shift();
        stack.push(current);
        
        const outgoing = this.graph.getOutgoingTransactions(current);
        for (const tx of outgoing) {
          const neighbor = tx.receiver_id;
          
          // First time visiting this node
          if (distances.get(neighbor) < 0) {
            queue.push(neighbor);
            distances.set(neighbor, distances.get(current) + 1);
          }
          
          // Shortest path to neighbor via current
          if (distances.get(neighbor) === distances.get(current) + 1) {
            pathCounts.set(neighbor, pathCounts.get(neighbor) + pathCounts.get(current));
            paths.get(neighbor).push(current);
          }
        }
      }
      
      // Accumulate centrality scores (back-propagation)
      const dependency = new Map();
      for (const account of accounts) {
        dependency.set(account, 0);
      }
      
      // Process nodes in reverse order of discovery
      while (stack.length > 0) {
        const w = stack.pop();
        for (const v of paths.get(w)) {
          const contrib = (pathCounts.get(v) / pathCounts.get(w)) * (1 + dependency.get(w));
          dependency.set(v, dependency.get(v) + contrib);
        }
        if (w !== source) {
          centrality.set(w, centrality.get(w) + dependency.get(w));
        }
      }
    }
    
    return centrality;
  }

  /**
   * Detect round-trip transactions (A→B→A patterns within short timeframe)
   * Indicates potential wash trading or circular fund movement
   */
  detectRoundTripTransactions() {
    const roundTrips = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      
      for (const tx1 of outgoing) {
        const intermediary = tx1.receiver_id;
        const intermediaryOutgoing = this.graph.getOutgoingTransactions(intermediary);
        
        for (const tx2 of intermediaryOutgoing) {
          if (tx2.receiver_id === accountId) {
            // Found A→B→A pattern
            const timeDiff = (tx2.timestamp - tx1.timestamp) / (1000 * 60 * 60); // hours
            
            if (timeDiff <= 48 && timeDiff >= 0) { // Within 48 hours
              if (!roundTrips.has(accountId)) {
                roundTrips.set(accountId, []);
              }
              
              roundTrips.get(accountId).push({
                intermediary,
                outgoingAmount: tx1.amount,
                returnAmount: tx2.amount,
                timeDiffHours: timeDiff.toFixed(2),
                amountDifference: Math.abs(tx1.amount - tx2.amount).toFixed(2)
              });
            }
          }
        }
      }
    }
    
    // Filter to only accounts with multiple round trips
    const filtered = new Map();
    for (const [accountId, trips] of roundTrips) {
      if (trips.length >= 2) {
        filtered.set(accountId, {
          roundTripCount: trips.length,
          examples: trips.slice(0, 3) // Keep first 3 examples
        });
      }
    }
    
    return filtered;
  }

  /**
   * Optimized round-trip detection with early termination
   */
  detectRoundTripTransactionsOptimized() {
    const roundTrips = new Map();
    const accounts = this.graph.getAllAccounts();
    const maxRoundTripsPerAccount = 10; // Limit for performance
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      if (outgoing.length === 0) continue;
      
      let tripCount = 0;
      
      for (const tx1 of outgoing) {
        if (tripCount >= maxRoundTripsPerAccount) break;
        
        const intermediary = tx1.receiver_id;
        const intermediaryOutgoing = this.graph.getOutgoingTransactions(intermediary);
        
        for (const tx2 of intermediaryOutgoing) {
          if (tx2.receiver_id === accountId) {
            // Found A→B→A pattern
            const timeDiff = (tx2.timestamp - tx1.timestamp) / (1000 * 60 * 60); // hours
            
            if (timeDiff <= 48 && timeDiff >= 0) { // Within 48 hours
              if (!roundTrips.has(accountId)) {
                roundTrips.set(accountId, []);
              }
              
              roundTrips.get(accountId).push({
                intermediary,
                outgoingAmount: tx1.amount,
                returnAmount: tx2.amount,
                timeDiffHours: timeDiff.toFixed(2),
                amountDifference: Math.abs(tx1.amount - tx2.amount).toFixed(2)
              });
              
              tripCount++;
              if (tripCount >= maxRoundTripsPerAccount) break;
            }
          }
        }
      }
    }
    
    // Filter to only accounts with multiple round trips
    const filtered = new Map();
    for (const [accountId, trips] of roundTrips) {
      if (trips.length >= 2) {
        filtered.set(accountId, {
          roundTripCount: trips.length,
          examples: trips.slice(0, 3) // Keep first 3 examples
        });
      }
    }
    
    return filtered;
  }

  /**
   * Analyze layering depth (how many hops funds travel)
   * Deep layering is a money laundering technique
   */
  analyzeLayeringDepth() {
    const layering = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      
      if (outgoing.length === 0) continue;
      
      // BFS to find maximum depth of transaction chains
      const visited = new Set();
      const queue = [[accountId, 0]];
      let maxDepth = 0;
      let pathCount = 0;
      
      while (queue.length > 0 && pathCount < 100) {
        const [current, depth] = queue.shift();
        
        if (visited.has(current)) continue;
        visited.add(current);
        pathCount++;
        
        maxDepth = Math.max(maxDepth, depth);
        
        if (depth < 6) { // Limit depth to avoid infinite loops
          const currentOutgoing = this.graph.getOutgoingTransactions(current);
          for (const tx of currentOutgoing) {
            if (!visited.has(tx.receiver_id)) {
              queue.push([tx.receiver_id, depth + 1]);
            }
          }
        }
      }
      
      if (maxDepth >= 4) { // Flag deep layering (4+ hops)
        layering.set(accountId, {
          maxLayerDepth: maxDepth,
          chainComplexity: pathCount
        });
      }
    }
    
    return layering;
  }

  /**
   * Analyze counterparty diversity
   * Low diversity with high volume suggests coordinated activity
   */
  analyzeCounterpartyDiversity() {
    const diversity = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);
      
      const totalTxs = outgoing.length + incoming.length;
      if (totalTxs < 10) continue;
      
      const uniqueCounterparties = new Set();
      outgoing.forEach(tx => uniqueCounterparties.add(tx.receiver_id));
      incoming.forEach(tx => uniqueCounterparties.add(tx.sender_id));
      
      const diversityRatio = uniqueCounterparties.size / totalTxs;
      
      // Flag low diversity (same counterparties repeatedly)
      if (diversityRatio < 0.3) { // Less than 30% unique counterparties
        // Calculate concentration (how much volume goes to top counterparty)
        const counterpartyVolume = new Map();
        
        for (const tx of outgoing) {
          counterpartyVolume.set(
            tx.receiver_id,
            (counterpartyVolume.get(tx.receiver_id) || 0) + tx.amount
          );
        }
        
        for (const tx of incoming) {
          counterpartyVolume.set(
            tx.sender_id,
            (counterpartyVolume.get(tx.sender_id) || 0) + tx.amount
          );
        }
        
        const volumes = Array.from(counterpartyVolume.values()).sort((a, b) => b - a);
        const totalVolume = volumes.reduce((a, b) => a + b, 0);
        const topConcentration = volumes[0] / totalVolume;
        
        diversity.set(accountId, {
          diversityRatio: diversityRatio.toFixed(2),
          uniqueCounterparties: uniqueCounterparties.size,
          totalTransactions: totalTxs,
          topCounterpartyConcentration: topConcentration.toFixed(2)
        });
      }
    }
    
    return diversity;
  }

  /**
   * Detect amount progression patterns
   * Escalating or de-escalating amounts can indicate testing or ramping fraud
   */
  detectAmountProgression() {
    const progression = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      if (outgoing.length < 5) continue;
      
      // Calculate trend (are amounts increasing or decreasing?)
      let increasingCount = 0;
      let decreasingCount = 0;
      
      for (let i = 1; i < outgoing.length; i++) {
        if (outgoing[i].amount > outgoing[i-1].amount * 1.2) {
          increasingCount++;
        } else if (outgoing[i].amount < outgoing[i-1].amount * 0.8) {
          decreasingCount++;
        }
      }
      
      const increasingRatio = increasingCount / (outgoing.length - 1);
      const decreasingRatio = decreasingCount / (outgoing.length - 1);
      
      // Flag strong trends
      if (increasingRatio > 0.6) {
        progression.set(accountId, {
          pattern: 'escalating',
          trendStrength: increasingRatio.toFixed(2),
          startAmount: outgoing[0].amount.toFixed(2),
          endAmount: outgoing[outgoing.length - 1].amount.toFixed(2),
          multiplier: (outgoing[outgoing.length - 1].amount / outgoing[0].amount).toFixed(2)
        });
      } else if (decreasingRatio > 0.6) {
        progression.set(accountId, {
          pattern: 'de-escalating',
          trendStrength: decreasingRatio.toFixed(2),
          startAmount: outgoing[0].amount.toFixed(2),
          endAmount: outgoing[outgoing.length - 1].amount.toFixed(2),
          multiplier: (outgoing[0].amount / outgoing[outgoing.length - 1].amount).toFixed(2)
        });
      }
    }
    
    return progression;
  }

  /**
   * Detect temporal clustering
   * Transactions clustered at specific times may indicate automated/coordinated activity
   */
  detectTemporalClustering() {
    const clustering = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ];
      
      if (txs.length < 10) continue;
      
      // Group by hour of day
      const hourCounts = new Array(24).fill(0);
      for (const tx of txs) {
        const hour = tx.timestamp.getHours();
        hourCounts[hour]++;
      }
      
      // Find peak hours
      const maxCount = Math.max(...hourCounts);
      const avgCount = txs.length / 24;
      const peakHours = [];
      
      for (let hour = 0; hour < 24; hour++) {
        if (hourCounts[hour] >= maxCount * 0.8) { // Within 80% of peak
          peakHours.push(hour);
        }
      }
      
      // Flag if highly clustered (>50% of transactions in 3 hours or less)
      const peakConcentration = peakHours.reduce((sum, h) => sum + hourCounts[h], 0) / txs.length;
      
      if (peakConcentration > 0.5 && peakHours.length <= 3) {
        clustering.set(accountId, {
          peakHours: peakHours,
          peakConcentration: peakConcentration.toFixed(2),
          totalTransactions: txs.length,
          pattern: peakHours.length === 1 ? 'single-hour' : 'narrow-window'
        });
      }
    }
    
    return clustering;
  }

  /**
   * Advanced: Detect money laundering chains using deep path analysis
   * Time Complexity: O(V * E * D) where D is max depth
   * This is more expensive but finds sophisticated layering patterns
   */
  detectMoneyLaunderingChains() {
    const chains = new Map();
    const accounts = this.graph.getAllAccounts();
    const MAX_DEPTH = 8; // Increased from 6 for deeper analysis
    const MIN_CHAIN_LENGTH = 5; // Minimum hops to be suspicious
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      if (outgoing.length === 0) continue;
      
      // Track all paths from this account
      const paths = [];
      const visited = new Set();
      
      const dfs = (current, path, depth, totalAmount) => {
        if (depth >= MAX_DEPTH) return;
        if (visited.has(current)) return;
        
        visited.add(current);
        const currentOutgoing = this.graph.getOutgoingTransactions(current);
        
        for (const tx of currentOutgoing) {
          const newPath = [...path, { account: tx.receiver_id, amount: tx.amount, timestamp: tx.timestamp }];
          const newAmount = totalAmount + tx.amount;
          
          if (newPath.length >= MIN_CHAIN_LENGTH) {
            paths.push({
              chain: newPath,
              length: newPath.length,
              totalAmount: newAmount,
              amountDecay: (newAmount / (totalAmount || 1)).toFixed(2)
            });
          }
          
          if (depth < MAX_DEPTH - 1) {
            dfs(tx.receiver_id, newPath, depth + 1, newAmount);
          }
        }
        
        visited.delete(current);
      };
      
      dfs(accountId, [], 0, 0);
      
      if (paths.length > 0) {
        // Sort by length and find longest chains
        paths.sort((a, b) => b.length - a.length);
        const longestChains = paths.slice(0, 3); // Keep top 3
        
        chains.set(accountId, {
          chainCount: paths.length,
          longestChainLength: longestChains[0].length,
          examples: longestChains.map(c => ({
            length: c.length,
            totalAmount: c.totalAmount.toFixed(2),
            accounts: c.chain.slice(0, 5).map(p => p.account) // First 5 accounts
          }))
        });
      }
    }
    
    return chains;
  }

  /**
   * Advanced: Detect coordinated account behavior using transaction correlation
   * Time Complexity: O(V * E) - optimized version with sampling
   */
  detectCoordinatedBehavior() {
    const coordinated = new Map();
    const accounts = this.graph.getAllAccounts();
    const MIN_CORRELATION = 0.7; // 70% correlation threshold
    const MAX_ACCOUNTS_TO_COMPARE = 100; // Limit comparisons for performance
    
    // Build transaction timelines for each account
    const timelines = new Map();
    for (const accountId of accounts) {
      const txs = [
        ...this.graph.getIncomingTransactions(accountId),
        ...this.graph.getOutgoingTransactions(accountId)
      ].sort((a, b) => a.timestamp - b.timestamp);
      
      if (txs.length >= 10) {
        timelines.set(accountId, txs);
      }
    }
    
    // Only compare accounts with high transaction volume (likely fraud rings)
    const accountList = Array.from(timelines.keys())
      .filter(acc => timelines.get(acc).length >= 20)
      .slice(0, MAX_ACCOUNTS_TO_COMPARE); // Limit to top 100 accounts
    
    // Compare each pair of accounts for correlation
    for (let i = 0; i < accountList.length; i++) {
      const acc1 = accountList[i];
      const timeline1 = timelines.get(acc1);
      const correlatedAccounts = [];
      
      for (let j = i + 1; j < Math.min(accountList.length, i + 20); j++) { // Only compare with next 20
        const acc2 = accountList[j];
        const timeline2 = timelines.get(acc2);
        
        // Calculate temporal correlation
        const correlation = this._calculateTemporalCorrelation(timeline1, timeline2);
        
        if (correlation >= MIN_CORRELATION) {
          correlatedAccounts.push({
            account: acc2,
            correlation: correlation.toFixed(2)
          });
        }
      }
      
      if (correlatedAccounts.length >= 2) {
        coordinated.set(acc1, {
          correlatedCount: correlatedAccounts.length,
          correlatedAccounts: correlatedAccounts.slice(0, 5) // Top 5
        });
      }
    }
    
    return coordinated;
  }

  /**
   * Calculate temporal correlation between two transaction timelines
   * Returns value between 0 (no correlation) and 1 (perfect correlation)
   */
  _calculateTemporalCorrelation(timeline1, timeline2) {
    const TIME_WINDOW = 3600000; // 1 hour in milliseconds
    let matches = 0;
    let total = Math.min(timeline1.length, timeline2.length);
    
    if (total === 0) return 0;
    
    for (const tx1 of timeline1) {
      for (const tx2 of timeline2) {
        const timeDiff = Math.abs(tx1.timestamp - tx2.timestamp);
        if (timeDiff <= TIME_WINDOW) {
          matches++;
          break; // Count each tx1 only once
        }
      }
    }
    
    return matches / total;
  }

  /**
   * Advanced: Detect smurfing patterns using statistical clustering
   * Time Complexity: O(V * E * log(E)) - optimized with early termination
   */
  detectSmurfingPatterns() {
    const smurfing = new Map();
    const accounts = this.graph.getAllAccounts();
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      if (outgoing.length < 20) continue; // Need significant volume
      
      // Group transactions by amount similarity (optimized)
      const amountClusters = this._clusterByAmountOptimized(outgoing);
      
      // Look for large clusters of similar amounts to different receivers
      const significantClusters = [];
      for (const cluster of amountClusters) {
        if (cluster.transactions.length >= 10) {
          const receivers = new Set(cluster.transactions.map(tx => tx.receiver_id));
          
          // Smurfing: many similar amounts to different receivers
          if (receivers.size >= 8) {
            significantClusters.push({
              clusterSize: cluster.transactions.length,
              avgAmount: cluster.avgAmount.toFixed(2),
              uniqueReceivers: receivers.size,
              totalAmount: cluster.totalAmount.toFixed(2),
              timeSpan: this._calculateTimeSpan(cluster.transactions)
            });
            
            if (significantClusters.length >= 5) break; // Early termination
          }
        }
      }
      
      if (significantClusters.length >= 2) {
        smurfing.set(accountId, {
          clusterCount: significantClusters.length,
          examples: significantClusters.slice(0, 3)
        });
      }
    }
    
    return smurfing;
  }
  /**
   * Louvain Community Detection for Smurfing Rings
   * Identifies densely connected communities that represent coordinated fraud rings
   * Time Complexity: O(V * E) with optimizations
   *
   * This is the industry-standard approach used by tier-1 financial institutions
   * because it finds the entire ring rather than flagging individual accounts,
   * dramatically reducing false positives.
   */
  detectSmurfingRingsLouvain() {
    console.log('Running Louvain community detection for smurfing rings...');
    const startTime = Date.now();

    // Step 1: Build undirected weighted graph
    const graph = this._buildWeightedGraph();

    // Step 2: Run Louvain algorithm
    const communities = this._louvainClustering(graph);

    // Step 3: Analyze communities for smurfing patterns
    const smurfingRings = this._analyzeCommunitiesForSmurfing(communities, graph);

    const endTime = Date.now();
    console.log(`Louvain detection completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`Found ${smurfingRings.length} potential smurfing rings`);

    return smurfingRings;
  }

  /**
   * Build weighted undirected graph from transaction data
   * Weight = transaction frequency + amount similarity
   * @private
   */
  _buildWeightedGraph() {
    const graph = {
      nodes: new Set(),
      edges: new Map(), // "nodeA-nodeB" -> weight
      neighbors: new Map() // nodeId -> Set of neighbor IDs
    };

    const accounts = this.graph.getAllAccounts();

    // Add all nodes
    accounts.forEach(acc => {
      graph.nodes.add(acc);
      graph.neighbors.set(acc, new Set());
    });

    // Build edges with weights
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);

      // Process outgoing transactions
      const counterpartyWeights = new Map();

      for (const tx of outgoing) {
        const counterparty = tx.receiver_id;
        if (!counterpartyWeights.has(counterparty)) {
          counterpartyWeights.set(counterparty, { count: 0, totalAmount: 0, amounts: [] });
        }
        const data = counterpartyWeights.get(counterparty);
        data.count++;
        data.totalAmount += tx.amount;
        data.amounts.push(tx.amount);
      }

      // Process incoming transactions
      for (const tx of incoming) {
        const counterparty = tx.sender_id;
        if (!counterpartyWeights.has(counterparty)) {
          counterpartyWeights.set(counterparty, { count: 0, totalAmount: 0, amounts: [] });
        }
        const data = counterpartyWeights.get(counterparty);
        data.count++;
        data.totalAmount += tx.amount;
        data.amounts.push(tx.amount);
      }

      // Calculate edge weights
      for (const [counterparty, data] of counterpartyWeights) {
        const edgeKey = this._getEdgeKey(accountId, counterparty);

        // Weight formula: frequency * (1 + amount_consistency_bonus)
        const avgAmount = data.totalAmount / data.count;
        const amountVariance = this._calculateVariance(data.amounts, avgAmount);
        const consistencyBonus = amountVariance < (avgAmount * 0.2) ? 2 : 1; // Bonus for consistent amounts

        const weight = data.count * consistencyBonus;

        graph.edges.set(edgeKey, weight);
        graph.neighbors.get(accountId).add(counterparty);
        graph.neighbors.get(counterparty).add(accountId);
      }
    }

    return graph;
  }

  /**
   * Louvain algorithm implementation
   * @private
   */
  _louvainClustering(graph) {
    // Initialize: each node in its own community
    const nodeToCommunity = new Map();
    const communityNodes = new Map();
    let communityId = 0;

    for (const node of graph.nodes) {
      nodeToCommunity.set(node, communityId);
      communityNodes.set(communityId, new Set([node]));
      communityId++;
    }

    let improved = true;
    let iteration = 0;
    const maxIterations = 10;

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      // Phase 1: Modularity optimization
      for (const node of graph.nodes) {
        const currentCommunity = nodeToCommunity.get(node);
        const neighbors = graph.neighbors.get(node);

        // Calculate modularity gain for moving to neighbor communities
        const communityGains = new Map();

        for (const neighbor of neighbors) {
          const neighborCommunity = nodeToCommunity.get(neighbor);
          if (neighborCommunity === currentCommunity) continue;

          const gain = this._calculateModularityGain(
            node,
            currentCommunity,
            neighborCommunity,
            nodeToCommunity,
            graph
          );

          if (!communityGains.has(neighborCommunity) || gain > communityGains.get(neighborCommunity)) {
            communityGains.set(neighborCommunity, gain);
          }
        }

        // Move to community with best gain
        let bestCommunity = currentCommunity;
        let bestGain = 0;

        for (const [community, gain] of communityGains) {
          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = community;
          }
        }

        if (bestCommunity !== currentCommunity && bestGain > 0) {
          // Move node to new community
          communityNodes.get(currentCommunity).delete(node);
          if (!communityNodes.has(bestCommunity)) {
            communityNodes.set(bestCommunity, new Set());
          }
          communityNodes.get(bestCommunity).add(node);
          nodeToCommunity.set(node, bestCommunity);
          improved = true;
        }
      }
    }

    // Convert to array format
    const communities = [];
    for (const [communityId, nodes] of communityNodes) {
      if (nodes.size > 0) {
        communities.push({
          id: communityId,
          members: Array.from(nodes),
          size: nodes.size
        });
      }
    }

    return communities;
  }

  /**
   * Calculate modularity gain for moving a node to a new community
   * @private
   */
  _calculateModularityGain(node, fromCommunity, toCommunity, nodeToCommunity, graph) {
    const neighbors = graph.neighbors.get(node);
    let internalEdges = 0;
    let externalEdges = 0;

    for (const neighbor of neighbors) {
      const edgeKey = this._getEdgeKey(node, neighbor);
      const weight = graph.edges.get(edgeKey) || 0;

      const neighborCommunity = nodeToCommunity.get(neighbor);
      if (neighborCommunity === toCommunity) {
        internalEdges += weight;
      } else if (neighborCommunity === fromCommunity) {
        externalEdges += weight;
      }
    }

    // Simplified modularity gain: favor moves that increase internal edges
    return internalEdges - externalEdges * 0.5;
  }

  /**
   * Analyze communities to identify smurfing patterns
   * @private
   */
  _analyzeCommunitiesForSmurfing(communities, graph) {
    const smurfingRings = [];

    for (const community of communities) {
      // Filter communities by size (smurfing rings typically have 5-50 accounts)
      if (community.size < 5 || community.size > 100) continue;

      // Analyze community structure
      const analysis = this._analyzeCommunityStructure(community, graph);

      // Smurfing indicators:
      // 1. High density (many connections within community)
      // 2. Central beneficiary (one account receives from many)
      // 3. Similar transaction amounts
      // 4. Temporal clustering (transactions happen in bursts)

      const smurfingScore = this._calculateSmurfingScore(analysis);

      if (smurfingScore > 0.6) { // Threshold for smurfing detection
        smurfingRings.push({
          communityId: community.id,
          members: community.members,
          size: community.size,
          smurfingScore: smurfingScore.toFixed(3),
          centralBeneficiaries: analysis.centralNodes,
          density: analysis.density.toFixed(3),
          avgTransactionAmount: analysis.avgAmount.toFixed(2),
          amountConsistency: analysis.amountConsistency.toFixed(3),
          temporalClustering: analysis.temporalClustering.toFixed(3),
          totalVolume: analysis.totalVolume.toFixed(2),
          pattern: this._classifySmurfingPattern(analysis)
        });
      }
    }

    // Sort by smurfing score (highest first)
    smurfingRings.sort((a, b) => parseFloat(b.smurfingScore) - parseFloat(a.smurfingScore));

    return smurfingRings;
  }

  /**
   * Analyze community structure for smurfing indicators
   * @private
   */
  _analyzeCommunityStructure(community, graph) {
    const members = community.members;
    const inDegree = new Map();
    const outDegree = new Map();
    const amounts = [];
    const timestamps = [];
    let totalVolume = 0;
    let internalEdges = 0;

    // Initialize degree maps
    members.forEach(m => {
      inDegree.set(m, 0);
      outDegree.set(m, 0);
    });

    // Calculate degrees and collect transaction data
    for (const member of members) {
      const outgoing = this.graph.getOutgoingTransactions(member);
      const incoming = this.graph.getIncomingTransactions(member);

      for (const tx of outgoing) {
        if (members.includes(tx.receiver_id)) {
          internalEdges++;
          outDegree.set(member, outDegree.get(member) + 1);
          inDegree.set(tx.receiver_id, inDegree.get(tx.receiver_id) + 1);
          amounts.push(tx.amount);
          timestamps.push(tx.timestamp);
          totalVolume += tx.amount;
        }
      }
    }

    // Find central nodes (high in-degree = beneficiaries)
    const centralNodes = [];
    const avgInDegree = Array.from(inDegree.values()).reduce((a, b) => a + b, 0) / members.length;

    for (const [node, degree] of inDegree) {
      if (degree > avgInDegree * 2) { // Significantly higher than average
        centralNodes.push({
          accountId: node,
          inDegree: degree,
          outDegree: outDegree.get(node)
        });
      }
    }

    // Calculate density
    const maxPossibleEdges = members.length * (members.length - 1);
    const density = maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;

    // Calculate amount consistency
    const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const amountVariance = this._calculateVariance(amounts, avgAmount);
    const amountConsistency = avgAmount > 0 ? 1 - Math.min(amountVariance / avgAmount, 1) : 0;

    // Calculate temporal clustering
    const temporalClustering = this._calculateTemporalClustering(timestamps);

    return {
      density,
      centralNodes,
      avgAmount,
      amountConsistency,
      temporalClustering,
      totalVolume,
      internalEdges,
      avgInDegree
    };
  }

  /**
   * Calculate smurfing score based on community characteristics
   * @private
   */
  _calculateSmurfingScore(analysis) {
    // Weighted scoring system
    const weights = {
      density: 0.2,           // Dense connections
      centralNodes: 0.3,      // Clear beneficiaries
      amountConsistency: 0.25, // Similar amounts
      temporalClustering: 0.25 // Coordinated timing
    };

    const scores = {
      density: Math.min(analysis.density * 2, 1), // Normalize
      centralNodes: Math.min(analysis.centralNodes.length / 3, 1), // 3+ beneficiaries = max score
      amountConsistency: analysis.amountConsistency,
      temporalClustering: analysis.temporalClustering
    };

    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += scores[key] * weight;
    }

    return totalScore;
  }

  /**
   * Classify the type of smurfing pattern
   * @private
   */
  _classifySmurfingPattern(analysis) {
    const beneficiaryCount = analysis.centralNodes.length;
    const density = analysis.density;

    if (beneficiaryCount === 1 && density > 0.3) {
      return 'SINGLE_BENEFICIARY_SMURFING';
    } else if (beneficiaryCount > 1 && density > 0.4) {
      return 'MULTI_BENEFICIARY_RING';
    } else if (analysis.temporalClustering > 0.7) {
      return 'COORDINATED_BURST_SMURFING';
    } else if (analysis.amountConsistency > 0.8) {
      return 'STRUCTURED_SMURFING';
    } else {
      return 'DISTRIBUTED_SMURFING_NETWORK';
    }
  }

  /**
   * Calculate temporal clustering coefficient
   * @private
   */
  _calculateTemporalClustering(timestamps) {
    if (timestamps.length < 2) return 0;

    const sorted = [...timestamps].sort((a, b) => a - b);
    const intervals = [];

    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i] - sorted[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = this._calculateVariance(intervals, avgInterval);

    // Low variance = high clustering
    return avgInterval > 0 ? Math.max(0, 1 - (variance / avgInterval)) : 0;
  }

  /**
   * Calculate variance of an array
   * @private
   */
  _calculateVariance(values, mean) {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get consistent edge key for undirected graph
   * @private
   */
  _getEdgeKey(nodeA, nodeB) {
    return nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;
  }

  /**
   * Optimized cluster transactions by amount similarity
   */
  _clusterByAmountOptimized(transactions) {
    if (transactions.length === 0) return [];
    
    const clusters = [];
    const sorted = [...transactions].sort((a, b) => a.amount - b.amount);
    
    let currentCluster = {
      transactions: [sorted[0]],
      minAmount: sorted[0].amount,
      maxAmount: sorted[0].amount,
      avgAmount: sorted[0].amount,
      totalAmount: sorted[0].amount
    };
    
    for (let i = 1; i < sorted.length; i++) {
      const tx = sorted[i];
      const deviation = Math.abs(tx.amount - currentCluster.avgAmount) / currentCluster.avgAmount;
      
      if (deviation <= 0.15) { // Within 15% of cluster average
        currentCluster.transactions.push(tx);
        currentCluster.maxAmount = tx.amount;
        currentCluster.totalAmount += tx.amount;
        currentCluster.avgAmount = currentCluster.totalAmount / currentCluster.transactions.length;
      } else {
        if (currentCluster.transactions.length >= 3) {
          clusters.push(currentCluster);
          if (clusters.length >= 10) break; // Early termination
        }
        currentCluster = {
          transactions: [tx],
          minAmount: tx.amount,
          maxAmount: tx.amount,
          avgAmount: tx.amount,
          totalAmount: tx.amount
        };
      }
    }
    
    if (currentCluster.transactions.length >= 3) {
      clusters.push(currentCluster);
    }
    
    return clusters;
  }

  /**
   * Calculate time span of transactions in days
   */
  _calculateTimeSpan(transactions) {
    if (transactions.length === 0) return 0;
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const span = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    return (span / (1000 * 60 * 60 * 24)).toFixed(1) + ' days';
  }

  /**
   * Advanced: Detect wash trading using bidirectional flow analysis
   * Time Complexity: O(V * E) - optimized with early termination
   */
  detectWashTrading() {
    const washTrading = new Map();
    const accounts = this.graph.getAllAccounts();
    const MAX_WASH_TRADES = 10; // Limit per account for performance
    
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);
      
      if (outgoing.length < 5 || incoming.length < 5) continue;
      
      const washTrades = [];
      
      // Find bidirectional flows with similar amounts
      for (const outTx of outgoing) {
        if (washTrades.length >= MAX_WASH_TRADES) break;
        
        for (const inTx of incoming) {
          // Check if amounts are similar (within 10%)
          const amountDiff = Math.abs(outTx.amount - inTx.amount) / outTx.amount;
          if (amountDiff > 0.1) continue;
          
          // Check if counterparty is the same
          if (outTx.receiver_id === inTx.sender_id) {
            // Check time proximity (within 48 hours)
            const timeDiff = Math.abs(outTx.timestamp - inTx.timestamp) / (1000 * 60 * 60);
            if (timeDiff <= 48) {
              washTrades.push({
                counterparty: outTx.receiver_id,
                outAmount: outTx.amount,
                inAmount: inTx.amount,
                timeDiffHours: timeDiff.toFixed(1),
                amountDiff: (amountDiff * 100).toFixed(1) + '%'
              });
              
              if (washTrades.length >= MAX_WASH_TRADES) break;
            }
          }
        }
      }
      
      if (washTrades.length >= 3) {
        washTrading.set(accountId, {
          washTradeCount: washTrades.length,
          examples: washTrades.slice(0, 5)
        });
      }
    }
    
    return washTrading;
  }

  /**
   * Louvain Community Detection for Smurfing Rings
   * Identifies densely connected communities that represent coordinated fraud rings
   * Time Complexity: O(V * E) with optimizations
   * 
   * This is the industry-standard approach used by tier-1 financial institutions
   * because it finds the entire ring rather than flagging individual accounts,
   * dramatically reducing false positives.
   */
  detectSmurfingRingsLouvain() {
    console.log('Running Louvain community detection for smurfing rings...');
    const startTime = Date.now();
    
    // Step 1: Build undirected weighted graph
    const graph = this._buildWeightedGraph();
    
    // Step 2: Run Louvain algorithm
    const communities = this._louvainClustering(graph);
    
    // Step 3: Analyze communities for smurfing patterns
    const smurfingRings = this._analyzeCommunitiesForSmurfing(communities, graph);
    
    const endTime = Date.now();
    console.log(`Louvain detection completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`Found ${smurfingRings.length} potential smurfing rings`);
    
    return smurfingRings;
  }

  /**
   * Build weighted undirected graph from transaction data
   * Weight = transaction frequency + amount similarity
   * @private
   */
  _buildWeightedGraph() {
    const graph = {
      nodes: new Set(),
      edges: new Map(), // "nodeA-nodeB" -> weight
      neighbors: new Map() // nodeId -> Set of neighbor IDs
    };
    
    const accounts = this.graph.getAllAccounts();
    
    // Add all nodes
    accounts.forEach(acc => {
      graph.nodes.add(acc);
      graph.neighbors.set(acc, new Set());
    });
    
    // Build edges with weights
    for (const accountId of accounts) {
      const outgoing = this.graph.getOutgoingTransactions(accountId);
      const incoming = this.graph.getIncomingTransactions(accountId);
      
      // Process outgoing transactions
      const counterpartyWeights = new Map();
      
      for (const tx of outgoing) {
        const counterparty = tx.receiver_id;
        if (!counterpartyWeights.has(counterparty)) {
          counterpartyWeights.set(counterparty, { count: 0, totalAmount: 0, amounts: [] });
        }
        const data = counterpartyWeights.get(counterparty);
        data.count++;
        data.totalAmount += tx.amount;
        data.amounts.push(tx.amount);
      }
      
      // Process incoming transactions
      for (const tx of incoming) {
        const counterparty = tx.sender_id;
        if (!counterpartyWeights.has(counterparty)) {
          counterpartyWeights.set(counterparty, { count: 0, totalAmount: 0, amounts: [] });
        }
        const data = counterpartyWeights.get(counterparty);
        data.count++;
        data.totalAmount += tx.amount;
        data.amounts.push(tx.amount);
      }
      
      // Calculate edge weights
      for (const [counterparty, data] of counterpartyWeights) {
        const edgeKey = this._getEdgeKey(accountId, counterparty);
        
        // Weight formula: frequency * (1 + amount_consistency_bonus)
        const avgAmount = data.totalAmount / data.count;
        const amountVariance = this._calculateVariance(data.amounts, avgAmount);
        const consistencyBonus = amountVariance < (avgAmount * 0.2) ? 2 : 1; // Bonus for consistent amounts
        
        const weight = data.count * consistencyBonus;
        
        graph.edges.set(edgeKey, weight);
        graph.neighbors.get(accountId).add(counterparty);
        graph.neighbors.get(counterparty).add(accountId);
      }
    }
    
    return graph;
  }

  /**
   * Louvain algorithm implementation
   * @private
   */
  _louvainClustering(graph) {
    // Initialize: each node in its own community
    const nodeToCommunity = new Map();
    const communityNodes = new Map();
    let communityId = 0;
    
    for (const node of graph.nodes) {
      nodeToCommunity.set(node, communityId);
      communityNodes.set(communityId, new Set([node]));
      communityId++;
    }
    
    let improved = true;
    let iteration = 0;
    const maxIterations = 10;
    
    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;
      
      // Phase 1: Modularity optimization
      for (const node of graph.nodes) {
        const currentCommunity = nodeToCommunity.get(node);
        const neighbors = graph.neighbors.get(node);
        
        // Calculate modularity gain for moving to neighbor communities
        const communityGains = new Map();
        
        for (const neighbor of neighbors) {
          const neighborCommunity = nodeToCommunity.get(neighbor);
          if (neighborCommunity === currentCommunity) continue;
          
          const gain = this._calculateModularityGain(
            node, 
            currentCommunity, 
            neighborCommunity, 
            nodeToCommunity, 
            graph
          );
          
          if (!communityGains.has(neighborCommunity) || gain > communityGains.get(neighborCommunity)) {
            communityGains.set(neighborCommunity, gain);
          }
        }
        
        // Move to community with best gain
        let bestCommunity = currentCommunity;
        let bestGain = 0;
        
        for (const [community, gain] of communityGains) {
          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = community;
          }
        }
        
        if (bestCommunity !== currentCommunity && bestGain > 0) {
          // Move node to new community
          communityNodes.get(currentCommunity).delete(node);
          if (!communityNodes.has(bestCommunity)) {
            communityNodes.set(bestCommunity, new Set());
          }
          communityNodes.get(bestCommunity).add(node);
          nodeToCommunity.set(node, bestCommunity);
          improved = true;
        }
      }
    }
    
    // Convert to array format
    const communities = [];
    for (const [communityId, nodes] of communityNodes) {
      if (nodes.size > 0) {
        communities.push({
          id: communityId,
          members: Array.from(nodes),
          size: nodes.size
        });
      }
    }
    
    return communities;
  }

  /**
   * Calculate modularity gain for moving a node to a new community
   * @private
   */
  _calculateModularityGain(node, fromCommunity, toCommunity, nodeToCommunity, graph) {
    const neighbors = graph.neighbors.get(node);
    let internalEdges = 0;
    let externalEdges = 0;
    
    for (const neighbor of neighbors) {
      const edgeKey = this._getEdgeKey(node, neighbor);
      const weight = graph.edges.get(edgeKey) || 0;
      
      const neighborCommunity = nodeToCommunity.get(neighbor);
      if (neighborCommunity === toCommunity) {
        internalEdges += weight;
      } else if (neighborCommunity === fromCommunity) {
        externalEdges += weight;
      }
    }
    
    // Simplified modularity gain: favor moves that increase internal edges
    return internalEdges - externalEdges * 0.5;
  }

  /**
   * Analyze communities to identify smurfing patterns
   * @private
   */
  _analyzeCommunitiesForSmurfing(communities, graph) {
    const smurfingRings = [];
    
    for (const community of communities) {
      // Filter communities by size (smurfing rings typically have 5-50 accounts)
      // Lowered minimum to 3 for better detection of smaller rings
      if (community.size < 3 || community.size > 100) continue;
      
      // Analyze community structure
      const analysis = this._analyzeCommunityStructure(community, graph);
      
      // Smurfing indicators:
      // 1. High density (many connections within community)
      // 2. Central beneficiary (one account receives from many)
      // 3. Similar transaction amounts
      // 4. Temporal clustering (transactions happen in bursts)
      
      const smurfingScore = this._calculateSmurfingScore(analysis);
      
      if (smurfingScore > 0.25) { // Lowered threshold for better detection
        smurfingRings.push({
          communityId: community.id,
          members: community.members,
          size: community.size,
          smurfingScore: smurfingScore.toFixed(3),
          centralBeneficiaries: analysis.centralNodes,
          density: analysis.density.toFixed(3),
          avgTransactionAmount: analysis.avgAmount.toFixed(2),
          amountConsistency: analysis.amountConsistency.toFixed(3),
          temporalClustering: analysis.temporalClustering.toFixed(3),
          totalVolume: analysis.totalVolume.toFixed(2),
          pattern: this._classifySmurfingPattern(analysis)
        });
      }
    }
    
    // Sort by smurfing score (highest first)
    smurfingRings.sort((a, b) => parseFloat(b.smurfingScore) - parseFloat(a.smurfingScore));
    
    return smurfingRings;
  }

  /**
   * Analyze community structure for smurfing indicators
   * @private
   */
  _analyzeCommunityStructure(community, graph) {
    const members = community.members;
    const inDegree = new Map();
    const outDegree = new Map();
    const amounts = [];
    const timestamps = [];
    let totalVolume = 0;
    let internalEdges = 0;
    
    // Initialize degree maps
    members.forEach(m => {
      inDegree.set(m, 0);
      outDegree.set(m, 0);
    });
    
    // Calculate degrees and collect transaction data
    for (const member of members) {
      const outgoing = this.graph.getOutgoingTransactions(member);
      const incoming = this.graph.getIncomingTransactions(member);
      
      for (const tx of outgoing) {
        if (members.includes(tx.receiver_id)) {
          internalEdges++;
          outDegree.set(member, outDegree.get(member) + 1);
          inDegree.set(tx.receiver_id, inDegree.get(tx.receiver_id) + 1);
          amounts.push(tx.amount);
          timestamps.push(tx.timestamp);
          totalVolume += tx.amount;
        }
      }
    }
    
    // Find central nodes (high in-degree = beneficiaries)
    const centralNodes = [];
    const avgInDegree = Array.from(inDegree.values()).reduce((a, b) => a + b, 0) / members.length;
    
    for (const [node, degree] of inDegree) {
      if (degree > avgInDegree * 2) { // Significantly higher than average
        centralNodes.push({
          accountId: node,
          inDegree: degree,
          outDegree: outDegree.get(node)
        });
      }
    }
    
    // Calculate density
    const maxPossibleEdges = members.length * (members.length - 1);
    const density = maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;
    
    // Calculate amount consistency
    const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const amountVariance = this._calculateVariance(amounts, avgAmount);
    const amountConsistency = avgAmount > 0 ? 1 - Math.min(amountVariance / avgAmount, 1) : 0;
    
    // Calculate temporal clustering
    const temporalClustering = this._calculateTemporalClusteringCoefficient(timestamps);
    
    return {
      density,
      centralNodes,
      avgAmount,
      amountConsistency,
      temporalClustering,
      totalVolume,
      internalEdges,
      avgInDegree
    };
  }

  /**
   * Calculate smurfing score based on community characteristics
   * @private
   */
  _calculateSmurfingScore(analysis) {
    // Weighted scoring system
    const weights = {
      density: 0.25,           // Dense connections
      centralNodes: 0.25,      // Clear beneficiaries
      amountConsistency: 0.3,  // Similar amounts (increased weight)
      temporalClustering: 0.2  // Coordinated timing
    };
    
    const scores = {
      density: Math.min(analysis.density * 1.5, 1), // Normalize (lowered multiplier)
      centralNodes: Math.min(analysis.centralNodes.length / 2, 1), // 2+ beneficiaries = max score
      amountConsistency: analysis.amountConsistency,
      temporalClustering: analysis.temporalClustering
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += scores[key] * weight;
    }
    
    return totalScore;
  }

  /**
   * Classify the type of smurfing pattern
   * @private
   */
  _classifySmurfingPattern(analysis) {
    const beneficiaryCount = analysis.centralNodes.length;
    const density = analysis.density;
    
    // Prioritize amount consistency for structured smurfing
    if (analysis.amountConsistency > 0.85) {
      return 'STRUCTURED_SMURFING';
    } else if (analysis.temporalClustering > 0.7) {
      return 'COORDINATED_BURST_SMURFING';
    } else if (beneficiaryCount === 1 && density > 0.2) {
      return 'SINGLE_BENEFICIARY_SMURFING';
    } else if (beneficiaryCount > 1 && density > 0.3) {
      return 'MULTI_BENEFICIARY_RING';
    } else {
      return 'DISTRIBUTED_SMURFING_NETWORK';
    }
  }

  /**
   * Calculate temporal clustering coefficient
   * @private
   */
  _calculateTemporalClusteringCoefficient(timestamps) {
    if (timestamps.length < 2) return 0;
    
    const sorted = [...timestamps].sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i] - sorted[i - 1]);
    }
    
    if (intervals.length === 0) return 0;
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval === 0) return 1; // All at same time = perfect clustering
    
    const variance = this._calculateVariance(intervals, avgInterval);
    const coefficientOfVariation = Math.sqrt(variance) / avgInterval;
    
    // Low coefficient of variation = high clustering
    // CV < 0.5 is considered highly clustered
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

}
