/**
 * Represents an account flagged as suspicious
 */
export class SuspiciousAccount {
  /**
   * @param {string} accountId - Account identifier
   * @param {number} suspicionScore - Suspicion score (0-100)
   * @param {Array<string>} detectedPatterns - List of detected fraud patterns
   * @param {string|null} ringId - Associated fraud ring ID (if any)
   */
  constructor(accountId, suspicionScore, detectedPatterns, ringId = null) {
    this.account_id = accountId;
    this.suspicion_score = suspicionScore;
    this.detected_patterns = detectedPatterns;
    this.ring_id = ringId;
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      account_id: this.account_id,
      suspicion_score: parseFloat(this.suspicion_score.toFixed(1)),
      detected_patterns: [...this.detected_patterns],
      ring_id: this.ring_id
    };
  }

  /**
   * Deserialize from JSON
   * @param {Object} json - JSON object
   * @returns {SuspiciousAccount} SuspiciousAccount instance
   */
  static fromJSON(json) {
    return new SuspiciousAccount(
      json.account_id,
      json.suspicion_score,
      json.detected_patterns,
      json.ring_id
    );
  }
}
