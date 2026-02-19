/**
 * Pattern type definitions for fraud detection
 */

/**
 * Cycle pattern - funds flow in a loop
 */
export class Cycle {
  /**
   * @param {Array<string>} accounts - Accounts participating in cycle
   * @param {number} length - Cycle length (3, 4, or 5)
   */
  constructor(accounts, length) {
    this.accounts = accounts;
    this.length = length;
  }
}

/**
 * Fan-out pattern - one sender to many receivers
 */
export class FanOutPattern {
  /**
   * @param {string} senderId - Sender account ID
   * @param {number} receiverCount - Number of distinct receivers
   * @param {Date} windowStart - Time window start
   * @param {Date} windowEnd - Time window end
   */
  constructor(senderId, receiverCount, windowStart, windowEnd) {
    this.sender_id = senderId;
    this.receiver_count = receiverCount;
    this.window_start = windowStart;
    this.window_end = windowEnd;
  }
}

/**
 * Fan-in pattern - many senders to one receiver
 */
export class FanInPattern {
  /**
   * @param {string} receiverId - Receiver account ID
   * @param {number} senderCount - Number of distinct senders
   * @param {Date} windowStart - Time window start
   * @param {Date} windowEnd - Time window end
   */
  constructor(receiverId, senderCount, windowStart, windowEnd) {
    this.receiver_id = receiverId;
    this.sender_count = senderCount;
    this.window_start = windowStart;
    this.window_end = windowEnd;
  }
}

/**
 * Passthrough event - funds received and forwarded quickly
 */
export class PassthroughEvent {
  /**
   * @param {string} incomingTransactionId - Incoming transaction ID
   * @param {string} outgoingTransactionId - Outgoing transaction ID
   * @param {number} timeDeltaHours - Time between transactions in hours
   */
  constructor(incomingTransactionId, outgoingTransactionId, timeDeltaHours) {
    this.incoming_transaction_id = incomingTransactionId;
    this.outgoing_transaction_id = outgoingTransactionId;
    this.time_delta_hours = timeDeltaHours;
  }
}

/**
 * Structuring pattern - high percentage of round number transactions
 */
export class StructuringPattern {
  /**
   * @param {string} accountId - Account ID
   * @param {number} roundNumberPercentage - Percentage of round number transactions
   * @param {number} totalTransactions - Total transaction count
   */
  constructor(accountId, roundNumberPercentage, totalTransactions) {
    this.account_id = accountId;
    this.round_number_percentage = roundNumberPercentage;
    this.total_transactions = totalTransactions;
  }
}

/**
 * Threshold avoidance pattern - amounts clustering near reporting threshold
 */
export class ThresholdPattern {
  /**
   * @param {string} accountId - Account ID
   * @param {number} averageAmount - Average transaction amount
   * @param {number} transactionCount - Transaction count
   */
  constructor(accountId, averageAmount, transactionCount) {
    this.account_id = accountId;
    this.average_amount = averageAmount;
    this.transaction_count = transactionCount;
  }
}
