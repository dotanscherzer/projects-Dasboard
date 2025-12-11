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
   - In Render dashboard, go to your service → Environment
   - Add the following variables (from `backend/.env.example`):
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
   - The `render.yaml` file configures:
     - Web service (main API)
     - 5 cron jobs for scheduled syncs (health, deploys, db-health, automation-health, cleanup)

4. **Get Backend URL**:
   - After deployment, note your backend URL (e.g., `https://project-ops-backend.onrender.com`)
   - This will be needed for frontend configuration

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

## Key Concepts

- **Projects**: Main entities representing applications or initiatives
- **Services**: Individual services (backend, frontend, DB, automation) belonging to projects
- **Metrics**: Time-series data collected from services
- **Work Items**: Tasks and items to track per project
- **Provider Internal ID**: Unique identifier for querying services from external providers (required when creating services)

