import { readFileSync } from 'fs';
import { FraudDetectionSystemOptimized } from './Backend/src/FraudDetectionSystemOptimized.js';

console.log('Testing money-mulling.csv...\n');

try {
  const csvContent = readFileSync('./money-mulling.csv', 'utf-8');
  console.log(`File size: ${csvContent.length} bytes`);
  console.log(`Lines: ${csvContent.split('\n').length}\n`);
  
  const fraudSystem = new FraudDetectionSystemOptimized({
    progressCallback: (message, percent) => {
      console.log(`[${percent}%] ${message}`);
    }
  });
  
  const startTime = Date.now();
  const result = fraudSystem.analyze(csvContent);
  const endTime = Date.now();
  
  console.log(`\n✅ Analysis completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
  
  const parsed = JSON.parse(result);
  console.log(`\nResults:`);
  console.log(`- Total accounts: ${parsed.summary.total_accounts_analyzed}`);
  console.log(`- Suspicious accounts: ${parsed.summary.suspicious_accounts_flagged}`);
  console.log(`- Fraud rings: ${parsed.summary.fraud_rings_detected}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
