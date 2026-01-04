# Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### Step 1: Confirm Backend is LIVE

Open in browser:
```
https://YOUR_BACKEND_URL/api/health
```

✔ Must return: `{"status":"ok","message":"Code Vimarsh API is running"}`

❌ If not → deploy backend first (Render / Railway)

---

### Step 2: Frontend Environment Variable (Vercel)

**Vercel Dashboard → Project → Settings → Environment Variables**

Add:
```
VITE_API_URL = https://YOUR_BACKEND_URL
```

⚠️ **Important:** 
- Do NOT include `/api` suffix
- Use `https://` (not `http://`)
- Example: `https://code-vimarsh-backend.onrender.com`

👉 **Redeploy frontend after adding this variable**

---

### Step 3: Backend Environment Variables

**In your backend hosting (Render/Railway):**

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=5000
```

⚠️ **Critical:** Missing `JWT_SECRET` = silent authentication failures

---

### Step 4: Backend CORS Configuration

The backend is already configured to:
- Allow localhost in development
- Use `FRONTEND_URL` environment variable in production
- Support multiple frontend URLs (comma-separated)

**To add multiple frontend URLs:**
```
FRONTEND_URL=https://app1.vercel.app,https://app2.vercel.app
```

---

### Step 5: Deployment Order

**Deploy in this order:**

1️⃣ **Backend first** (Render/Railway)
   - Wait for backend to be live
   - Test health endpoint

2️⃣ **Frontend second** (Vercel)
   - Set `VITE_API_URL` environment variable
   - Deploy

---

### Step 6: Verify Deployment

**In Browser DevTools → Network Tab:**

1. **Register/Login Request:**
   - ✔ Status: 200
   - ✔ Response contains `token`

2. **Application → Local Storage:**
   - ✔ `codevimarsh_token` exists
   - ✔ `codevimarsh_user` exists

3. **Test API Calls:**
   - ✔ Projects load
   - ✔ Events load
   - ✔ User profile loads

---

## 🔧 What Was Changed

### Frontend Changes:
- ✅ Removed all `localhost` references
- ✅ Added `withCredentials: true` to axios
- ✅ Created `getAssetUrl()` helper for asset URLs
- ✅ Fixed register logic to use token from register response (no auto-login call)
- ✅ Updated API base URL to use environment variable

### Backend Changes:
- ✅ Updated CORS to support Vercel URLs
- ✅ Health check endpoint at `/api/health`
- ✅ Register endpoint returns token in response

---

## 🐛 Troubleshooting

### Issue: Login fails in production
**Solution:** Check `JWT_SECRET` is set in backend environment variables

### Issue: CORS errors
**Solution:** 
1. Verify `FRONTEND_URL` matches your Vercel URL exactly
2. Check backend logs for CORS errors
3. Ensure URL includes `https://`

### Issue: Images not loading
**Solution:** 
- Images use relative paths or full URLs
- Check `VITE_API_URL` is set correctly
- Verify backend serves `/uploads` directory

### Issue: Register works but user not logged in
**Solution:**
- Check browser console for errors
- Verify token is in localStorage
- Check network tab for 200 response

---

## 📝 Notes

- All localhost references have been removed from frontend
- API calls use environment variable `VITE_API_URL`
- Backend CORS is configured for production
- Register endpoint returns token (no separate login needed)
- Asset URLs are handled via `getAssetUrl()` helper

---

## 🚀 Quick Deploy Commands

**Backend (Render/Railway):**
```bash
# Already configured - just push to GitHub
git push origin main
```

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect GitHub repo in Vercel dashboard for automatic deployments.

