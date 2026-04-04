# Deployment Guide - Lexel Employee Status Tracker

This guide covers deploying the full-stack application (React frontend + Node.js backend + MongoDB).

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Recommended Deployment Options](#recommended-deployment-options)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All sensitive data removed from source code
- [ ] Environment variables configured properly
- [ ] `.env` files added to `.gitignore`
- [ ] Tests pass locally
- [ ] Both frontend and backend build successfully
- [ ] Database backups taken
- [ ] HTTPS/SSL certificates ready
- [ ] API endpoints updated to production URLs

---

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lexel-db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Admin Email (for first-time setup)
ADMIN_EMAIL=admin@lexel.com
```

### Frontend Environment Variables

Create a `.env` file in the `/client` directory:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

> **Important**: Never commit `.env` files. Add them to `.gitignore`.

---

## Backend Deployment

### Option 1: Railway (Recommended - Easiest)

**Pros**: Automatic deployments, easy GitHub integration, free tier available

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add MongoDB (PostgreSQL/MySQL also available)
5. Set environment variables in Railway dashboard
6. Deploy automatically on git push

### Option 2: Render

**Pros**: Similar to Railway, good documentation, free tier

1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set Build Command: `cd server && npm install`
5. Set Start Command: `npm start`
6. Add environment variables
7. Deploy

### Option 3: Heroku

**Pros**: Industry standard, reliable

1. Sign up at [heroku.com](https://www.heroku.com)
2. Install Heroku CLI
3. Run:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

### Option 4: DigitalOcean App Platform

1. Push code to GitHub
2. Connect repository to DigitalOcean
3. Add environment variables
4. Select Node.js runtime
5. Set build/start commands
6. Deploy

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Pros**: Optimized for React/Vite, automatic deployments, fast CDN

1. Sign up at [vercel.com](https://vercel.com)
2. Import Git repository
3. Select `client` as root directory
4. Add build command: `npm run build`
5. Add environment variables (VITE_API_URL)
6. Deploy

### Option 2: Netlify

1. Sign up at [netlify.com](https://www.netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy

### Option 3: GitHub Pages

1. Update `vite.config.js`:
   ```javascript
   export default {
     base: '/your-repo-name/',
     ...
   }
   ```
2. Build: `npm run build`
3. Push `dist/` folder to `gh-pages` branch

---

## Database Setup

### MongoDB Atlas (Recommended - Free Tier Available)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (M0 free tier)
4. Set up database user (username/password)
5. Whitelist your IP address
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/lexel-db`
7. Add to backend `.env` as `MONGODB_URI`

#### Initial Database Setup

After connecting to MongoDB Atlas:

```bash
cd server
npm start
```

The application will automatically create collections on first run.

#### Create Admin User (Optional)

Connect to your MongoDB database and insert:

```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@lexel.com",
  password: "$2b$10$...", // Use bcrypt to hash password
  designation: "Administrator",
  team: "others",
  status: "approved",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Build & Production Setup

### Backend Build

```bash
cd server
npm install
npm run build  # If you have a build script
```

### Frontend Build

```bash
cd client
npm install
npm run build
# Creates optimized build in client/dist/
```

---

## Deployment Architecture Options

### Option A: Separate Deployments (Recommended for Scaling)

```
┌─────────────────────┐         ┌──────────────────┐
│  Vercel/Netlify     │         │ Railway/Render   │
│  React Frontend     │────────▶│ Node.js Backend  │
│  (client/dist)      │         │                  │
└─────────────────────┘         └────────┬─────────┘
                                         │
                                ┌────────▼─────────┐
                                │  MongoDB Atlas   │
                                └──────────────────┘
```

**Advantages**:
- Independent scaling
- Different tech stacks can coexist
- Easy to manage updates separately
- Better performance

### Option B: Full-Stack Single Deployment

Deploy both frontend and backend on same server (Heroku, Railway, DigitalOcean).

```
┌──────────────────────────────┐
│   Railway/Heroku/Render      │
│  ┌──────────────────────────┐│
│  │  Express + Static Files  ││
│  │  (Backend + Client Dist) ││
│  └──────────────────────────┘│
│            ▲                  │
│            │                  │
└────────────┼──────────────────┘
             │
    ┌────────▼──────────┐
    │  MongoDB Atlas    │
    └───────────────────┘
```

**To do this**:

1. Build frontend: `cd client && npm run build`
2. Copy `client/dist` to `server/public/`
3. In `server/src/index.js`:
   ```javascript
   app.use(express.static(path.join(__dirname, '../public')));
   ```
4. Deploy server

---

## Step-by-Step Deployment (Using Railway + Vercel)

### Backend on Railway

1. Login to Railway
2. Create new project
3. Select "GitHub Repo"
4. Choose your repository
5. Add a MySQL or PostgreSQL database
6. Set variables in Railway:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
7. Deploy on git push

### Frontend on Vercel

1. Login to Vercel
2. Import project
3. Framework preset: Vite
4. Root directory: `client`
5. Build command: `npm run build`
6. Environment variables:
   - `VITE_API_URL=https://your-railway-backend.railway.app/api`
7. Deploy

---

## Post-Deployment

### Verify Deployment

```bash
# Test backend API
curl https://your-backend.com/api/health

# Test frontend
# Visit https://your-frontend.com
```

### Monitoring

- Set up error tracking (Sentry, LogRocket)
- Enable database backups
- Monitor API response times
- Check error logs regularly

### Update Production

1. Make changes locally
2. Test thoroughly
3. Push to main branch
4. Deployment happens automatically
5. Verify on production URL

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Update backend CORS config with frontend URL |
| Database connection fails | Check MongoDB Atlas IP whitelist |
| Static files not loading | Ensure frontend build output is in correct location |
| 404 Not Found on page refresh | Configure fallback routes for SPA |
| Slow performance | Enable caching, use CDN, optimize images |

### Environment Variable Issues

- Ensure all required variables are set
- Check variable names match exactly (case-sensitive)
- Use `console.log` to verify variables load

### Database Issues

- Check connection string format
- Verify MongoDB user has correct permissions
- Ensure database exists in Atlas

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Enable HTTPS/SSL on all domains
- [ ] Add `CORS_ORIGIN` environment variable
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Store sensitive data in environment variables only
- [ ] Enable database backups
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelist in Atlas

---

## Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| MongoDB Atlas | Free/Shared | $0 / $57 |
| Railway | Starter | $5 |
| Vercel | Free/Pro | $0 / $20 |
| **Total** | **Minimal** | **$0-85** |

---

## References

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Express Production](https://expressjs.com/en/advanced/best-practice-performance.html)

