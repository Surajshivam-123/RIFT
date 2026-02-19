import { TransactionGraph } from '../graph/TransactionGraph.js';

/**
 * Custom error for CSV parsing failures
 */
export class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * CSV Parser for transaction data
 * Reads and validates CSV transaction records and constructs transaction graph
 */
export class CSVParser {
  /**
   * Parse CSV file and return transaction graph
   * @param {string} csvContent - Raw CSV file content
   * @returns {TransactionGraph} Parsed and validated transaction graph
   * @throws {ParseError} If CSV format is invalid or required fields are missing
   */
  parse(csvContent) {
    if (!csvContent || csvContent.trim().length === 0) {
      throw new ParseError('CSV content is empty');
    }

    const lines = csvContent.trim().split('\n');
    
    if (lines.length === 0) {
      throw new ParseError('CSV file contains no data');
    }

    // Parse header
    const headerLine = lines[0].trim();
    const headers = this._parseCSVLine(headerLine);
    
    // Validate required headers are present
    const requiredFields = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];
    const missingHeaders = requiredFields.filter(field => !headers.includes(field));
    
    if (missingHeaders.length > 0) {
      throw new ParseError(`CSV header missing required fields: ${missingHeaders.join(', ')}`);
    }

    // Build transaction graph
    const graph = new TransactionGraph();
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (line.length === 0) {
        continue;
      }

      try {
        const values = this._parseCSVLine(line);
        
        // Create record object
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = values[j];
        }
        
        // Validate record
        this.validateRecord(record, i + 1);
        
        // Add to graph
        graph.addTransaction(
          record.sender_id,
          record.receiver_id,
          parseFloat(record.amount),
          this._parseTimestamp(record.timestamp),
          record.transaction_id
        );
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ParseError(`Line ${i + 1}: ${error.message}`);
        }
        throw error;
      }
    }

    return graph;
  }

  /**
   * Validate a single transaction record
   * @param {Object} record - Transaction record object
   * @param {number} lineNumber - Line number for error reporting
   * @returns {boolean} True if valid
   * @throws {ValidationError} If validation fails with descriptive message
   */
  validateRecord(record, lineNumber = null) {
    const requiredFields = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];
    
    // Check for missing fields
    for (const field of requiredFields) {
      if (record[field] === undefined || record[field] === null || record[field] === '') {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    // Validate amount is a positive number
    const amount = parseFloat(record.amount);
    if (isNaN(amount)) {
      throw new ValidationError(`Invalid amount: '${record.amount}' is not a valid number`);
    }
    if (amount <= 0) {
      throw new ValidationError(`Invalid amount: ${amount} must be positive`);
    }

    // Validate timestamp format (YYYY-MM-DD HH:MM:SS)
    const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!timestampRegex.test(record.timestamp)) {
      throw new ValidationError(
        `Invalid timestamp format: '${record.timestamp}' does not match required format YYYY-MM-DD HH:MM:SS`
      );
    }

    // Validate timestamp is a valid date
    const timestamp = this._parseTimestamp(record.timestamp);
    if (isNaN(timestamp.getTime())) {
      throw new ValidationError(`Invalid timestamp: '${record.timestamp}' is not a valid date`);
    }

    return true;
  }

  /**
   * Parse a CSV line handling quoted fields
   * @param {string} line - CSV line
   * @returns {Array<string>} Array of field values
   * @private
   */
  _parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Parse timestamp string to Date object
   * @param {string} timestampStr - Timestamp string in format YYYY-MM-DD HH:MM:SS
   * @returns {Date} Date object
   * @private
   */
  _parseTimestamp(timestampStr) {
    // Replace space with 'T' for ISO format compatibility
    const isoString = timestampStr.replace(' ', 'T');
    return new Date(isoString);
  }
}
