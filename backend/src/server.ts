import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import projectRoutes from './routes/projectRoutes';
import serviceRoutes from './routes/serviceRoutes';
import metricRoutes from './routes/metricRoutes';
import workItemRoutes from './routes/workItemRoutes';
import summaryRoutes from './routes/summaryRoutes';
import internalRoutes from './routes/internalRoutes';
import authRoutes from './routes/authRoutes';
import { startScheduler } from './scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development, specific URL in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check - should work even if DB is not connected
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/workitems', workItemRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/internal', internalRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server - listen immediately, connect DB asynchronously
const startServer = async () => {
  // Start listening immediately so the server can respond to health checks
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Connect to database asynchronously (don't block server startup)
  try {
    await connectDB();
    console.log('Database connected successfully');
    startScheduler();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.error('Server is running but database operations will fail');
    // Don't exit - allow server to run and retry connection
    // The server can still respond to health checks and OPTIONS requests
  }
};

startServer();

