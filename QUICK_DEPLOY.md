# 🚀 Quick Deploy - Forensic Engine

## Fastest Path to Production (10 minutes)

### Prerequisites
```bash
npm install -g vercel
vercel login
```

---

## Deploy Backend

```bash
cd Backend
vercel --prod
```

**Copy the URL shown** (e.g., `https://forensic-engine-backend-xxx.vercel.app`)

---

## Deploy Frontend

```bash
cd ../Frontend/project
vercel --prod
```

**When prompted for environment variables:**
- Name: `VITE_API_URL`
- Value: [Paste your backend URL from above]

---

## Test It

### 1. Test Backend
```bash
curl https://your-backend-url.vercel.app/health
```

Should return: `{"status":"ok","message":"Fraud Detection API is running"}`

### 2. Test Frontend
1. Open your frontend URL in browser
2. Upload `Backend/test-transactions.csv`
3. Verify graph appears with fraud detection results

---

## URLs You'll Get

- **Backend API**: `https://forensic-engine-backend-xxx.vercel.app`
- **Frontend App**: `https://forensic-engine-frontend-xxx.vercel.app`

---

## If Something Goes Wrong

### Backend not responding?
```bash
vercel logs https://your-backend-url.vercel.app
```

### Frontend can't connect?
1. Check `VITE_API_URL` is set correctly
2. Redeploy frontend: `vercel --prod`

### Need detailed help?
See `DEPLOY_TO_VERCEL.md` for complete guide

---

## Important Notes

✅ Free tier has 10-second timeout (good for files up to ~5k rows)
✅ For larger files, upgrade to Vercel Pro (60s timeout)
✅ Both deployments are separate (backend + frontend)
✅ CORS is pre-configured
✅ HTTPS is automatic

---

## Update Environment Variable Later

```bash
cd Frontend/project
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Enter new backend URL
vercel --prod
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Domains
4. Add your domain
5. Update DNS as instructed

---

## That's It! 🎉

Your Forensic-Engine is now live and ready to detect fraud patterns!
