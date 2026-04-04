# Deployment Checklist & Progress Tracker

Use this checklist to track your deployment progress.

---

## Phase 1: MongoDB Atlas Setup

- [ ] Sign up to MongoDB Atlas (https://mongodb.com/cloud/atlas)
- [ ] Create free M0 cluster
- [ ] Choose region
- [ ] Create database user (save username & password!)
- [ ] Configure IP Whitelist (0.0.0.0/0 for testing)
- [ ] Get connection string
- [ ] Format connection string with password
- [ ] Test connection string is valid

**Connection String Template:**
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lexel-db?retryWrites=true&w=majority
```

---

## Phase 2: Local Testing with MongoDB Atlas

- [ ] Create `/server/.env` file
- [ ] Add `MONGODB_URI` from Atlas
- [ ] Add strong `JWT_SECRET` (min 32 chars)
- [ ] Set `NODE_ENV=development`
- [ ] Set `PORT=5000`
- [ ] Run `npm install` in server folder
- [ ] Run `npm start` in server
- [ ] See "MongoDB connected" message ✅
- [ ] See "Server running on port 5000" message ✅
- [ ] In new terminal, run `npm run dev` in client folder
- [ ] Open http://localhost:5175
- [ ] Test signup (create account)
- [ ] Test login with new account
- [ ] Create a task
- [ ] Test admin login with `admin@lexel.com` / `Admin@123`

**If all tests pass, continue to deployment! ✅**

---

## Phase 3: Railway Backend Deployment

### Preparation
- [ ] Commit all changes to GitHub: `git push`
- [ ] Repository is public or Railway has access

### Railway Setup
- [ ] Sign up to Railway (https://railway.app)
- [ ] Login to Railway
- [ ] Create new project
- [ ] Select "Deploy from GitHub repo"
- [ ] Select your repository
- [ ] Set "Root Directory" to `server`
- [ ] Start deployment

### Environment Variables (Wait for deployment to start, then add)
- [ ] Go to Railway project settings
- [ ] Click "Variables" tab
- [ ] Add `MONGODB_URI` (copy from `.env`)
  ```
  mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lexel-db?retryWrites=true&w=majority
  ```
- [ ] Add `JWT_SECRET` (same as `.env`)
- [ ] Add `NODE_ENV=production`
- [ ] Add `PORT=5000`
- [ ] Save variables
- [ ] Wait for redeploy

### Get Backend URL
- [ ] Go to Railway Settings
- [ ] Find "Domains" section
- [ ] Copy the URL: `https://your-project.railway.app`
- [ ] **Save this URL for frontend deployment!**

### Verify Backend
- [ ] Test in browser: `https://your-project.railway.app/api`
- [ ] Should not show error (blank page is OK)
- [ ] Check Railway logs for "Server running on port 5000"

---

## Phase 4: Vercel Frontend Deployment

### Preparation
- [ ] Update `/client/.env` with `VITE_API_URL` (can update after deployment too)
- [ ] Commit changes: `git push`

### Vercel Setup
- [ ] Sign up to Vercel (https://vercel.com)
- [ ] Click "Add New..." → "Project"
- [ ] Select "Import Git Repository"
- [ ] Select your project repository
- [ ] Root Directory: set to `client`
- [ ] Framework: Should auto-detect as Vite

### Environment Variables (Before deploying)
- [ ] Go to "Environment Variables"
- [ ] Add new variable:
  ```
  Name: VITE_API_URL
  Value: https://your-railway-project.railway.app/api
  ```
  (Use the Railway URL from previous step!)
- [ ] Click "Deploy"

### Get Frontend URL
- [ ] Wait for deployment (usually 2-3 min)
- [ ] See success message with URL: `https://your-project.vercel.app`
- [ ] **Save this URL!**

### Verify Frontend
- [ ] Open `https://your-project.vercel.app`
- [ ] Page loads without errors
- [ ] Can fill out signup form

---

## Phase 5: Full Deployment Testing

### Test Employee Features
- [ ] Open https://your-project.vercel.app
- [ ] Sign up with new email
- [ ] See "Registration pending approval"
- [ ] Login with new credentials
- [ ] Dashboard loads with your name
- [ ] Create a task
- [ ] Edit a task
- [ ] View task history

### Test Admin Features
- [ ] Clear cookies/logout
- [ ] Go to https://your-project.vercel.app/admin/login
- [ ] Login with:
  - Email: `admin@lexel.com`
  - Password: `Admin@123`
- [ ] Admin Dashboard loads
- [ ] See pending user approvals
- [ ] Approve a user
- [ ] View all teams
- [ ] Everything works smoothly

### Check Backend Logs
- [ ] Go to Railway dashboard
- [ ] Click your project
- [ ] Click "Server" service
- [ ] Go to "Logs" tab
- [ ] See requests from your frontend
- [ ] No errors showing (warnings are OK)

---

## Phase 6: Post-Deployment

### Security
- [ ] ✅ Changed default admin password (optional but recommended)
- [ ] ✅ Saved MongoDB password securely
- [ ] ✅ Didn't commit `.env` files to GitHub
- [ ] ✅ JWT_SECRET is strong (32+ chars)

### Documentation Update
- [ ] Document live URLs
- [ ] Document admin login credentials
- [ ] Save MongoDB Atlas credentials
- [ ] Save Railway project ID
- [ ] Save Vercel project ID

### Set Up Future Deployments
- [ ] Understand git push → auto deploy workflow
- [ ] Know how to check logs in Railway
- [ ] Know how to check logs in Vercel
- [ ] Know how to update env variables

### Monitoring
- [ ] Check Railway logs when apps behaves oddly
- [ ] Note any errors for future fixing
- [ ] Keep backups of important data
- [ ] Monitor cost (should be free tier)

---

## Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Blank page on frontend | Check browser console (F12) for errors |
| Cannot connect to backend | Verify VITE_API_URL in Vercel env vars |
| MongoDB connection fails | Check MongoDB username/password/connection string |
| Admin login doesn't work | Check your MongoDB has admin@lexel.com user |
| Database shows no data | Wait 30 seconds and refresh (might be loading) |
| Railway build failed | Check Railway logs, likely missing npm install |

---

## Deployment Timeline

```
Time     | Task                              | Status
---------|-----------------------------------|-------
0-10 min | MongoDB Atlas Setup              | 🟡 In Progress
10-15min | Local Testing                    | ⏳ Waiting
15-25min | Railway Backend Deploy           | ⏳ Waiting
25-35min | Vercel Frontend Deploy           | ⏳ Waiting
35-40min | Full Testing & Verification      | ⏳ Waiting
40+ min  | Live! 🎉                         | ✅ Complete
```

---

## Contact Support

If you get stuck:

**Railway Support**: https://railway.app/support
**Vercel Support**: https://vercel.com/support
**MongoDB Help**: https://docs.atlas.mongodb.com

---

## You're Ready! 🚀

Follow this checklist step-by-step and your project will be deployed!

**Questions?** Re-read the deployment guide or check logs carefully.
