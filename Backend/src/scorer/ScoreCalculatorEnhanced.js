/**
 * Enhanced Score Calculator with Advanced Fraud Scoring
 * 
 * Incorporates new pattern types for better fraud detection
 */

export class ScoreCalculatorEnhanced {
  constructor(transactionGraph) {
    this.graph = transactionGraph;
  }

  /**
   * Calculate enhanced suspicion score
   * @param {string} accountId - Account ID
   * @param {Object} patterns - All detected patterns
   * @returns {number} Suspicion score (0-100)
   */
  calculateSuspicionScore(accountId, patterns) {
    let score = 0;
    
    // Original patterns (40 points max)
    score += this._scoreCycles(accountId, patterns.cycles);
    score += this._scoreFanOut(accountId, patterns.fanOut);
    score += this._scoreFanIn(accountId, patterns.fanIn);
    score += this._scoreShellAccount(accountId, patterns.shellAccounts);
    score += this._scorePassthrough(accountId, patterns.passthrough);
    score += this._scoreStructuring(accountId, patterns.structuring);
    score += this._scoreThresholdAvoidance(accountId, patterns.thresholdAvoidance);
    
    // Enhanced patterns (60 points max)
    score += this._scoreVelocityAnomaly(accountId, patterns.velocityAnomalies);
    score += this._scoreAmountAnomaly(accountId, patterns.amountAnomalies);
    score += this._scoreUnusualTiming(accountId, patterns.unusualTiming);
    score += this._scoreBurstActivity(accountId, patterns.burstActivity);
    score += this._scoreDormancy(accountId, patterns.dormancyReactivation);
    score += this._scoreAmountSplitting(accountId, patterns.amountSplitting);
    score += this._scoreFrequencyAnomaly(accountId, patterns.frequencyAnomalies);
    score += this._scoreNetworkInfluence(accountId, patterns.networkInfluence);
    
    // New advanced patterns (additional 25 points max)
    score += this._scoreRoundTrips(accountId, patterns.roundTripTransactions);
    score += this._scoreLayering(accountId, patterns.layeringDepth);
    score += this._scoreCounterpartyDiversity(accountId, patterns.counterpartyDiversity);
    score += this._scoreAmountProgression(accountId, patterns.amountProgression);
    score += this._scoreTemporalClustering(accountId, patterns.temporalClustering);
    
    // Deep analysis patterns (additional 40 points max - high evidence)
    score += this._scoreMoneyLaunderingChains(accountId, patterns.moneyLaunderingChains);
    score += this._scoreCoordinatedBehavior(accountId, patterns.coordinatedBehavior);
    score += this._scoreSmurfingPatterns(accountId, patterns.smurfingPatterns);
    score += this._scoreWashTrading(accountId, patterns.washTrading);
    
    // Louvain community detection (additional 40 points max - industry-standard algorithm)
    score += this._scoreLouvainSmurfingRings(accountId, patterns.smurfingRingsLouvain);
    
    // Apply legitimacy penalties
    score += this._calculateLegitimacyPenalty(accountId);
    
    // Clamp to [0, 100]
    return Math.max(0, Math.min(100, score));
  }

  // Original pattern scoring
  _scoreCycles(accountId, cycles) {
    const accountCycles = cycles.filter(c => c.accounts.includes(accountId));
    if (accountCycles.length === 0) return 0;
    
    const lengths = accountCycles.map(c => c.length);
    const minLength = Math.min(...lengths);
    
    const points = { 3: 35, 4: 28, 5: 22 }; // Reduced from 40/32/25
    return points[minLength] || 0;
  }

  _scoreFanOut(accountId, fanOut) {
    if (!fanOut.has(accountId)) return 0;
    const count = fanOut.get(accountId).receiver_count;
    return Math.min(18, 12 + Math.floor((count - 15) * 0.6)); // Reduced from 22/15
  }

  _scoreFanIn(accountId, fanIn) {
    if (!fanIn.has(accountId)) return 0;
    const count = fanIn.get(accountId).sender_count;
    return Math.min(18, 12 + Math.floor((count - 15) * 0.6)); // Reduced from 22/15
  }

  _scoreShellAccount(accountId, shells) {
    return shells.has(accountId) ? 12 : 0; // Reduced from 15
  }

  _scorePassthrough(accountId, passthrough) {
    if (!passthrough.has(accountId)) return 0;
    const count = passthrough.get(accountId).length;
    if (count >= 10) return 8; // Reduced from 10
    if (count >= 5) return 6; // Reduced from 7
    return 4; // Reduced from 5
  }

