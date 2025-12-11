import express, { Response } from 'express';
import { requireInternalSecret } from '../middlewares/auth';
import { syncHealth } from '../services/syncService';
import { syncDeploys } from '../services/syncService';
import { syncDbHealth } from '../services/syncService';
import { syncAutomationHealth } from '../services/automationService';
import { cleanupMetrics } from '../services/metricService';
import { handleMakeWebhook } from '../services/automationService';

const router = express.Router();

// All internal routes require X-Internal-Secret header
router.use(requireInternalSecret);

// POST /internal/make/report - Make.com webhook
router.post('/make/report', async (req: express.Request, res: Response) => {
  try {
    await handleMakeWebhook(req.body);
    res.json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing webhook' });
  }
});

// POST /internal/sync/health - Health sync (every 5 min)
router.post('/sync/health', async (req: express.Request, res: Response) => {
  try {
    await syncHealth();
    res.json({ message: 'Health sync completed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error syncing health' });
  }
});

// POST /internal/sync/deploys - Deploy sync (every 15 min)
router.post('/sync/deploys', async (req: express.Request, res: Response) => {
  try {
    await syncDeploys();
    res.json({ message: 'Deploy sync completed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error syncing deploys' });
  }
});

// POST /internal/sync/db-health - DB health (hourly)
router.post('/sync/db-health', async (req: express.Request, res: Response) => {
  try {
    await syncDbHealth();
    res.json({ message: 'DB health sync completed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error syncing DB health' });
  }
});

// POST /internal/sync/automation-health - Automation health (every 10-15 min)
router.post('/sync/automation-health', async (req: express.Request, res: Response) => {
  try {
    await syncAutomationHealth();
    res.json({ message: 'Automation health sync completed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error syncing automation health' });
  }
});

// POST /internal/sync/cleanup - Metrics cleanup (nightly)
router.post('/sync/cleanup', async (req: express.Request, res: Response) => {
  try {
    await cleanupMetrics();
    res.json({ message: 'Metrics cleanup completed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error cleaning up metrics' });
  }
});

export default router;

