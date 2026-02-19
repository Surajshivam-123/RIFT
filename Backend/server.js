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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to string
    const csvContent = req.file.buffer.toString('utf-8');

    // Initialize fraud detection system
    const fraudSystem = new FraudDetectionSystemOptimized({
      progressCallback: (message, percent) => {
        console.log(`[${percent}%] ${message}`);
      }
    });

    // Analyze the CSV content
    const jsonResult = fraudSystem.analyze(csvContent);

    // Parse the JSON string to object and send
    const result = JSON.parse(jsonResult);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to analyze transactions'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fraud Detection API running on http://localhost:${PORT}`);
  console.log(`📊 Upload endpoint: POST http://localhost:${PORT}/api/analyze`);
});
