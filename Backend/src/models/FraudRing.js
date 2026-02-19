/**
 * Represents a group of connected suspicious accounts
 */
export class FraudRing {
  /**
   * @param {string} ringId - Unique ring identifier
   * @param {Array<string>} memberAccounts - List of member account IDs
   * @param {string} patternType - Pattern type: 'cycle', 'smurfing', 'shell_chain', or 'hybrid'
   * @param {number} riskScore - Ring risk score
   */
  constructor(ringId, memberAccounts, patternType, riskScore) {
    this.ring_id = ringId;
    this.member_accounts = memberAccounts;
    this.pattern_type = patternType;
    this.risk_score = riskScore;
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      ring_id: this.ring_id,
      member_accounts: [...this.member_accounts],
      pattern_type: this.pattern_type,
      risk_score: parseFloat(this.risk_score.toFixed(1))
    };
  }

  /**
   * Deserialize from JSON
   * @param {Object} json - JSON object
   * @returns {FraudRing} FraudRing instance
   */
  static fromJSON(json) {
    return new FraudRing(
      json.ring_id,
      json.member_accounts,
      json.pattern_type,
      json.risk_score
    );
  }
}
