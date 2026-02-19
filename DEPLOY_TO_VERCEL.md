# Deploy Forensic-Engine to Vercel - Complete Guide

## 📋 Project Review Summary

Your project structure:
- **Backend**: Node.js + Express API with fraud detection algorithms
- **Frontend**: React 19 + Vite with graph visualization
- **Dependencies**: All properly configured ✅
- **Configuration**: Vercel config files created ✅

---

## 🚀 Deployment Steps (Choose Your Method)

### Method 1: Vercel CLI (Recommended - 10 minutes)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```
Follow the browser prompt to authenticate.

#### Step 3: Deploy Backend First
```bash
cd Backend
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Y**
- Which scope? → Select your account
- Link to existing project? → **N**
- What's your project's name? → **forensic-engine-backend** (or your choice)
- In which directory is your code located? → **.** (press Enter)
- Want to modify settings? → **N**

**Important:** Copy the production URL shown (e.g., `https://forensic-engine-backend.vercel.app`)

#### Step 4: Deploy Frontend
```bash
cd ../Frontend/project
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Y**
- Which scope? → Select your account
- Link to existing project? → **N**
- What's your project's name? → **forensic-engine-frontend** (or your choice)
- In which directory is your code located? → **.** (press Enter)
- Want to modify settings? → **N**

**When asked about environment variables:**
- Add environment variable? → **Y**
- Name: → **VITE_API_URL**
- Value: → Paste your backend URL from Step 3 (e.g., `https://forensic-engine-backend.vercel.app`)
- Add another? → **N**

#### Step 5: Promote to Production
```bash
# In Backend directory
cd ../../Backend
vercel --prod

# In Frontend directory
cd ../Frontend/project
vercel --prod
```

#### Step 6: Test Your Deployment
1. Visit your frontend URL (shown after deployment)
2. Upload `Backend/test-transactions.csv`
3. Verify the fraud analysis works

---

### Method 2: GitHub + Vercel Dashboard (15 minutes)

#### Step 1: Push to GitHub

If you haven't already:
```bash
# In project root
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
```

Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/forensic-engine.git
git push -u origin main
```

#### Step 2: Deploy Backend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure:
   - **Project Name**: `forensic-engine-backend`
   - **Framework Preset**: Other
   - **Root Directory**: Click "Edit" → Select `Backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. Click "Deploy"
6. **Copy the deployment URL** (e.g., `https://forensic-engine-backend.vercel.app`)

#### Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the **same repository**
3. Configure:
   - **Project Name**: `forensic-engine-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" → Select `Frontend/project`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variable:
   - Click "Add Environment Variable"
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 2
   - **Environment**: All (Production, Preview, Development)
5. Click "Deploy"

#### Step 4: Test Your Deployment
Visit your frontend URL and test with a CSV file.

---

## 🔧 Post-Deployment Configuration

### Verify Backend is Running
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{"status":"ok","message":"Fraud Detection API is running"}
```

### Update Environment Variables (if needed)

**Via Vercel Dashboard:**
1. Go to your frontend project
2. Settings → Environment Variables
3. Edit `VITE_API_URL`
4. Redeploy: Deployments → Latest → ⋯ → Redeploy

**Via Vercel CLI:**
```bash
cd Frontend/project
vercel env add VITE_API_URL production
# Paste your backend URL
vercel --prod
```

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.vercel.app/health
```

### 2. Test Backend Analysis (with test file)
```bash
curl -X POST https://your-backend.vercel.app/api/analyze \
  -F "file=@Backend/test-transactions.csv"
```

### 3. Test Frontend
1. Open your frontend URL
2. Upload `Backend/test-transactions.csv`
3. Verify:
   - ✅ File uploads successfully
   - ✅ Graph visualization appears
   - ✅ Suspicious accounts are highlighted
   - ✅ Fraud rings are detected
   - ✅ Details page shows transaction data

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Backend analysis failed: Failed to fetch"

**Cause**: Frontend can't reach backend

**Solutions:**
1. Verify `VITE_API_URL` is set correctly (no trailing slash)
2. Check backend is deployed and accessible
3. Test backend health endpoint
4. Redeploy frontend after changing environment variables

### Issue 2: CORS Errors

**Cause**: Backend not allowing frontend domain

**Solution**: Already configured in `Backend/vercel.json` ✅
If still having issues, check Vercel function logs.

### Issue 3: "Function execution timeout"

**Cause**: Large CSV files take too long (free tier = 10s limit)

**Solutions:**
1. Test with smaller files first
2. Upgrade to Vercel Pro (60s timeout)
3. Check function logs for actual error

### Issue 4: Build Failures

**Frontend build fails:**
```bash
# Test locally first
cd Frontend/project
npm run build
```

**Backend deployment fails:**
```bash
# Test locally first
cd Backend
npm install
npm start
```

### Issue 5: Environment Variable Not Working

**Solution:**
1. Ensure variable name is `VITE_API_URL` (exact spelling)
2. Redeploy after adding/changing variables
3. Clear browser cache
4. Check browser console for actual API URL being used

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Backend logs
vercel logs https://your-backend.vercel.app

# Frontend logs
vercel logs https://your-frontend.vercel.app
```

### Vercel Dashboard
- **Functions**: Monitor serverless function execution
- **Analytics**: Track page views and performance
- **Deployments**: View deployment history
- **Logs**: Real-time function logs

---

## 💰 Vercel Free Tier Limits

- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours function execution
- ⚠️ 10-second function timeout (may need Pro for large files)
- ✅ Unlimited deployments
- ✅ Automatic HTTPS

**For production with large CSV files, consider Vercel Pro:**
- 60-second function timeout
- 1 TB bandwidth
- Priority support

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [x] Backend `vercel.json` created
- [x] Frontend `vercel.json` created
- [x] Environment variable template created
- [x] Frontend updated to use `VITE_API_URL`
- [ ] Code committed to Git (if using GitHub method)

### Backend Deployment
- [ ] Backend deployed to Vercel
- [ ] Backend URL copied
- [ ] Health endpoint tested
- [ ] API endpoint tested with curl

### Frontend Deployment
- [ ] `VITE_API_URL` environment variable set
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] CSV upload works
- [ ] Graph visualization renders
- [ ] Fraud detection results display

### Post-Deployment
- [ ] Test with sample CSV file
- [ ] Verify all features work
- [ ] Check browser console for errors
- [ ] Monitor function execution time
- [ ] Set up custom domain (optional)

---

## 🔐 Security Best Practices

✅ **Already Implemented:**
- CORS properly configured
- File upload validation (CSV only)
- File size limits (50MB)
- Memory storage (no disk writes)
- Error handling without exposing internals

**Additional Recommendations:**
- Add rate limiting for production
- Implement authentication if needed
- Monitor for abuse
- Set up alerts for errors

---

## 🚀 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records
   - Update `VITE_API_URL` to use custom backend domain

2. **Continuous Deployment**
   - Already enabled if using GitHub method
   - Every push to `main` triggers automatic deployment

3. **Performance Optimization**
   - Monitor function execution times
   - Optimize for large CSV files if needed
   - Consider caching strategies

4. **Monitoring**
   - Set up error alerts
   - Monitor bandwidth usage
   - Track function execution metrics

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Vercel Support**: https://vercel.com/support

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Backend API: `https://your-backend.vercel.app`
- ✅ Frontend App: `https://your-frontend.vercel.app`
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic scaling
- ✅ Zero-downtime deployments

Share your frontend URL to let others use your Forensic-Engine fraud detection system!
