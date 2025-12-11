import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Metric from '../models/Metric';
import Service from '../models/Service';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/metrics - Get metrics with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, metricName, limit = 100 } = req.query;

    const filter: any = {};

    if (serviceId) {
      filter.serviceId = serviceId;
    }
    if (metricName) {
      filter.metricName = metricName;
    }

    const limitNum = parseInt(limit as string, 10);

    const metrics = await Metric.find(filter)
      .sort({ collectedAt: -1 })
      .limit(limitNum)
      .populate('serviceId', 'name type provider');
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching metrics' });
  }
});

// POST /api/metrics - Create new metric
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, metricName, metricValue, collectedAt } = req.body;

    if (!serviceId || !metricName || metricValue === undefined) {
      res.status(400).json({ message: 'serviceId, metricName, and metricValue are required' });
      return;
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const metric = new Metric({
      serviceId,
      metricName,
      metricValue,
      collectedAt: collectedAt ? new Date(collectedAt) : new Date(),
    });

    await metric.save();
    res.status(201).json(metric);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating metric' });
  }
});

export default router;

