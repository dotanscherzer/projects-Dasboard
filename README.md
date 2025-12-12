# Project Ops Dashboard V2

A comprehensive project management and monitoring system for tracking projects, services, and automations across multiple cloud providers.

## Architecture

- **Backend**: Node.js + TypeScript + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite + TypeScript
- **Database**: MongoDB Atlas
- **Deployment**: 
  - Backend: Render
  - Frontend: Netlify

## Features

1. **Project Lifecycle Tracking**: Track projects from idea to live
2. **Service Monitoring**: Monitor Render, Netlify, MongoDB Atlas services
3. **Automation Monitoring**: Track Make.com scenarios with status and metrics
4. **Work Item Management**: Organize tasks per project
5. **Metrics Collection**: Health, response times, deploy status, automation metrics
6. **Dashboard Overview**: Summary statistics and high-priority projects

## Setup

### Backend

1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run: `npm run dev`

### Frontend

1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run: `npm run dev`

## Git Setup and Deployment

### Initial Git Setup

1. Initialize git repository (if not already initialized):
```bash
git init
```

2. Create `.gitignore` files (already included):
   - Root level `.gitignore` (if needed)
   - `backend/.gitignore` - ignores node_modules, dist, .env
   - `frontend/.gitignore` - ignores node_modules, dist, .env

3. Add all files to git:
```bash
git add .
git commit -m "Initial commit: Project Ops Dashboard V2"
```

4. Create a repository on GitHub/GitLab/Bitbucket and push:
```bash
git remote add origin <your-repository-url>
git branch -M main
git push -u origin main
```

### Deployment

#### Backend (Render)

1. **Connect Repository to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Render will automatically detect `render.yaml` in the root directory

2. **Environment Variables Setup**:
   - 📖 **See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step instructions**
   - In Render dashboard, go to your service → Environment
   - Add the following variables:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - A secure random string for JWT tokens
     - `INTERNAL_SECRET` - A secure random string for internal API authentication
     - `RENDER_API_KEY` - (Optional) Render API key for health sync
     - `NETLIFY_API_TOKEN` - (Optional) Netlify API token
     - `NETLIFY_SITE_ID` - (Optional) Netlify site ID
     - `MONGODB_ATLAS_API_PUBLIC_KEY` - (Optional) MongoDB Atlas API public key
     - `MONGODB_ATLAS_API_PRIVATE_KEY` - (Optional) MongoDB Atlas API private key
     - `MONGODB_ATLAS_PROJECT_ID` - (Optional) MongoDB Atlas project ID
     - `MAKE_WEBHOOK_SECRET` - (Optional) Make.com webhook secret

3. **Deploy**:
   - Render will automatically deploy when you push to the main branch
   - The `render.yaml` file configures the web service. Scheduled jobs now run inside the app using `node-cron` (no Render cron jobs needed).

4. **Get Backend URL**:
   - After deployment, note your backend URL (e.g., `https://project-ops-backend.onrender.com`)
   - This will be needed for frontend configuration

#### Cron Jobs (Free, In-App via node-cron)

Scheduled tasks now run inside the backend service using `node-cron` (no separate Render cron jobs). All schedules are configured in `backend/src/scheduler.ts` and start automatically when the server boots.

**Job list and schedules (UTC)**:
- `health-sync`: every 5 minutes (`*/5 * * * *`)
- `deploy-sync`: every 15 minutes (`*/15 * * * *`)
- `db-health-sync`: hourly at minute 0 (`0 * * * *`)
- `automation-health-sync`: every 12 minutes (`*/12 * * * *`)
- `metrics-cleanup`: daily at 2:00 AM UTC (`0 2 * * *`)

**Required environment variables (set on the web service)**:
- `API_URL`: The public URL of your backend (e.g., `https://project-ops-backend.onrender.com`)
- `INTERNAL_SECRET`: Must match the backend's `INTERNAL_SECRET`

**Notes**:
- No Render cron services are needed; keep only the web service in `render.yaml`.
- If `API_URL` or `INTERNAL_SECRET` are missing, the scheduler logs a warning and skips starting.

#### Frontend (Netlify)

1. **Connect Repository to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Select the repository and branch

2. **Build Settings** (automatically detected from `netlify.toml`):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = Your Render backend URL (e.g., `https://project-ops-backend.onrender.com`)

4. **Deploy**:
   - Netlify will automatically deploy when you push to the main branch
   - Or click "Trigger deploy" → "Deploy site" for manual deployment

5. **Update Backend CORS** (if needed):
   - In your backend code, ensure CORS allows your Netlify domain
   - Or use `cors()` middleware which allows all origins in development

### Continuous Deployment

Both Render and Netlify support automatic deployments:
- **Automatic**: Every push to `main` branch triggers a new deployment
- **Manual**: You can trigger deployments from the dashboard
- **Preview**: Netlify creates preview deployments for pull requests

### Deployment Workflow

1. Make changes to your code
2. Commit and push to Git:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
3. Render and Netlify will automatically build and deploy
4. Monitor deployment status in respective dashboards

## API Documentation