  _scoreStructuring(accountId, structuring) {
    if (!structuring.has(accountId)) return 0;
    const pct = structuring.get(accountId).round_number_percentage;
    if (pct >= 0.90) return 8;
    if (pct >= 0.80) return 6;
    return 5;
  }

  _scoreThresholdAvoidance(accountId, threshold) {
    if (!threshold.has(accountId)) return 0;
    const clustering = threshold.get(accountId).clustering_consistency;
    if (clustering >= 0.80) return 8;
    if (clustering >= 0.60) return 6;
    return 5;
  }

  // Enhanced pattern scoring
  _scoreVelocityAnomaly(accountId, velocityAnomalies) {
    if (!velocityAnomalies.has(accountId)) return 0;
    const velocity = parseFloat(velocityAnomalies.get(accountId).velocity);
    if (velocity > 15) return 10; // Reduced from 12, increased threshold
    if (velocity > 10) return 7; // Reduced from 8
    return 4; // Reduced from 5
  }

  _scoreAmountAnomaly(accountId, amountAnomalies) {
    if (!amountAnomalies.has(accountId)) return 0;
    const ratio = parseFloat(amountAnomalies.get(accountId).outlierRatio);
    if (ratio > 0.7) return 8; // Reduced from 10
    if (ratio > 0.5) return 6; // Reduced from 7
    return 4; // Reduced from 5
  }

  _scoreUnusualTiming(accountId, unusualTiming) {
    if (!unusualTiming.has(accountId)) return 0;
    const pattern = unusualTiming.get(accountId);
    const nightRatio = parseFloat(pattern.nightRatio);
    const weekendRatio = parseFloat(pattern.weekendRatio);
    
    let points = 0;
    if (nightRatio > 0.7) points += 5; // Reduced from 6
    else if (nightRatio > 0.5) points += 3; // Reduced from 4
    
    if (weekendRatio > 0.8) points += 3; // Reduced from 4
    else if (weekendRatio > 0.7) points += 2;
    
    return Math.min(7, points); // Reduced from 8
  }

  _scoreBurstActivity(accountId, burstActivity) {
    if (!burstActivity.has(accountId)) return 0;
    const burst = burstActivity.get(accountId);
    if (burst.maxBurstSize >= 10) return 8; // Reduced from 10
    if (burst.maxBurstSize >= 5) return 6; // Reduced from 7
    return 4; // Reduced from 5
  }

  _scoreDormancy(accountId, dormancy) {
    if (!dormancy.has(accountId)) return 0;
    const days = parseFloat(dormancy.get(accountId).dormancyDays);
    const txsAfter = dormancy.get(accountId).txsAfterReactivation;
    
    if (days > 180 && txsAfter > 10) return 10; // Reduced from 12
    if (days > 90 && txsAfter > 5) return 7; // Reduced from 8
    if (days > 30) return 4; // Reduced from 5
    return 0;
  }

  _scoreAmountSplitting(accountId, splitting) {
    if (!splitting.has(accountId)) return 0;
    const splitCount = splitting.get(accountId).splitCount;
    if (splitCount >= 10) return 8; // Reduced from 10
    if (splitCount >= 5) return 6; // Reduced from 7
    return 4; // Reduced from 5
  }

  _scoreFrequencyAnomaly(accountId, frequency) {
    if (!frequency.has(accountId)) return 0;
    const txsPerDay = parseFloat(frequency.get(accountId).txsPerDay);
    if (txsPerDay > 50) return 8; // Reduced from 10
    if (txsPerDay > 20) return 6; // Reduced from 7
    return 4; // Reduced from 5
  }

  _scoreNetworkInfluence(accountId, influence) {
    if (!influence.has(accountId)) return 0;
    const score = parseFloat(influence.get(accountId).influenceScore);
    if (score > 0.8) return 6; // Reduced from 8
    if (score > 0.6) return 4; // Reduced from 5
    return 2; // Reduced from 3
  }

  // New advanced pattern scoring
  _scoreRoundTrips(accountId, roundTrips) {
    if (!roundTrips.has(accountId)) return 0;
    const count = roundTrips.get(accountId).roundTripCount;
    if (count >= 5) return 8; // Many round trips
    if (count >= 3) return 5;
    return 3;
  }

  _scoreLayering(accountId, layering) {
    if (!layering.has(accountId)) return 0;
    const depth = layering.get(accountId).maxLayerDepth;
    const complexity = layering.get(accountId).chainComplexity;
    
    let points = 0;
    if (depth >= 6) points += 5;
    else if (depth >= 5) points += 3;
    else points += 2;
    
    if (complexity > 50) points += 2;
    
    return Math.min(7, points);
  }

