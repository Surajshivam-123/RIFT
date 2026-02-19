/**
 * Represents a group of connected suspicious accounts
 */
export class FraudRing {
  /**
   * @param {string} ringId - Unique ring identifier
   * @param {Array<string>} memberAccounts - List of member account IDs
   * @param {string} patternType - Pattern type: 'cycle', 'smurfing', 'shell_chain', or 'hybrid'
   * @param {number} riskScore - Risk score for the ring (0-100)
   */
  constructor(ringId, memberAccounts, patternType, riskScore = 0) {
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
    const json = {
      ring_id: this.ring_id,
      member_accounts: [...this.member_accounts],
      pattern_type: this.pattern_type,
      risk_score: parseFloat((this.risk_score || 0).toFixed(1))
    };
    
    // Include optional Louvain fields if present
    if (this.detection_method) json.detection_method = this.detection_method;
    if (this.louvain_score) json.louvain_score = this.louvain_score;
    if (this.louvain_pattern) json.louvain_pattern = this.louvain_pattern;
    if (this.density) json.density = this.density;
    if (this.central_beneficiaries) json.central_beneficiaries = this.central_beneficiaries;
    
    return json;
  }

  /**
   * Deserialize from JSON
   * @param {Object} json - JSON object
   * @returns {FraudRing} FraudRing instance
   */
  static fromJSON(json) {
    const ring = new FraudRing(
      json.ring_id,
      json.member_accounts,
      json.pattern_type,
      json.risk_score || 0
    );
    
    // Restore optional fields
    if (json.detection_method) ring.detection_method = json.detection_method;
    if (json.louvain_score) ring.louvain_score = json.louvain_score;
    if (json.louvain_pattern) ring.louvain_pattern = json.louvain_pattern;
    if (json.density) ring.density = json.density;
    if (json.central_beneficiaries) ring.central_beneficiaries = json.central_beneficiaries;
    
    return ring;
  }
}
