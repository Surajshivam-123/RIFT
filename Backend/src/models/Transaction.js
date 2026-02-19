/**
 * Represents a financial transaction between two accounts
 */
export class Transaction {
  /**
   * @param {string} transactionId - Unique transaction identifier
   * @param {string} senderId - Sender account ID
   * @param {string} receiverId - Receiver account ID
   * @param {number} amount - Transaction amount
   * @param {Date} timestamp - Transaction timestamp
   */
  constructor(transactionId, senderId, receiverId, amount, timestamp) {
    this.transaction_id = transactionId;
    this.sender_id = senderId;
    this.receiver_id = receiverId;
    this.amount = amount;
    this.timestamp = timestamp;
  }

  /**
   * Serialize transaction to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      transaction_id: this.transaction_id,
      sender_id: this.sender_id,
      receiver_id: this.receiver_id,
      amount: this.amount,
      timestamp: this.timestamp.toISOString()
    };
  }

  /**
   * Deserialize transaction from JSON
   * @param {Object} json - JSON object
   * @returns {Transaction} Transaction instance
   */
  static fromJSON(json) {
    return new Transaction(
      json.transaction_id,
      json.sender_id,
      json.receiver_id,
      json.amount,
      new Date(json.timestamp)
    );
  }
}
