# Step-by-Step Deployment Guide (First Time)

This guide walks you through deploying your project for the first time with **Railway** (backend), **Vercel** (frontend), and **MongoDB Atlas** (database).

---

## ⏱️ Estimated Time: 30-45 minutes

---

## 🎯 What You'll Do

1. ✅ Set up MongoDB Atlas (free database)
2. ✅ Test with MongoDB Atlas locally
3. ✅ Deploy backend to Railway (your server)
4. ✅ Deploy frontend to Vercel (your website)
5. ✅ Connect everything together

---

## Part 1: MongoDB Atlas Setup (10 minutes)

MongoDB Atlas is a **free cloud database**. No credit card needed for free tier.

### Step 1.1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** button
3. Sign up with email (or Google/GitHub)
4. Verify your email
5. Complete the onboarding questionnaire

### Step 1.2: Create a Cluster (Free)

After login:

1. Click **"Create a Deployment"**
2. Select **M0 (Free)** tier
3. Choose your region (pick one closest to you or your users)
4. Click **"Create Deployment"**
5. Wait for cluster to deploy (2-3 minutes)

### Step 1.3: Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `lexeluser` (or your choice)
4. Password: Create a strong password (save it!)
   - Example: `XkP9@mN2$qL7vW`
5. Click **"Add User"**

### Step 1.4: Configure IP Whitelist

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for testing)
   - This adds `0.0.0.0/0` which allows all IPs
4. Click **"Confirm"**

### Step 1.5: Get Connection String

1. Go to **"Databases"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Click **"Drivers"** tab
4. Select **Node.js** and version **4.x**
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://lexeluser:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `PASSWORD` with your actual password**

**Example Final String:**
```
mongodb+srv://lexeluser:XkP9@mN2$qL7vW@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

✅ **Save this connection string safely!**

---

## Part 2: Test Locally with MongoDB Atlas (5 minutes)

Now let's test your app with the cloud database before deployment.

### Step 2.1: Update Backend Environment

1. Open `/server/.env` file:
   ```bash
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://lexeluser:XkP9@mN2$qL7vW@cluster0.abc123.mongodb.net/lexel-db?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-min-32-chars-use-something-hard-to-guess-like-this-one
   ```

2. **Replace:**
   - `lexeluser` → your MongoDB username
   - `XkP9@mN2$qL7vW` → your MongoDB password
   - `cluster0.abc123` → your actual cluster name (from connection string)

### Step 2.2: Test Backend

```bash
cd server
npm install
npm start
```

You should see:
```
MongoDB connected: mongodb+srv://...
Server running on port 5000
```

If you see this ✅, your backend and MongoDB are talking correctly!

### Step 2.3: Test Frontend

In a new terminal:
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5175 and test:
- Sign up with a new employee account
- Create a task
- For admin: go to http://localhost:5175/admin/login

**If everything works locally, you're ready to deploy!**

---

## Part 3: Deploy Backend to Railway (10 minutes)

Railway is like a container for your server in the cloud.

### Step 3.1: Sign Up to Railway

1. Go to https://railway.app
2. Click **"Start Project"**
3. Click **"Sign up with GitHub"** (recommended)
4. Authorize Railway to access GitHub
5. Follow login process

### Step 3.2: Create New Project

1. Click **"New Project"** in Railway dashboard
2. Click **"Deploy from GitHub repo"**
3. **Authorize** Railway to access your GitHub
4. Select your project repository
5. Select the **server** folder in the "Root Directory"
   - This tells Railway to deploy only the backend
6. Click **"Deploy"**

Railway will start deploying! ⏳

### Step 3.3: Configure Environment Variables

While deployment runs:

1. In Railway dashboard, click your project
2. Go to **"Variables"** tab
3. Add these variables:
   ```
   MONGODB_URI = mongodb+srv://lexeluser:XkP9@mN2$qL7vW@cluster0.abc123.mongodb.net/lexel-db?retryWrites=true&w=majority
   JWT_SECRET = your-super-secret-key-32-chars-or-longer
   NODE_ENV = production
   PORT = 5000
   ```

4. Click **"Save"**

Railway will automatically redeploy with new variables.

### Step 3.4: Get Your Backend URL

1. In Railway dashboard, go to **"Settings"** tab
2. Scroll to **"Domains"**
3. You should see something like:
   ```
   your-project-name.railway.app
   ```
4. Copy this URL (you'll need it for frontend)

**Your backend is now live!** 🎉

Test it:
```
https://your-project-name.railway.app/api/health
```

Should return something (or no error = success).

---

## Part 4: Deploy Frontend to Vercel (10 minutes)

Vercel is designed for React apps and is super easy.

### Step 4.1: Sign Up to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"** (recommended)
4. Authorize Vercel

### Step 4.2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Paste your GitHub repository URL or select from list
4. Click **"Import"**

### Step 4.3: Configure for Client

1. **Root Directory**: Set to `client`
   - This tells Vercel where your React app is
2. **Framework**: Should auto-detect as Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 4.4: Add Environment Variables

Before deployment:

1. Go to **"Environment Variables"** section
2. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://your-project-name.railway.app/api
   ```
   (Replace with your actual Railway backend URL from Part 3)

