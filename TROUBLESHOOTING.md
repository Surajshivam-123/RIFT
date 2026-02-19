# Troubleshooting Guide - Vercel Deployment

## Quick Diagnostics

### Check Backend Health
```bash
curl https://your-backend.vercel.app/health
```

**Expected Response:**
```json
{"status":"ok","message":"Fraud Detection API is running"}
```

### Check Frontend Environment
Open browser console on your frontend and run:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should show your backend URL.

---

## Common Issues

### 1. "Backend analysis failed: Failed to fetch"

**Symptoms:**
- Frontend shows error message
- Browser console shows network error
- CSV upload doesn't complete

**Causes & Solutions:**

#### A. Backend not deployed
```bash
# Check if backend is accessible
curl https://your-backend.vercel.app/health
```
If this fails, redeploy backend:
```bash
cd Backend
vercel --prod
```

#### B. Wrong API URL in frontend
1. Check environment variable:
   ```bash
   cd Frontend/project
   vercel env ls
   ```
2. Update if wrong:
   ```bash
   vercel env rm VITE_API_URL production
   vercel env add VITE_API_URL production
   # Enter correct backend URL
   vercel --prod
   ```

#### C. Trailing slash in URL
❌ Wrong: `https://backend.vercel.app/`
✅ Correct: `https://backend.vercel.app`

Fix in Vercel dashboard or redeploy with correct URL.

---

### 2. CORS Errors

**Symptoms:**
```
Access to fetch at 'https://backend.vercel.app/api/analyze' from origin 
'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solutions:**

#### A. Check vercel.json exists
```bash
# Should exist
ls Backend/vercel.json
```

#### B. Verify CORS headers in vercel.json
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

#### C. Redeploy backend
```bash
cd Backend
vercel --prod
```

---

### 3. "Function execution timeout"

**Symptoms:**
- Request takes too long
- Error: "FUNCTION_INVOCATION_TIMEOUT"
- Large CSV files fail

**Causes:**
- Free tier has 10-second timeout
- Large files take longer to process

**Solutions:**

#### A. Test with smaller file first
Use `Backend/test-transactions.csv` (small file)

#### B. Check actual processing time
```bash
# View function logs
vercel logs https://your-backend.vercel.app
```

#### C. Upgrade to Pro plan
- 60-second timeout
- Better for production use
- $20/month

#### D. Optimize code (if needed)
- Process in chunks
- Reduce algorithm complexity
- Add progress indicators

---

### 4. Build Failures

**Symptoms:**
- Deployment fails
- Build logs show errors
- "Command failed" message

**Frontend Build Issues:**

#### A. Test build locally
```bash
cd Frontend/project
npm install
npm run build
```

#### B. Check for missing dependencies
```bash
npm install
```

#### C. Verify Node version
Vercel uses Node 18 by default. Check compatibility:
```bash
node --version
```

**Backend Build Issues:**

#### A. Test locally
```bash
cd Backend
npm install
npm start
```

#### B. Check package.json
Ensure all dependencies are listed:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

### 5. Environment Variables Not Working

**Symptoms:**
- Frontend uses wrong API URL
- `undefined` in console
- Requests go to localhost

**Solutions:**

#### A. Check variable name
Must be exactly: `VITE_API_URL` (case-sensitive)

#### B. Verify it's set
```bash
cd Frontend/project
vercel env ls
```

#### C. Redeploy after adding
Environment variables require redeployment:
```bash
vercel --prod
```

#### D. Clear browser cache
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

### 6. "No file uploaded" Error

**Symptoms:**
- Backend returns 400 error
- Message: "No file uploaded"

**Solutions:**

#### A. Check file input name
Frontend must use `file` as the form field name:
```javascript
const formData = new FormData();
formData.append('file', file); // Must be 'file'
```

#### B. Verify file type
Only CSV files accepted:
```javascript
// Check file extension
if (!file.name.endsWith('.csv')) {
  // Show error
}
```

#### C. Check file size
Max 50MB:
```javascript
if (file.size > 50 * 1024 * 1024) {
  // Show error
}
```

---

### 7. Graph Not Displaying

**Symptoms:**
- Blank screen after upload
- No visualization appears
- Console shows errors

**Solutions:**

#### A. Check browser console
Look for JavaScript errors

#### B. Verify data structure
```javascript
console.log(fraudData);
```
Should have `suspicious_accounts` and `fraud_rings`

#### C. Check CSV format
Required columns:
- transaction_id
- sender_id
- receiver_id
- amount
- timestamp

#### D. Test with sample file
Use `Backend/test-transactions.csv`

---

### 8. Slow Performance

**Symptoms:**
- Long load times
- Slow API responses
- Timeout warnings

**Solutions:**

#### A. Check function execution time
```bash
vercel logs https://your-backend.vercel.app
```

#### B. Optimize file size
- Reduce CSV rows
- Remove unnecessary columns
- Compress before upload

#### C. Monitor cold starts
First request after idle is slower (1-2s)

#### D. Consider Pro plan
- Better performance
- More memory
- Longer timeout

---

### 9. Deployment URL Changed

**Symptoms:**
- Old URL doesn't work
- Need to update frontend

**Solutions:**

#### A. Get current backend URL
```bash
cd Backend
vercel ls
```

#### B. Update frontend environment
```bash
cd Frontend/project
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Enter new backend URL
vercel --prod
```

---

### 10. "Module not found" Errors

**Symptoms:**
- Import errors in logs
- "Cannot find module" messages

**Solutions:**

#### A. Check file paths
Ensure relative imports are correct:
```javascript
// ✅ Correct
import { FraudDetectionSystemOptimized } from './src/FraudDetectionSystemOptimized.js';

