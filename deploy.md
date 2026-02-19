# Quick Deployment Guide

## Fastest Way to Deploy (5 minutes)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Backend
```bash
cd Backend
vercel --prod
```
**Copy the deployment URL** (e.g., `https://fraud-detection-backend.vercel.app`)

### 4. Deploy Frontend
```bash
cd ../Frontend/project
vercel --prod
```

When prompted for environment variables, add:
- Name: `VITE_API_URL`
- Value: (paste your backend URL from step 3)

### 5. Test Your Deployment
Visit your frontend URL and upload `Backend/test-transactions.csv`

---

## Alternative: Deploy via GitHub + Vercel Dashboard

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy Backend
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set **Root Directory** to `Backend`
4. Click Deploy
5. Copy the deployment URL

### 3. Deploy Frontend
1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the same repository
3. Set **Root Directory** to `Frontend/project`
4. Add environment variable:
   - `VITE_API_URL` = your backend URL
5. Click Deploy

---

## What Gets Deployed

### Backend (`Backend/`)
- Express API server as serverless function
- Fraud detection algorithms
- CSV processing endpoint
- Deployed URL: `https://your-backend.vercel.app`

### Frontend (`Frontend/project/`)
- React + Vite static site
- Graph visualization
- CSV upload interface
- Deployed URL: `https://your-frontend.vercel.app`

---

## Important Notes

✅ Both projects need separate deployments
✅ Backend URL must be set in frontend environment variables
✅ Free tier has 10-second function timeout (may need Pro for large files)
✅ CORS is pre-configured in `Backend/vercel.json`

---

## After Deployment

Test the health endpoint:
```bash
curl https://your-backend.vercel.app/health
```

Should return:
```json
{"status":"ok","message":"Fraud Detection API is running"}
```

---

## Need Help?

- See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions
- See `DEPLOYMENT_CHECKLIST.md` for step-by-step checklist
- Check Vercel logs: `vercel logs <deployment-url>`