3. Click **"Deploy"**

Vercel will build and deploy your frontend! ⏳

### Step 4.5: Get Your Frontend URL

Once deployed (usually 2-3 minutes):

1. You'll see a success message with your URL
   ```
   https://your-project-name.vercel.app
   ```

**Your frontend is now live!** 🎉

---

## Part 5: Connect Everything & Test (5 minutes)

### Step 5.1: Update Frontend to Use New Backend

If you deployed to different domains, the `VITE_API_URL` should already be set in Vercel.

If not:

1. Go to Vercel dashboard
2. Click your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Edit `VITE_API_URL`:
   ```
   https://your-railway-backend.railway.app/api
   ```
5. Redeploy by clicking **"Deployments"** → **"Redeploy"** on latest

### Step 5.2: Test Everything

1. Open https://your-project-name.vercel.app
2. Try to sign up as employee
3. Verify the account is created (check Railway logs)
4. Try admin login with:
   - Email: `admin@lexel.com`
   - Password: `Admin@123`

### Step 5.3: Check Logs

**Backend Logs (Railway):**
1. Go to Railway dashboard
2. Click your project
3. Click **"Server"** service
4. Go to **"Logs"** tab
5. You should see requests from your frontend

If seeing errors, that's okay! Common ones:

| Error | Fix |
|-------|-----|
| Cannot GET /api | Make sure Railway backend is running |
| Cannot find module | Need to run `npm install` (Railway does this auto) |
| MongoDB connection failed | Check MONGODB_URI env variable |
| CORS error | Make sure frontend URL is allowed in backend |

---

## 🎊 You Did It!

Your project is now live! Here's what you have:

| Component | URLs |
|-----------|------|
| Frontend (Website) | https://your-project.vercel.app |
| Backend (API) | https://your-project.railway.app/api |
| Database | MongoDB Atlas cloud |
| Admin Panel | https://your-project.vercel.app/admin/login |

---

## 📋 Important Notes for First Deployment

### Security

- ✅ Change admin password after first login
- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Never share `.env` files
- ✅ Keep MongoDB password safe

### Making Updates

After deployment, to push new changes:

```bash
# Make changes locally
git add .
git commit -m "Your message"
git push origin main

# Both Vercel and Railway auto-deploy!
```

### Monitoring

- Check Railway logs daily
- Monitor Vercel deployment status
- Test admin features regularly
- Keep backups of important data

### Common Deployment Mistakes

❌ **Don't commit `.env` files to GitHub**
- GitHub will expose your passwords!
- Always use environment variables in hosting dashboards

❌ **Don't use `localhost` in production**
- Your backend won't talk to frontend in cloud

❌ **Don't skip MongoDB whitelist**
- Can't connect to database without it

---

## 🆘 Troubleshooting

### Frontend shows blank page

1. Check Vercel logs: **Settings** → **Function Logs**
2. Open browser DevTools (F12) → **Console** tab
3. Look for red errors
4. Common fix: Verify `VITE_API_URL` in Vercel environment

### Backend says "MongoDB connection failed"

1. Open your `.env` in server folder
2. Check MongoDB connection string:
   - Username correct?
   - Password correct?
   - Has `@` sign?
   - Has `?retryWrites=true`?
3. Go to MongoDB Atlas → verify IP whitelist includes Railway

### "Cannot POST /api/auth/signup"

1. Check Railway logs for errors
2. Verify `npm install` ran on Railway
3. Check environment variables in Railway

### Help! Everything is broken

Go back and check:
1. Local `.env` files are correct ✅
2. MongoDB connection string in Railway env ✅
3. Frontend env using correct backend URL ✅
4. Both apps built successfully locally ✅

---

## What's Next?

After successful deployment:

- [ ] Test all features on live site
- [ ] Set up email notifications
- [ ] Add more admin features
- [ ] Scale database if needed
- [ ] Add monitoring/analytics
- [ ] Set up automatic backups

---

## Quick Reference

| Step | Time | Status |
|------|------|--------|
| MongoDB Atlas Setup | 10 min | ⏳ |
| Local Testing | 5 min | ⏳ |
| Railway Backend | 10 min | ⏳ |
| Vercel Frontend | 10 min | ⏳ |
| Connect & Test | 5 min | ⏳ |

**Total: ~40 minutes to live deployment!** 🚀

---

## Need More Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