  _scoreCounterpartyDiversity(accountId, diversity) {
    if (!diversity.has(accountId)) return 0;
    const ratio = parseFloat(diversity.get(accountId).diversityRatio);
    const concentration = parseFloat(diversity.get(accountId).topCounterpartyConcentration);
    
    let points = 0;
    if (ratio < 0.2) points += 4; // Very low diversity
    else if (ratio < 0.3) points += 2;
    
    if (concentration > 0.7) points += 2; // High concentration
    
    return Math.min(6, points);
  }

  _scoreAmountProgression(accountId, progression) {
    if (!progression.has(accountId)) return 0;
    const pattern = progression.get(accountId);
    const strength = parseFloat(pattern.trendStrength);
    const multiplier = parseFloat(pattern.multiplier);
    
    if (pattern.pattern === 'escalating' && multiplier > 10) return 6; // Rapid escalation
    if (pattern.pattern === 'escalating' && multiplier > 5) return 4;
    if (strength > 0.8) return 3; // Strong trend
    return 2;
  }

  _scoreTemporalClustering(accountId, clustering) {
    if (!clustering.has(accountId)) return 0;
    const concentration = parseFloat(clustering.get(accountId).peakConcentration);
    const pattern = clustering.get(accountId).pattern;
    
    if (pattern === 'single-hour' && concentration > 0.7) return 5; // Highly automated
    if (concentration > 0.6) return 3;
    return 2;
  }

  // Deep analysis pattern scoring (high-evidence patterns)
  _scoreMoneyLaunderingChains(accountId, chains) {
    if (!chains.has(accountId)) return 0;
    const data = chains.get(accountId);
    const chainLength = data.longestChainLength;
    const chainCount = data.chainCount;
    
    let points = 0;
    if (chainLength >= 7) points += 12; // Very deep layering
    else if (chainLength >= 6) points += 8;
    else if (chainLength >= 5) points += 5;
    
    if (chainCount >= 10) points += 3; // Multiple chains
    
    return Math.min(15, points);
  }

  _scoreCoordinatedBehavior(accountId, coordinated) {
    if (!coordinated.has(accountId)) return 0;
    const count = coordinated.get(accountId).correlatedCount;
    
    if (count >= 5) return 10; // Highly coordinated
    if (count >= 3) return 7;
    return 5;
  }

  _scoreSmurfingPatterns(accountId, smurfing) {
    if (!smurfing.has(accountId)) return 0;
    const clusterCount = smurfing.get(accountId).clusterCount;
    
    if (clusterCount >= 5) return 10; // Extensive smurfing
    if (clusterCount >= 3) return 7;
    return 5;
  }

  _scoreWashTrading(accountId, washTrading) {
    if (!washTrading.has(accountId)) return 0;
    const count = washTrading.get(accountId).washTradeCount;
    
    if (count >= 10) return 10; // Extensive wash trading
    if (count >= 5) return 7;
    return 5;
  }

  /**
   * Score Louvain community detection (smurfing rings)
   * This is high-confidence detection from industry-standard algorithm
   */
  _scoreLouvainSmurfingRings(accountId, smurfingRingsLouvain) {
    if (!smurfingRingsLouvain || !Array.isArray(smurfingRingsLouvain)) return 0;
    
    // Find if account is member of any detected ring
    const memberRing = smurfingRingsLouvain.find(ring => 
      ring.members.includes(accountId)
    );
    
    if (!memberRing) return 0;
    
    // Base score from smurfing score (0-1 scale)
    const smurfingScore = parseFloat(memberRing.smurfingScore);
    let score = smurfingScore * 20; // Max 20 points from base score
    
    // Bonus for being a central beneficiary
    const isBeneficiary = memberRing.centralBeneficiaries.some(
      ben => ben.accountId === accountId
    );
    if (isBeneficiary) {
      score += 15; // High confidence - central beneficiary
    } else {
      score += 10; // Member of ring
    }
    
    // Bonus based on pattern type (some patterns are higher confidence)
    const patternBonuses = {
      'STRUCTURED_SMURFING': 5,           // Very high confidence
      'COORDINATED_BURST_SMURFING': 4,    // High confidence
      'SINGLE_BENEFICIARY_SMURFING': 3,   // High confidence
      'MULTI_BENEFICIARY_RING': 4,        // High confidence
      'DISTRIBUTED_SMURFING_NETWORK': 2   // Medium confidence
    };
    score += patternBonuses[memberRing.pattern] || 0;
    
    // Bonus for high-density rings (more interconnected = higher confidence)
    const density = parseFloat(memberRing.density);
    if (density > 0.5) score += 3;
    else if (density > 0.3) score += 2;
    
    // Bonus for high amount consistency
    const amountConsistency = parseFloat(memberRing.amountConsistency);
    if (amountConsistency > 0.8) score += 3;
    
    return Math.min(40, score); // Cap at 40 points (high-confidence detection)
  }

