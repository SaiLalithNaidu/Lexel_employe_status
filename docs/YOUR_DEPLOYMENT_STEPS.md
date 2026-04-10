# Railway Deployment - Step-by-Step for YOUR Project

## Your Details Ready
- **Repository**: https://github.com/SaiLalithNaidu/Lexel_employe_status.git
- **MongoDB**: ✅ Connected (Atlas)
- **JWT Secret**: ✅ Generated

---

## Step 1: Create Railway Project

1. Open https://railway.app/dashboard
2. Click **"New Project"** (big button)
3. Click **"Deploy from GitHub repo"**
4. Select repository: **Lexel_employe_status**
5. It will show file structure - select **server** folder
6. Click **"Deploy"**

---

## Step 2: Add Environment Variables (IMPORTANT!)

While it's deploying:

1. In Railway dashboard, click on the project
2. Go to **"Variables"** tab on the left
3. Click **"RAW Editor"** (easier to paste)
4. **Paste exactly:**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://sailalithnaidu:Lalith1612@cluster-1.bcbv99e.mongodb.net/lexel-db?retryWrites=true&w=majority
JWT_SECRET=xK9@mN2$qL7vW5#pR3!sT8%uY1^zB4&aD6*cF0(eG2)hJ5-kM7+lP9=oV1|wX3:yZ5;A7~B9
CORS_ORIGIN=*
```

5. Click **"Save"**

---

## Step 3: Get Your Backend URL

1. In Railway, go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. You'll see something like: `your-project-name.railway.app`
4. Copy this URL ✅

**This is your BACKEND URL for the frontend!**

---

## Step 4: Check Backend is Running

1. Go to **"Logs"** tab
2. Look for message: **"Server running on port 5000"**
3. If you see it ✅, backend is working!

---

## Step 5: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository
5. **Root Directory**: Set to `client`
6. Go to **"Environment Variables"**
7. Add:
   ```
   Name: VITE_API_URL
   Value: https://your-project-name.railway.app/api
   ```
   (Replace with your actual Railway URL from Step 3)

8. Click **"Deploy"**

---

## Step 6: Test Everything

After Vercel deploys (2-3 minutes):

1. Open your Vercel URL: `https://your-project-name.vercel.app`
2. Try to **Sign Up** with new email
3. Try to **Login**
4. Try to **Create Task**
5. For **Admin**: Go to `/admin/login`
   - Email: `admin@lexel.com`
   - Password: `Admin@123`

---

## ✅ You're Done!

Your app is now live with:
- **Frontend**: https://your-vercel-url.vercel.app ✅
- **Backend**: https://your-railway-url.railway.app ✅
- **Database**: MongoDB Atlas ✅

---

## Troubleshooting

### Frontend shows blank page?
- Check browser console (F12)
- Check Vercel logs
- Verify VITE_API_URL is correct

### API calls say "Cannot reach server"?
- Verify VITE_API_URL is correct
- Check Railway logs for errors
- Make sure backend URL doesn't have `/` at end

### MongoDB connection error in Railway logs?
- Check MONGODB_URI is correct
- Verify MongoDB user & password
- Make sure MongoDB IP whitelist includes Railway

---

## After Deployment

Whenever you update code:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

✅ Both Railway and Vercel auto-redeploy!
