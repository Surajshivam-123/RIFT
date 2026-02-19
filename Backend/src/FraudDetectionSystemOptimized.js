import { CSVParser } from './parser/CSVParser.js';
import { GraphAnalyzerEnhanced } from './analyzer/GraphAnalyzerEnhanced.js';
import { ScoreCalculatorEnhanced } from './scorer/ScoreCalculatorEnhanced.js';
import { JSONFormatter } from './formatter/JSONFormatter.js';
import { SuspiciousAccount } from './models/SuspiciousAccount.js';
import { FraudRing } from './models/FraudRing.js';

/**
 * Enhanced fraud detection system with 15 advanced detection algorithms
 * 
 * Key features:
 * - 15 sophisticated fraud detection patterns
 * - Optimized O(V + E) performance
 * - Progress callbacks for long-running operations
 * - Memory-efficient processing
 * - Enhanced scoring with 125 possible points
 */
export class FraudDetectionSystemOptimized {
  constructor(options = {}) {
    this.parser = new CSVParser();
    this.formatter = new JSONFormatter();
    this.options = {
      maxCycles: options.maxCycles || 1000,
      centralitySampleSize: options.centralitySampleSize || 500,
      progressCallback: options.progressCallback || null,
      ...options
    };
  }

  /**
   * Analyze transaction data from CSV and return JSON results
   * @param {string} csvContent - Raw CSV file content
   * @returns {string} JSON-formatted analysis results
   */
  analyze(csvContent) {
    const startTime = Date.now();

    this._reportProgress('Parsing CSV and building transaction graph...', 0);

    // Stage 1: Parse CSV and build transaction graph
    const graph = this.parser.parse(csvContent);
    const accounts = graph.getAllAccounts();

    this._reportProgress(`Graph built: ${accounts.length} accounts`, 10);

    // Stage 2: Analyze graph for all patterns using enhanced analyzer
    const analyzer = new GraphAnalyzerEnhanced(graph, this.options);

    this._reportProgress('Running comprehensive pattern detection...', 20);
    const allPatterns = analyzer.detectAllPatterns();

    // Stage 3: Calculate enhanced suspicion scores
    this._reportProgress('Calculating enhanced suspicion scores...', 80);
    const scorer = new ScoreCalculatorEnhanced(graph);
    const suspiciousAccounts = [];
    const accountScores = new Map();

    for (const accountId of accounts) {
      const score = scorer.calculateSuspicionScore(accountId, allPatterns);
      accountScores.set(accountId, score);

      const patterns = this._getDetectedPatternsForAccount(
        accountId,
        allPatterns
      );

      if (scorer.isSuspicious(score, patterns)) {
        suspiciousAccounts.push(
          new SuspiciousAccount(accountId, score, patterns, null)
        );
      }
    }

    // Stage 4: Identify fraud rings (including Louvain-detected rings)
    this._reportProgress('Identifying fraud rings...', 90);
    const suspiciousAccountIds = suspiciousAccounts.map(acc => acc.account_id);
    const rings = analyzer.identifyFraudRingsEnhanced(
      suspiciousAccountIds, 
      allPatterns.smurfingRingsLouvain
    );

    // Create fraud rings with risk scores and assign ring IDs to accounts
    const fraudRings = [];
    for (const ring of rings) {
      // Calculate risk score for the ring (pass the Map, not an array)
      const riskScore = scorer.calculateRingRiskScore(ring, accountScores);
      
      const fraudRing = new FraudRing(
        ring.ring_id,
        ring.member_accounts,
        ring.pattern_type,
        riskScore
      );
      
      // Copy additional Louvain metadata if present
      if (ring.detection_method) fraudRing.detection_method = ring.detection_method;
      if (ring.louvain_score) fraudRing.louvain_score = ring.louvain_score;
      if (ring.louvain_pattern) fraudRing.louvain_pattern = ring.louvain_pattern;
      if (ring.density) fraudRing.density = ring.density;
      if (ring.central_beneficiaries) fraudRing.central_beneficiaries = ring.central_beneficiaries;
      
      fraudRings.push(fraudRing);

      // Assign ring ID to member accounts
      for (const suspiciousAccount of suspiciousAccounts) {
        if (ring.member_accounts.includes(suspiciousAccount.account_id)) {
          suspiciousAccount.ring_id = ring.ring_id;
        }
      }
    }

    // Calculate processing time
    const endTime = Date.now();
    const processingTimeSeconds = (endTime - startTime) / 1000;

    // Stage 5: Format results as JSON
    this._reportProgress('Formatting results...', 95);
    const summary = {
      total_accounts_analyzed: accounts.length,
      suspicious_accounts_flagged: suspiciousAccounts.length,
      fraud_rings_detected: fraudRings.length,
      processing_time_seconds: processingTimeSeconds,
      cycles_detected: allPatterns.cycles.length,
      louvain_smurfing_rings_detected: allPatterns.smurfingRingsLouvain ? allPatterns.smurfingRingsLouvain.length : 0,
      patterns_analyzed: 25 // Updated to include Louvain detection
    };

    this._reportProgress('Complete!', 100);

    return this.formatter.format(suspiciousAccounts, fraudRings, summary);
  }

