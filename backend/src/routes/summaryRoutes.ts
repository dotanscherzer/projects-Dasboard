import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Project from '../models/Project';
import Service from '../models/Service';
import WorkItem from '../models/WorkItem';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/summary - Get dashboard summary
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const liveProjects = await Project.countDocuments({ lifecycleStage: 'live' });
    const inDevelopmentProjects = await Project.countDocuments({
      lifecycleStage: 'in_development',
    });

    const totalServices = await Service.countDocuments();
    const servicesByStatus = await Service.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const servicesByType = await Service.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalWorkItems = await WorkItem.countDocuments();
    const workItemsByStatus = await WorkItem.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const highPriorityProjects = await Project.find({ priority: 'high' })
      .select('name code lifecycleStage nextAction')
      .limit(10)
      .sort({ updatedAt: -1 });

    const failingServices = await Service.find({ status: 'failing' })
      .populate('projectId', 'name code')
      .limit(10)
      .sort({ updatedAt: -1 });

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        live: liveProjects,
        inDevelopment: inDevelopmentProjects,
      },
      services: {
        total: totalServices,
        byStatus: servicesByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: servicesByType.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      workItems: {
        total: totalWorkItems,
        byStatus: workItemsByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      highPriorityProjects,
      failingServices,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching summary' });
  }
});

export default router;

