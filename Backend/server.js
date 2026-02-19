import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { FraudDetectionSystemOptimized } from './src/FraudDetectionSystemOptimized.js';

const app = express();
const PORT = 3001;

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fraud Detection API is running' });
});

// Main endpoint: Upload CSV and get fraud analysis
app.post('/api/analyze', upload.single('file'), (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log(`Processing file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Warn about potential timeout on large files
    const estimatedRows = Math.floor(req.file.size / 100); // Rough estimate
    if (estimatedRows > 5000) {
      console.warn(`Large file detected (~${estimatedRows} rows). May timeout on free tier.`);
    }

    // Convert buffer to string
    const csvContent = req.file.buffer.toString('utf-8');
    
    // Basic validation
    if (!csvContent || csvContent.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'CSV file is empty' 
      });
    }

    // Check for required columns
    const firstLine = csvContent.split('\n')[0];
    const requiredColumns = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];
    const missingColumns = requiredColumns.filter(col => !firstLine.toLowerCase().includes(col.toLowerCase()));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Missing required columns: ${missingColumns.join(', ')}` 
      });
    }

    // Initialize fraud detection system
    const fraudSystem = new FraudDetectionSystemOptimized({
      progressCallback: (message, percent) => {
        console.log(`[${percent}%] ${message}`);
      }
    });

    console.log('Starting fraud analysis...');

    // Analyze the CSV content
    const jsonResult = fraudSystem.analyze(csvContent);

    // Parse the JSON string to object and send
    const result = JSON.parse(jsonResult);
    
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Analysis completed in ${processingTime}s`);
    
    res.json({
      success: true,
      data: result,
      processing_time: processingTime
    });

  } catch (error) {
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('Analysis error:', error);
    console.error('Error stack:', error.stack);
    console.error(`Failed after ${processingTime}s`);
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to analyze transactions',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
  
  next();
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Fraud Detection API running on http://localhost:${PORT}`);
    console.log(`📊 Upload endpoint: POST http://localhost:${PORT}/api/analyze`);
  });
}

// Export for Vercel serverless
export default app;
