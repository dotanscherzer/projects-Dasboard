import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import WorkItem from '../models/WorkItem';
import Project from '../models/Project';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/workitems - Get all work items with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, status, type, priority } = req.query;

    const filter: any = {};

    if (projectId) {
      filter.projectId = projectId;
    }
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }
    if (priority) {
      filter.priority = priority;
    }

    const workItems = await WorkItem.find(filter)
      .populate('projectId', 'name code')
      .populate('blockedBy', 'title status')
      .sort({ createdAt: -1 });
    res.json(workItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching work items' });
  }
});

// GET /api/workitems/:id - Get work item by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const workItem = await WorkItem.findById(req.params.id)
      .populate('projectId', 'name code')
      .populate('blockedBy', 'title status');

    if (!workItem) {
      res.status(404).json({ message: 'Work item not found' });
      return;
    }

    res.json(workItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching work item' });
  }
});

// POST /api/workitems - Create new work item
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, title, type, status, priority, dueDate, blockedBy, tags } = req.body;

    if (!projectId || !title || !type) {
      res.status(400).json({ message: 'projectId, title, and type are required' });
      return;
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Verify blockedBy work item exists if provided
    if (blockedBy) {
      const blockingItem = await WorkItem.findById(blockedBy);
      if (!blockingItem) {
        res.status(404).json({ message: 'Blocking work item not found' });
        return;
      }
    }

    const workItem = new WorkItem({
      projectId,
      title,
      type,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      blockedBy,
      tags: tags || [],
    });

    await workItem.save();
    res.status(201).json(workItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating work item' });
  }
});

// PUT /api/workitems/:id - Update work item
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      res.status(404).json({ message: 'Work item not found' });
      return;
    }

    const { title, type, status, priority, dueDate, blockedBy, tags } = req.body;

    if (title) workItem.title = title;
    if (type) workItem.type = type;
    if (status) workItem.status = status;
    if (priority) workItem.priority = priority;
    if (dueDate !== undefined) {
      workItem.dueDate = dueDate ? new Date(dueDate) : undefined;
    }
    if (blockedBy !== undefined) {
      if (blockedBy) {
        const blockingItem = await WorkItem.findById(blockedBy);
        if (!blockingItem) {
          res.status(404).json({ message: 'Blocking work item not found' });
          return;
        }
      }
      workItem.blockedBy = blockedBy;
    }
    if (tags !== undefined) workItem.tags = tags;

    await workItem.save();
    res.json(workItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating work item' });
  }
});

// DELETE /api/workitems/:id - Delete work item
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      res.status(404).json({ message: 'Work item not found' });
      return;
    }

    await WorkItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Work item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting work item' });
  }
});

export default router;

