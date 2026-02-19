import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test to verify the fraud detection system works
async function testAPI() {
  console.log('Testing Fraud Detection API...\n');

  try {
    // Read sample CSV
    const csvPath = join(__dirname, 'test-transactions.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    console.log('✓ Sample CSV loaded');
    console.log(`  File size: ${(csvContent.length / 1024).toFixed(2)} KB\n`);

    // Test with FraudDetectionSystem directly
    const { FraudDetectionSystemOptimized } = await import('./src/FraudDetectionSystemOptimized.js');
    
    const fraudSystem = new FraudDetectionSystemOptimized({
      progressCallback: (message, percent) => {
        console.log(`  [${percent}%] ${message}`);
      }
    });

    console.log('Starting analysis...\n');
    const startTime = Date.now();
    
    const jsonResult = fraudSystem.analyze(csvContent);
    const result = JSON.parse(jsonResult);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✓ Analysis complete!\n');
    console.log('Results:');
    console.log(`  Total accounts: ${result.summary.total_accounts_analyzed}`);
    console.log(`  Suspicious accounts: ${result.summary.suspicious_accounts_flagged}`);
    console.log(`  Fraud rings: ${result.summary.fraud_rings_detected}`);
    console.log(`  Processing time: ${duration}s`);
    console.log(`  Patterns analyzed: ${result.summary.patterns_analyzed}`);
    
    if (result.fraud_rings.length > 0) {
      console.log('\nFraud Rings Detected:');
      result.fraud_rings.forEach(ring => {
        console.log(`  - ${ring.ring_id}: ${ring.member_accounts.length} members (${ring.pattern_type})`);
      });
    }

    console.log('\n✓ All tests passed!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAPI();