See `backend/README.md` for detailed API documentation.

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Verify `MONGODB_URI` is correctly set in Render environment variables
- **JWT Errors**: Ensure `JWT_SECRET` is set and is a secure random string
- **Internal Routes 401**: Verify `INTERNAL_SECRET` matches between Render services and cron jobs
- **Cron Jobs Failing**: Check that `API_URL` and `INTERNAL_SECRET` are set in cron job environment variables

### Frontend Issues

- **API Connection Errors**: Verify `VITE_API_URL` is set correctly in Netlify environment variables
- **CORS Errors**: Ensure backend CORS middleware allows your Netlify domain
- **Build Failures**: Check that all dependencies are in `package.json` and Node version matches

### Deployment Issues

- **Render Build Fails**: Check build logs, ensure all dependencies are listed in `package.json`
- **Netlify Build Fails**: Verify base directory is set to `frontend` in Netlify settings
- **Environment Variables Not Loading**: Ensure variables are set in the correct service/environment
- **"Cannot find module dist/server.js" Error**: 
  - If you created the service manually (not via Blueprint), Render may not be using `render.yaml`
  - **Solution 1 (Recommended)**: Delete the service and recreate it via Blueprint:
    - Go to Render Dashboard → "New +" → "Blueprint"
    - Connect your Git repository
    - Render will automatically detect `render.yaml` and create all services with correct build/start commands
  - **Solution 2**: Manually update service settings in Render dashboard (detailed steps below)

### Manual Render Service Configuration (Option 2 - Detailed Steps)

If you created your services manually in Render, follow these steps to configure each service:

#### Step 1: Update Web Service (project-ops-backend)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **project-ops-backend** service (or the name you gave it)
3. Click on **Settings** in the left sidebar
4. Scroll down to **Build & Deploy** section
5. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `npm start`
6. Scroll to the top and click **Save Changes**
7. Render will automatically trigger a new deployment

#### Step 2: Update Cron Job - health-sync

1. In Render Dashboard, click on your **health-sync** cron job
2. Click on **Settings** in the left sidebar
3. Scroll down to **Build & Deploy** section
4. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `node dist/cron-health.js`
5. Click **Save Changes**

#### Step 3: Update Cron Job - deploy-sync

1. In Render Dashboard, click on your **deploy-sync** cron job
2. Click on **Settings** in the left sidebar
3. Scroll down to **Build & Deploy** section
4. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `node dist/cron-deploys.js`
5. Click **Save Changes**

#### Step 4: Update Cron Job - db-health-sync

1. In Render Dashboard, click on your **db-health-sync** cron job
2. Click on **Settings** in the left sidebar
3. Scroll down to **Build & Deploy** section
4. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `node dist/cron-db-health.js`
5. Click **Save Changes**

#### Step 5: Update Cron Job - automation-health-sync

1. In Render Dashboard, click on your **automation-health-sync** cron job
2. Click on **Settings** in the left sidebar
3. Scroll down to **Build & Deploy** section
4. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `node dist/cron-automation-health.js`
5. Click **Save Changes**

#### Step 6: Update Cron Job - metrics-cleanup

1. In Render Dashboard, click on your **metrics-cleanup** cron job
2. Click on **Settings** in the left sidebar
3. Scroll down to **Build & Deploy** section
4. Update the following fields:
   - **Root Directory**: Enter `backend`
   - **Build Command**: Enter `npm install && npm run build`
   - **Start Command**: Enter `node dist/cron-cleanup.js`
5. Click **Save Changes**

#### Step 7: Verify Environment Variables

For each service, verify that environment variables are set correctly:

**Web Service (project-ops-backend)** - Go to **Environment** tab and ensure these are set:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (should be `7d`)
- `INTERNAL_SECRET`
- `NODE_ENV` (should be `production`)
- `PORT` (should be `10000`)
- Optional: `RENDER_API_KEY`, `NETLIFY_API_TOKEN`, `NETLIFY_SITE_ID`, `MONGODB_ATLAS_API_PUBLIC_KEY`, `MONGODB_ATLAS_API_PRIVATE_KEY`, `MONGODB_ATLAS_PROJECT_ID`, `MAKE_WEBHOOK_SECRET`

**All Cron Jobs** - Go to **Environment** tab for each cron job and ensure:
- `API_URL` - Should be set to your web service URL (or use "Link to Service" feature)
- `INTERNAL_SECRET` - Must match the `INTERNAL_SECRET` in your web service

#### Step 8: Trigger New Deployment

After updating all settings:
1. Go back to your **project-ops-backend** web service
2. Click on **Manual Deploy** → **Deploy latest commit**
3. Monitor the build logs to ensure:
   - Build command runs: `npm install && npm run build`
   - TypeScript compiles successfully (you should see `dist/` folder created)
   - Start command runs: `npm start`
   - Server starts without "Cannot find module" errors

## Key Concepts

- **Projects**: Main entities representing applications or initiatives
- **Services**: Individual services (backend, frontend, DB, automation) belonging to projects
- **Metrics**: Time-series data collected from services
- **Work Items**: Tasks and items to track per project
- **Provider Internal ID**: Unique identifier for querying services from external providers (required when creating services)