  _calculateLegitimacyPenalty(accountId) {
    const incoming = this.graph.getIncomingTransactions(accountId);
    const outgoing = this.graph.getOutgoingTransactions(accountId);
    const totalTxs = incoming.length + outgoing.length;
    
    let penalty = 0;
    
    // Payroll pattern (regular outgoing payments)
    if (outgoing.length >= 10) {
      const amounts = outgoing.map(tx => tx.amount);
      const uniqueAmounts = new Set(amounts);
      
      // Check for regular timing
      const sortedOut = [...outgoing].sort((a, b) => a.timestamp - b.timestamp);
      const intervals = [];
      for (let i = 1; i < sortedOut.length; i++) {
        const days = (sortedOut[i].timestamp - sortedOut[i-1].timestamp) / (1000 * 60 * 60 * 24);
        intervals.push(days);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const isRegular = avgInterval >= 6 && avgInterval <= 31; // Weekly to monthly
      
      if (uniqueAmounts.size <= 3 && isRegular) penalty -= 25;
      else if (uniqueAmounts.size <= 3) penalty -= 15;
    }
    
    // Merchant pattern (many small incoming)
    if (incoming.length >= 20) {
      const avgAmount = incoming.reduce((sum, tx) => sum + tx.amount, 0) / incoming.length;
      const uniqueSenders = new Set(incoming.map(tx => tx.sender_id));
      const senderDiversity = uniqueSenders.size / incoming.length;
      
      if (avgAmount < 100 && senderDiversity > 0.5) penalty -= 20;
      else if (avgAmount < 100) penalty -= 10;
    }
    
    // Utility pattern (regular same receiver)
    if (outgoing.length >= 5) {
      const receivers = outgoing.map(tx => tx.receiver_id);
      const uniqueReceivers = new Set(receivers);
      
      if (uniqueReceivers.size === 1) {
        // Check for regular intervals
        const sortedOut = [...outgoing].sort((a, b) => a.timestamp - b.timestamp);
        const intervals = [];
        for (let i = 1; i < sortedOut.length; i++) {
          const days = (sortedOut[i].timestamp - sortedOut[i-1].timestamp) / (1000 * 60 * 60 * 24);
          intervals.push(days);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const isRegular = variance < 100; // Low variance = regular
        
        if (isRegular) penalty -= 15;
        else penalty -= 8;
      }
    }
    
    // Business account pattern (high volume, balanced, diverse)
    if (totalTxs > 50) {
      const incomingTotal = incoming.reduce((sum, tx) => sum + tx.amount, 0);
      const outgoingTotal = outgoing.reduce((sum, tx) => sum + tx.amount, 0);
      const ratio = outgoingTotal > 0 ? incomingTotal / outgoingTotal : 0;
      
      const uniqueCounterparties = new Set([
        ...incoming.map(tx => tx.sender_id),
        ...outgoing.map(tx => tx.receiver_id)
      ]);
      const diversity = uniqueCounterparties.size / totalTxs;
      
      // Balanced business activity
      if (ratio >= 0.5 && ratio <= 2.0 && diversity > 0.3) {
        penalty -= 20;
      }
    }
    
    // Savings transfer pattern (regular transfers to same account)
    if (outgoing.length >= 3 && outgoing.length <= 20) {
      const receivers = outgoing.map(tx => tx.receiver_id);
      const uniqueReceivers = new Set(receivers);
      
      if (uniqueReceivers.size === 1) {
        const amounts = outgoing.map(tx => tx.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const amountVariance = amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length;
        const isConsistent = amountVariance / (avgAmount * avgAmount) < 0.1; // Low coefficient of variation
        
        if (isConsistent) penalty -= 15;
      }
    }
    
    return penalty;
  }

  isSuspicious(score, patterns) {
    // Multi-signal requirement to reduce false positives
    if (score >= 80) return true; // Very high confidence
    if (score >= 70 && patterns.length >= 3) return true; // High confidence with multiple signals
    if (score >= 60 && patterns.includes('cycle') && patterns.length >= 3) return true; // Cycle + other patterns
    if (score >= 50 && patterns.includes('cycle') && patterns.length >= 4) return true; // Strong multi-signal
    return false;
  }

  calculateRingRiskScore(ring, memberScores) {
    const scores = ring.member_accounts.map(acc => memberScores.get(acc) || 0);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sizeMultiplier = 1.0 + (0.1 * Math.min(ring.member_accounts.length - 2, 8));
    
    return (0.6 * maxScore) + (0.4 * avgScore) * sizeMultiplier;
  }
}
