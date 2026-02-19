# Deployment Architecture

## Current Local Setup

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Computer                            │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Frontend       │         │    Backend       │         │
│  │   (Vite Dev)     │────────▶│   (Express)      │         │
│  │   Port 5173      │  HTTP   │   Port 3001      │         │
│  │                  │         │                  │         │
│  │  - React UI      │         │  - CSV Upload    │         │
│  │  - Graph Viz     │         │  - Fraud Detect  │         │
│  │  - File Upload   │         │  - JSON Output   │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Vercel Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Vercel Cloud                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Frontend Deployment                                        │    │
│  │  https://forensic-engine-frontend.vercel.app               │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────┐         │    │
│  │  │  Static Site (CDN)                            │         │    │
│  │  │  - React App (built)                          │         │    │
│  │  │  - HTML, CSS, JS files                        │         │    │
│  │  │  - Served globally via CDN                    │         │    │
│  │  │  - Automatic HTTPS                            │         │    │
│  │  └──────────────────────────────────────────────┘         │    │
│  │                                                             │    │
│  │  Environment Variables:                                    │    │
│  │  VITE_API_URL = https://forensic-engine-backend.vercel.app│    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ HTTP POST /api/analyze                │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Backend Deployment                                         │    │
│  │  https://forensic-engine-backend.vercel.app                │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────┐         │    │
│  │  │  Serverless Function                          │         │    │
│  │  │  - Express API (server.js)                    │         │    │
│  │  │  - Fraud Detection System                     │         │    │
│  │  │  - Graph Analysis Algorithms                  │         │    │
│  │  │  - Auto-scales on demand                      │         │    │
│  │  │  - 10s timeout (free) / 60s (pro)            │         │    │
│  │  │  - 1024 MB memory                             │         │    │
│  │  └──────────────────────────────────────────────┘         │    │
│  │                                                             │    │
│  │  Endpoints:                                                │    │
│  │  GET  /health        → Health check                        │    │
│  │  POST /api/analyze   → CSV fraud analysis                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
                    ┌──────────────────┐
                    │   End Users      │
                    │   (Browsers)     │
                    └──────────────────┘
```

---

## Request Flow

### 1. User Visits Frontend
```
User Browser
    │
    ├─▶ https://forensic-engine-frontend.vercel.app
    │
    └─▶ Vercel CDN serves static React app
        (HTML, CSS, JS files)
```

### 2. User Uploads CSV File
```
User Browser (React App)
    │
    ├─▶ User selects CSV file
    │
    ├─▶ Frontend creates FormData with file
    │
    └─▶ POST request to VITE_API_URL/api/analyze
        │
        ▼
    Backend Serverless Function
        │
        ├─▶ Receives CSV file (multer)
        │
        ├─▶ Parses CSV content
        │
        ├─▶ Runs fraud detection algorithms
        │   - Graph analysis
        │   - Pattern detection
        │   - Score calculation
        │
        ├─▶ Returns JSON results
        │
        ▼
    Frontend receives results
        │
        ├─▶ Displays graph visualization
        │
        ├─▶ Shows suspicious accounts
        │
        └─▶ Highlights fraud rings
```

---

## File Structure on Vercel

### Frontend Deployment
```
Frontend/project/
├── dist/                    ← Built files (deployed)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── public/
│       └── logo.webp
└── vercel.json             ← Deployment config
```

### Backend Deployment
```
Backend/
├── server.js               ← Entry point (serverless function)
├── src/
│   ├── FraudDetectionSystemOptimized.js
│   ├── analyzer/
│   ├── formatter/
│   ├── graph/
│   ├── models/
│   ├── parser/
│   └── scorer/
├── package.json
└── vercel.json             ← Deployment config
```

---

## Deployment Configurations

### Backend vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Frontend vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Scaling & Performance

### Frontend (Static Site)
- ✅ Served from global CDN
- ✅ Cached at edge locations
- ✅ Near-instant load times worldwide
- ✅ No server management needed

### Backend (Serverless)
- ✅ Auto-scales based on traffic
- ✅ Pay only for actual usage
- ✅ Cold start: ~1-2 seconds
- ✅ Warm requests: <100ms overhead
- ⚠️ 10s timeout on free tier
- ⚠️ 50MB request size limit

---

## Cost Breakdown (Free Tier)

### Included Free
- 100 GB bandwidth/month
- 100 GB-hours function execution
- Unlimited static requests
- Automatic HTTPS
- Global CDN
- Unlimited deployments

### When You Need Pro ($20/month)
- Large CSV files (>10s processing)
- High traffic (>100 GB bandwidth)
- 60-second function timeout
- Priority support

---

## Security Features

### Automatic
- ✅ HTTPS/SSL certificates
- ✅ DDoS protection
- ✅ Edge network security
- ✅ Automatic security updates

### Configured
- ✅ CORS headers
- ✅ File type validation (CSV only)
- ✅ File size limits (50MB)
- ✅ Memory limits (1024MB)

---

## Monitoring & Observability

### Available Metrics
- Request count
- Response times
- Error rates
- Bandwidth usage
- Function execution time
- Cold start frequency

### Logs
```bash
# Real-time logs
vercel logs https://your-backend.vercel.app --follow

# Recent logs
vercel logs https://your-backend.vercel.app
```

---

## Comparison: Local vs Vercel

| Feature | Local Development | Vercel Production |
|---------|------------------|-------------------|
| Frontend URL | localhost:5173 | your-app.vercel.app |
| Backend URL | localhost:3001 | your-api.vercel.app |
| HTTPS | ❌ | ✅ Automatic |
| Scaling | ❌ Single machine | ✅ Auto-scales |
| Global CDN | ❌ | ✅ |
| Uptime | ⚠️ When running | ✅ 99.99% |
| Cost | Free | Free tier available |
| Setup Time | 5 minutes | 10 minutes |

---

## Next Steps After Deployment

1. ✅ Test with sample data
2. ✅ Monitor function execution times
3. ✅ Set up custom domain (optional)
4. ✅ Configure alerts for errors
5. ✅ Optimize for production traffic
6. ✅ Add authentication (if needed)
7. ✅ Set up CI/CD pipeline

---

## Support & Resources

- **Vercel Status**: https://vercel-status.com
- **Documentation**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Support**: https://vercel.com/support
