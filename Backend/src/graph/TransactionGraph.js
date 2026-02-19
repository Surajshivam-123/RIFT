import { Transaction } from '../models/Transaction.js';

/**
 * Directed graph representation of transaction network
 * Uses adjacency list for efficient traversal
 */
export class TransactionGraph {
  constructor() {
    // Adjacency list: accountId -> array of outgoing transactions
    this.outgoingEdges = new Map();
    // Reverse adjacency list: accountId -> array of incoming transactions
    this.incomingEdges = new Map();
    // All transactions by ID
    this.transactions = new Map();
  }

  /**
   * Add transaction edge to graph
   * @param {string} senderId - Sender account ID
   * @param {string} receiverId - Receiver account ID
   * @param {number} amount - Transaction amount
   * @param {Date} timestamp - Transaction timestamp
   * @param {string} transactionId - Transaction ID
   */
  addTransaction(senderId, receiverId, amount, timestamp, transactionId = null) {
    const txId = transactionId || `tx_${this.transactions.size + 1}`;
    const transaction = new Transaction(txId, senderId, receiverId, amount, timestamp);
    
    this.transactions.set(txId, transaction);
    
    // Add to outgoing edges
    if (!this.outgoingEdges.has(senderId)) {
      this.outgoingEdges.set(senderId, []);
    }
    this.outgoingEdges.get(senderId).push(transaction);
    
    // Add to incoming edges
    if (!this.incomingEdges.has(receiverId)) {
      this.incomingEdges.set(receiverId, []);
    }
    this.incomingEdges.get(receiverId).push(transaction);
  }

  /**
   * Get all transactions for an account (both incoming and outgoing)
   * @param {string} accountId - Account ID
   * @returns {Array<Transaction>} List of transactions
   */
  getAccountTransactions(accountId) {
    const outgoing = this.outgoingEdges.get(accountId) || [];
    const incoming = this.incomingEdges.get(accountId) || [];
    return [...outgoing, ...incoming];
  }

  /**
   * Get all account IDs in graph
   * @returns {Array<string>} List of account IDs
   */
  getAllAccounts() {
    const accounts = new Set();
    for (const accountId of this.outgoingEdges.keys()) {
      accounts.add(accountId);
    }
    for (const accountId of this.incomingEdges.keys()) {
      accounts.add(accountId);
    }
    return Array.from(accounts);
  }

  /**
   * Get outgoing transactions from account
   * @param {string} accountId - Account ID
   * @returns {Array<Transaction>} List of outgoing transactions
   */
  getOutgoingTransactions(accountId) {
    return this.outgoingEdges.get(accountId) || [];
  }

  /**
   * Get incoming transactions to account
   * @param {string} accountId - Account ID
   * @returns {Array<Transaction>} List of incoming transactions
   */
  getIncomingTransactions(accountId) {
    return this.incomingEdges.get(accountId) || [];
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Transaction|undefined} Transaction or undefined
   */
  getTransaction(transactionId) {
    return this.transactions.get(transactionId);
  }

  /**
   * Get total number of transactions
   * @returns {number} Transaction count
   */
  getTransactionCount() {
    return this.transactions.size;
  }

  /**
   * Serialize graph to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      transactions: Array.from(this.transactions.values()).map(tx => tx.toJSON())
    };
  }

  /**
   * Deserialize graph from JSON
   * @param {Object} json - JSON object
   * @returns {TransactionGraph} TransactionGraph instance
   */
  static fromJSON(json) {
    const graph = new TransactionGraph();
    for (const txJson of json.transactions) {
      const tx = Transaction.fromJSON(txJson);
      graph.addTransaction(
        tx.sender_id,
        tx.receiver_id,
        tx.amount,
        tx.timestamp,
        tx.transaction_id
      );
    }
    return graph;
  }
}
