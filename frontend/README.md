# Project Ops Dashboard Frontend

Frontend application for Project Ops Dashboard V2 built with React, Vite, and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```
VITE_API_URL=http://localhost:3000
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- **Dashboard Page**: Overview of all projects with filtering capabilities
- **Project Details Page**: Detailed view of project with services, metrics, and work items
- **Authentication**: Login and protected routes
- **Real-time Status**: Service status badges showing all status fields
- **Automation Monitoring**: Dedicated view for automation services
- **Metrics Visualization**: Charts for service metrics

## Deployment

The frontend is configured to deploy on Netlify. See `netlify.toml` for configuration.

