/**
 * Formats fraud detection analysis results as JSON
 */
export class JSONFormatter {
  /**
   * Format complete analysis results as JSON
   * @param {Array<SuspiciousAccount>} suspiciousAccounts - List of suspicious accounts
   * @param {Array<FraudRing>} fraudRings - List of fraud rings
   * @param {Object} summary - Analysis summary statistics
   * @param {number} summary.total_accounts_analyzed - Total number of accounts analyzed
   * @param {number} summary.suspicious_accounts_flagged - Number of suspicious accounts
   * @param {number} summary.fraud_rings_detected - Number of fraud rings detected
   * @param {number} summary.processing_time_seconds - Processing time in seconds
   * @returns {string} JSON-formatted results
   */
  format(suspiciousAccounts, fraudRings, summary) {
    // Sort suspicious accounts by suspicion_score in descending order
    const sortedAccounts = [...suspiciousAccounts].sort(
      (a, b) => b.suspicion_score - a.suspicion_score
    );

    // Build the output structure
    const output = {
      suspicious_accounts: sortedAccounts.map(account => ({
        account_id: account.account_id,
        suspicion_score: parseFloat(account.suspicion_score.toFixed(1)),
        detected_patterns: [...account.detected_patterns],
        ring_id: account.ring_id
      })),
      fraud_rings: fraudRings.map(ring => {
        const ringData = {
          ring_id: ring.ring_id,
          member_accounts: [...ring.member_accounts],
          pattern_type: ring.pattern_type,
          risk_score: parseFloat((ring.risk_score || 0).toFixed(1))
        };
        
        // Add optional fields if present
        if (ring.detection_method) ringData.detection_method = ring.detection_method;
        if (ring.louvain_score) ringData.louvain_score = ring.louvain_score;
        if (ring.louvain_pattern) ringData.louvain_pattern = ring.louvain_pattern;
        if (ring.density) ringData.density = ring.density;
        if (ring.central_beneficiaries) ringData.central_beneficiaries = ring.central_beneficiaries;
        
        return ringData;
      }),
      summary: {
        total_accounts_analyzed: summary.total_accounts_analyzed,
        suspicious_accounts_flagged: summary.suspicious_accounts_flagged,
        fraud_rings_detected: summary.fraud_rings_detected,
        processing_time_seconds: parseFloat(summary.processing_time_seconds.toFixed(1)),
        cycles_detected: summary.cycles_detected || 0,
        louvain_smurfing_rings_detected: summary.louvain_smurfing_rings_detected || 0,
        patterns_analyzed: summary.patterns_analyzed || 0
      }
    };

    return JSON.stringify(output, null, 2);
  }
}
