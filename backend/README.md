# Project Ops Dashboard Backend

Backend API for Project Ops Dashboard V2 built with Node.js, TypeScript, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your configuration values.

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects (with optional filters)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Metrics
- `GET /api/metrics` - Get metrics
- `POST /api/metrics` - Create new metric

### Work Items
- `GET /api/workitems` - Get all work items
- `GET /api/workitems/:id` - Get work item by ID
- `POST /api/workitems` - Create new work item
- `PUT /api/workitems/:id` - Update work item
- `DELETE /api/workitems/:id` - Delete work item

### Summary
- `GET /api/summary` - Get dashboard summary

### Internal (requires X-Internal-Secret header)
- `POST /internal/make/report` - Make.com webhook
- `POST /internal/sync/health` - Health sync
- `POST /internal/sync/deploys` - Deploy sync
- `POST /internal/sync/db-health` - DB health sync
- `POST /internal/sync/automation-health` - Automation health sync
- `POST /internal/sync/cleanup` - Metrics cleanup

