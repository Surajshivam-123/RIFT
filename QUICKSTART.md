# Quick Start Guide

Get the Fraud Detection System running in 3 steps:

## Step 1: Install Backend Dependencies

```cmd
cd Backend
npm install
```

## Step 2: Install Frontend Dependencies

```cmd
cd Frontend\project
npm install
```

## Step 3: Start Both Servers

### Terminal 1 - Backend Server
```cmd
cd Backend
npm start
```

You should see:
```
🚀 Fraud Detection API running on http://localhost:3001
📊 Upload endpoint: POST http://localhost:3001/api/analyze
```

### Terminal 2 - Frontend Server
```cmd
cd Frontend\project
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 4: Use the Application

1. Open your browser to `http://localhost:5173`
2. Click or drag-and-drop a CSV file onto the upload zone
3. Wait for the analysis to complete
4. Explore the results:
   - **View Graph**: Interactive network visualization with fraud detection
   - **View Details**: Account summaries and transaction tables

## Test the Backend (Optional)

Before starting the full application, you can test the backend:

```cmd
cd Backend
npm run test:api
```

This will process the sample CSV and show fraud detection results in the console.

## Sample CSV Format

Your CSV must have these columns:

```csv
transaction_id,sender_id,receiver_id,amount,timestamp
T001,ACC_A,ACC_B,5000,2024-01-15 10:30:00
T002,ACC_B,ACC_C,3200,2024-01-15 11:00:00
```

Sample files are in `Backend/data/`:
- `transactions_10k.csv`
- `RIFT_sample_transactions_10000.csv`

## Troubleshooting

**Port already in use?**
- Backend: Change PORT in `Backend/server.js`
- Frontend: Vite will automatically suggest another port

**Backend connection error?**
- Make sure backend is running on port 3001
- Check `Frontend/project/src/context/TransactionContext.jsx` has correct API_URL

**Module not found?**
- Run `npm install` in both Backend and Frontend/project directories

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the fraud detection algorithms in `Backend/ADVANCED_ALGORITHMS.md`
- Check out the logic documentation in `Backend/LOGIC.md`
