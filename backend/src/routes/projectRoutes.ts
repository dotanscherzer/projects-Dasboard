import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Project from '../models/Project';
import Service from '../models/Service';
import EnvVar from '../models/EnvVar';
import WorkItem from '../models/WorkItem';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects - Get all projects with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, lifecycleStage, priority, tag } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }
    if (lifecycleStage) {
      filter.lifecycleStage = lifecycleStage;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching projects' });
  }
});

// GET /api/projects/:id - Get project details with services, envVars, workItems
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const services = await Service.find({ projectId: project._id });
    const envVars = await EnvVar.find({
      serviceId: { $in: services.map((s) => s._id) },
    });
    const workItems = await WorkItem.find({ projectId: project._id });

    res.json({
      project,
      services,
      envVars,
      workItems,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching project details' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      code,
      description,
      owner,
      status,
      lifecycleStage,
      priority,
      nextAction,
      targetReleaseDate,
      tags,
    } = req.body;

    if (!name || !code || !owner || !nextAction) {
      res.status(400).json({ message: 'Name, code, owner, and nextAction are required' });
      return;
    }

    const project = new Project({
      name,
      code,
      description,
      owner,
      status: status || 'active',
      lifecycleStage: lifecycleStage || 'idea',
      priority: priority || 'medium',
      nextAction,
      targetReleaseDate: targetReleaseDate ? new Date(targetReleaseDate) : undefined,
      tags: tags || [],
    });

    await project.save();
    res.status(201).json(project);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Project code already exists' });
    } else {
      res.status(500).json({ message: error.message || 'Error creating project' });
    }
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const {
      name,
      code,
      description,
      owner,
      status,
      lifecycleStage,
      priority,
      nextAction,
      targetReleaseDate,
      tags,
    } = req.body;

    if (name) project.name = name;
    if (code) project.code = code;
    if (description !== undefined) project.description = description;
    if (owner) project.owner = owner;
    if (status) project.status = status;
    if (lifecycleStage) project.lifecycleStage = lifecycleStage;
    if (priority) project.priority = priority;
    if (nextAction) project.nextAction = nextAction;
    if (targetReleaseDate !== undefined) {
      project.targetReleaseDate = targetReleaseDate ? new Date(targetReleaseDate) : undefined;
    }
    if (tags !== undefined) project.tags = tags;

    await project.save();
    res.json(project);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Project code already exists' });
    } else {
      res.status(500).json({ message: error.message || 'Error updating project' });
    }
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Delete associated services, envVars, and workItems
    const services = await Service.find({ projectId: project._id });
    const serviceIds = services.map((s) => s._id);

    await Service.deleteMany({ projectId: project._id });
    await EnvVar.deleteMany({ serviceId: { $in: serviceIds } });
    await WorkItem.deleteMany({ projectId: project._id });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting project' });
  }
});

export default router;