  /**
   * Report progress if callback is provided
   * @private
   */
  _reportProgress(message, percent) {
    if (this.options.progressCallback) {
      this.options.progressCallback(message, percent);
    }
  }

  /**
   * Get list of detected pattern names for an account
   * @private
   */
  _getDetectedPatternsForAccount(accountId, allPatterns) {
    const patterns = [];

    // Check for cycle participation
    const accountCycles = allPatterns.cycles.filter(cycle =>
      cycle.accounts.includes(accountId)
    );
    if (accountCycles.length > 0) {
      patterns.push('cycle');
    }

    // Check for fan-out
    if (allPatterns.fanOut.has(accountId)) {
      patterns.push('fan_out');
    }

    // Check for fan-in
    if (allPatterns.fanIn.has(accountId)) {
      patterns.push('fan_in');
    }

    // Check for shell account
    if (allPatterns.shellAccounts.has(accountId)) {
      patterns.push('shell_account');
    }

    // Check for passthrough
    if (allPatterns.passthrough.has(accountId)) {
      patterns.push('passthrough');
    }

    // Check for structuring
    if (allPatterns.structuring.has(accountId)) {
      patterns.push('structuring');
    }

    // Check for threshold avoidance
    if (allPatterns.thresholdAvoidance.has(accountId)) {
      patterns.push('threshold_avoidance');
    }

    // Enhanced patterns
    if (allPatterns.velocityAnomalies && allPatterns.velocityAnomalies.has(accountId)) {
      patterns.push('velocity_anomaly');
    }

    if (allPatterns.amountAnomalies && allPatterns.amountAnomalies.has(accountId)) {
      patterns.push('amount_anomaly');
    }

    if (allPatterns.unusualTiming && allPatterns.unusualTiming.has(accountId)) {
      patterns.push('unusual_timing');
    }

    if (allPatterns.burstActivity && allPatterns.burstActivity.has(accountId)) {
      patterns.push('burst_activity');
    }

    if (allPatterns.dormancyReactivation && allPatterns.dormancyReactivation.has(accountId)) {
      patterns.push('dormancy_reactivation');
    }

    if (allPatterns.amountSplitting && allPatterns.amountSplitting.has(accountId)) {
      patterns.push('amount_splitting');
    }

    if (allPatterns.frequencyAnomalies && allPatterns.frequencyAnomalies.has(accountId)) {
      patterns.push('frequency_anomaly');
    }

    if (allPatterns.networkInfluence && allPatterns.networkInfluence.has(accountId)) {
      patterns.push('network_influence');
    }

    // New advanced patterns
    if (allPatterns.roundTripTransactions && allPatterns.roundTripTransactions.has(accountId)) {
      patterns.push('round_trip');
    }

    if (allPatterns.layeringDepth && allPatterns.layeringDepth.has(accountId)) {
      patterns.push('layering');
    }

    if (allPatterns.counterpartyDiversity && allPatterns.counterpartyDiversity.has(accountId)) {
      patterns.push('low_diversity');
    }

    if (allPatterns.amountProgression && allPatterns.amountProgression.has(accountId)) {
      patterns.push('amount_progression');
    }

    if (allPatterns.temporalClustering && allPatterns.temporalClustering.has(accountId)) {
      patterns.push('temporal_clustering');
    }

    // Deep analysis patterns (high-evidence)
    if (allPatterns.moneyLaunderingChains && allPatterns.moneyLaunderingChains.has(accountId)) {
      patterns.push('money_laundering_chain');
    }

    if (allPatterns.coordinatedBehavior && allPatterns.coordinatedBehavior.has(accountId)) {
      patterns.push('coordinated_behavior');
    }

    if (allPatterns.smurfingPatterns && allPatterns.smurfingPatterns.has(accountId)) {
      patterns.push('smurfing_pattern');
    }

    if (allPatterns.washTrading && allPatterns.washTrading.has(accountId)) {
      patterns.push('wash_trading');
    }

    // Louvain community detection (smurfing rings)
    if (allPatterns.smurfingRingsLouvain && Array.isArray(allPatterns.smurfingRingsLouvain)) {
      const memberOfRing = allPatterns.smurfingRingsLouvain.find(ring => 
        ring.members.includes(accountId)
      );
      if (memberOfRing) {
        patterns.push('louvain_smurfing_ring');
        // Add pattern type for more specific detection
        patterns.push(`louvain_${memberOfRing.pattern.toLowerCase()}`);
      }
    }

    return patterns;
  }

