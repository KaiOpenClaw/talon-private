# 🚨 RENDER EMERGENCY DEPLOYMENT GUIDE

**Issue**: #197 Critical Infrastructure Outage Recovery  
**Generated**: 2026-02-19T15:38:50Z  
**Status**: READY FOR DEPLOYMENT

## Quick Deployment Steps

### 1. Access Render Dashboard
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. Choose GitHub repository: `KaiOpenClaw/talon-private`

### 2. Configure Service
- **Name**: `talon-private`
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Set Environment Variables
Copy from `render-environment.env`:

```
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=[token from file]
TALON_API_URL=https://schema-tracked-buyers-publicity.trycloudflare.com  
TALON_API_TOKEN=talon-7k9m2x4pqr8w
OPENAI_API_KEY=[key from file]
TALON_AUTH_TOKEN=[generated token]
NODE_ENV=production
PORT=10000
```

### 4. Deploy & Test
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Test endpoints:
   - `https://YOUR-SERVICE.onrender.com/` → Should load dashboard
   - `https://YOUR-SERVICE.onrender.com/api/health` → Should return 200
   - `https://YOUR-SERVICE.onrender.com/api/agents` → Should return agent list

## Troubleshooting

### Build Failures
- Check build logs for dependency issues
- Verify Node.js version (16+ required)
- Ensure all environment variables are set

### Runtime Errors  
- Check application logs in Render dashboard
- Verify external service connectivity
- Test authentication endpoints

### Performance Issues
- Monitor memory usage (512MB default)
- Check for LanceDB startup time
- Consider upgrading Render plan if needed

## Post-Deployment Validation

Test these endpoints after deployment:
- [ ] `/` - Dashboard loads
- [ ] `/api/health` - Returns 200 OK
- [ ] `/api/agents` - Returns agent list  
- [ ] `/api/sessions` - Returns sessions
- [ ] `/search` - Search functionality works
- [ ] `/login` - Authentication system functional

## Emergency Rollback

If deployment fails:
1. Check previous working deployment in Render dashboard
2. Revert to last known good commit
3. Re-trigger deployment
4. Contact infrastructure team if issues persist