// ❌ Wrong
import { FraudDetectionSystemOptimized } from 'src/FraudDetectionSystemOptimized.js';
```

#### B. Verify file extensions
Include `.js` extension for ES modules:
```javascript
import { something } from './file.js'; // ✅
```

#### C. Check package.json
```json
{
  "type": "module"
}
```

---

## Debugging Commands

### View Recent Logs
```bash
vercel logs https://your-deployment.vercel.app
```

### Follow Logs in Real-time
```bash
vercel logs https://your-deployment.vercel.app --follow
```

### List All Deployments
```bash
vercel ls
```

### Get Deployment Info
```bash
vercel inspect https://your-deployment.vercel.app
```

### Test Backend Locally
```bash
cd Backend
npm start
# Test at http://localhost:3001
```

### Test Frontend Locally
```bash
cd Frontend/project
npm run dev
# Test at http://localhost:5173
```

---

## Getting Help

### 1. Check Vercel Status
https://vercel-status.com

### 2. Search Documentation
https://vercel.com/docs

### 3. Community Support
https://github.com/vercel/vercel/discussions

### 4. Contact Support
https://vercel.com/support

### 5. Check Function Logs
Vercel Dashboard → Your Project → Functions → View Logs

---

## Prevention Checklist

Before deploying:
- [ ] Test locally first
- [ ] Run `npm run build` successfully
- [ ] Verify all dependencies in package.json
- [ ] Check environment variables are set
- [ ] Test with sample data
- [ ] Review vercel.json configuration
- [ ] Commit all changes to Git

After deploying:
- [ ] Test health endpoint
- [ ] Upload sample CSV
- [ ] Check browser console
- [ ] Monitor function logs
- [ ] Verify graph displays
- [ ] Test all features

---

## Emergency Rollback

If deployment breaks:

### 1. Find Previous Working Deployment
```bash
vercel ls
```

### 2. Promote Previous Deployment
In Vercel Dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click ⋯ → Promote to Production

### 3. Or Redeploy Previous Commit
```bash
git log
git checkout <previous-commit-hash>
vercel --prod
git checkout main
```

---

## Performance Optimization

### Monitor Metrics
- Function execution time
- Cold start frequency
- Memory usage
- Error rate

### Optimize If Needed
- Reduce algorithm complexity
- Process in batches
- Add caching
- Upgrade to Pro plan

---

## Still Having Issues?

1. Check all solutions above
2. Review deployment logs
3. Test locally first
4. Compare with working example
5. Ask in Vercel community
6. Contact Vercel support

Include in your support request:
- Deployment URL
- Error messages
- Function logs
- Steps to reproduce
- Browser console output