  /**
   * Serialize analysis results to JSON
   * @param {Array<SuspiciousAccount>} suspiciousAccounts - Suspicious accounts
   * @param {Array<FraudRing>} fraudRings - Fraud rings
   * @param {Object} summary - Analysis summary
   * @returns {Object} JSON representation
   */
  static toJSON(suspiciousAccounts, fraudRings, summary) {
    return {
      suspicious_accounts: suspiciousAccounts.map(acc => acc.toJSON()),
      fraud_rings: fraudRings.map(ring => ring.toJSON()),
      summary: {
        total_accounts_analyzed: summary.total_accounts_analyzed,
        suspicious_accounts_flagged: summary.suspicious_accounts_flagged,
        fraud_rings_detected: summary.fraud_rings_detected,
        processing_time_seconds: parseFloat(summary.processing_time_seconds.toFixed(1)),
        cycles_detected: summary.cycles_detected || 0,
        patterns_analyzed: summary.patterns_analyzed || 24
      }
    };
  }

  /**
   * Deserialize analysis results from JSON
   * @param {Object} json - JSON object
   * @returns {Object} Deserialized analysis results
   */
  static fromJSON(json) {
    const suspiciousAccounts = json.suspicious_accounts.map(acc =>
      SuspiciousAccount.fromJSON(acc)
    );

    const fraudRings = json.fraud_rings.map(ring =>
      FraudRing.fromJSON(ring)
    );

    const summary = {
      total_accounts_analyzed: json.summary.total_accounts_analyzed,
      suspicious_accounts_flagged: json.summary.suspicious_accounts_flagged,
      fraud_rings_detected: json.summary.fraud_rings_detected,
      processing_time_seconds: json.summary.processing_time_seconds,
      cycles_detected: json.summary.cycles_detected || 0,
      patterns_analyzed: json.summary.patterns_analyzed || 24
    };

    return {
      suspiciousAccounts,
      fraudRings,
      summary
    };
  }
}
