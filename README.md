# Fraud Detection System

A full-stack application for detecting fraudulent transaction patterns using graph analysis.

## Architecture

- **Backend**: Node.js + Express API that processes CSV files and detects fraud patterns
- **Frontend**: React + Vite application for visualizing transaction graphs and fraud analysis

## Setup Instructions

### Backend Setup

1. Navigate to the Backend directory:
```cmd
cd Backend
```

2. Install dependencies:
```cmd
npm install
```

3. Start the backend server:
```cmd
npm start
```

The backend API will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the Frontend project directory:
```cmd
cd Frontend\project
```

2. Install dependencies:
```cmd
npm install
```

3. Start the development server:
```cmd
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

1. Make sure both backend and frontend servers are running
2. Open the frontend in your browser
3. Upload a CSV file with transaction data
4. The CSV must have these columns:
   - `transaction_id`
   - `sender_id`
   - `receiver_id`
   - `amount`
   - `timestamp`

5. The system will:
   - Parse the CSV file
   - Send it to the backend for fraud analysis
   - Display the transaction graph with fraud detection results
   - Highlight suspicious accounts and fraud rings

## Features

- **24 Advanced Fraud Detection Patterns**: Including cycles, fan-out/fan-in, structuring, velocity anomalies, and more
- **Interactive Graph Visualization**: Zoom, pan, and select nodes to explore transaction networks
- **Fraud Ring Detection**: Automatically identifies coordinated fraud groups
- **Detailed Account Analysis**: View transaction history and suspicion scores
- **Real-time Processing**: Backend processes CSV files and returns JSON results

## API Endpoints

### POST /api/analyze
Upload a CSV file for fraud analysis

**Request**: 
- Method: POST
- Content-Type: multipart/form-data
- Body: CSV file with key "file"

**Response**:
```json
{
  "success": true,
  "data": {
    "suspicious_accounts": [...],
    "fraud_rings": [...],
    "summary": {
      "total_accounts_analyzed": 100,
      "suspicious_accounts_flagged": 15,
      "fraud_rings_detected": 3,
      "processing_time_seconds": 2.5
    }
  }
}
```

### GET /health
Check if the API is running

## Sample Data

Sample CSV files are available in `Backend/data/`:
- `transactions_10k.csv` - 10,000 sample transactions
- `RIFT_sample_transactions_10000.csv` - RIFT dataset sample

## Technology Stack

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- Custom graph analysis algorithms

### Frontend
- React 19
- Vite
- D3-force (physics simulation)
- PapaParse (CSV parsing)
- TailwindCSS
- React Router DOM

## Development

### Backend Tests
```cmd
cd Backend
npm test
```

### Frontend Development
```cmd
cd Frontend\project
npm run dev
```

## Troubleshooting

**Backend not connecting**: 
- Ensure the backend is running on port 3001
- Check for CORS errors in browser console
- Verify the API_URL in `Frontend/project/src/context/TransactionContext.jsx`

**CSV upload fails**:
- Verify CSV has all required columns
- Check file size (max 50MB)
- Ensure CSV is properly formatted with headers

**Graph not displaying**:
- Check browser console for errors
- Ensure fraudData is loaded from backend
- Verify nodes and edges are populated
