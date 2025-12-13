import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Service from '../models/Service';
import Project from '../models/Project';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/services - Get all services with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, type, provider, status } = req.query;

    const filter: any = {};

    if (projectId) {
      filter.projectId = projectId;
    }
    if (type) {
      filter.type = type;
    }
    if (provider) {
      filter.provider = provider;
    }
    if (status) {
      filter.status = status;
    }

    const services = await Service.find(filter)
      .populate('projectId', 'name code')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching services' });
  }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findById(req.params.id).populate('projectId', 'name code');

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching service' });
  }
});

// POST /api/services - Create new service
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      projectId,
      name,
      type,
      provider,
      providerInternalId,
      mongodbAtlasProjectId,
      url,
      dashboardUrl,
      region,
      status,
      lastRunAt,
      lastRunStatus,
      expectedFrequencyMinutes,
      notes,
    } = req.body;

    if (!projectId || !name || !type || !provider || !providerInternalId) {
      res.status(400).json({
        message: 'projectId, name, type, provider, and providerInternalId are required',
      });
      return;
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const service = new Service({
      projectId,
      name,
      type,
      provider,
      providerInternalId,
      mongodbAtlasProjectId,
      url,
      dashboardUrl,
      region,
      status: status || 'unknown',
      lastRunAt: lastRunAt ? new Date(lastRunAt) : undefined,
      lastRunStatus,
      expectedFrequencyMinutes,
      notes,
    });

    await service.save();
    res.status(201).json(service);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        message: 'Service with this provider and providerInternalId already exists',
      });
    } else {
      res.status(500).json({ message: error.message || 'Error creating service' });
    }
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const {
      name,
      type,
      provider,
      providerInternalId,
      mongodbAtlasProjectId,
      url,
      dashboardUrl,
      region,
      status,
      lastCheckedAt,
      lastDeployAt,
      lastRunAt,
      lastRunStatus,
      expectedFrequencyMinutes,
      providerStatus,
      notes,
    } = req.body;

    if (name) service.name = name;
    if (type) service.type = type;
    if (provider) service.provider = provider;
    if (providerInternalId) service.providerInternalId = providerInternalId;
    if (mongodbAtlasProjectId !== undefined) (service as any).mongodbAtlasProjectId = mongodbAtlasProjectId;
    if (url !== undefined) service.url = url;
    if (dashboardUrl !== undefined) service.dashboardUrl = dashboardUrl;
    if (region !== undefined) service.region = region;
    if (status) service.status = status;
    if (lastCheckedAt !== undefined) {
      service.lastCheckedAt = lastCheckedAt ? new Date(lastCheckedAt) : undefined;
    }
    if (lastDeployAt !== undefined) {
      service.lastDeployAt = lastDeployAt ? new Date(lastDeployAt) : undefined;
    }
    if (lastRunAt !== undefined) {
      service.lastRunAt = lastRunAt ? new Date(lastRunAt) : undefined;
    }
    if (lastRunStatus !== undefined) service.lastRunStatus = lastRunStatus;
    if (expectedFrequencyMinutes !== undefined) {
      service.expectedFrequencyMinutes = expectedFrequencyMinutes;
    }
    if (providerStatus !== undefined) service.providerStatus = providerStatus;
    if (notes !== undefined) service.notes = notes;

    await service.save();
    res.json(service);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        message: 'Service with this provider and providerInternalId already exists',
      });
    } else {
      res.status(500).json({ message: error.message || 'Error updating service' });
    }
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting service' });
  }
});

export default router;

