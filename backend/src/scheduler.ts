import cron from 'node-cron';
import { syncHealth, syncDeploys, syncDbHealth } from './services/syncService';
import { syncAutomationHealth } from './services/automationService';
import { cleanupMetrics } from './services/metricService';

type CronJobConfig = {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
};

const jobs: CronJobConfig[] = [
  { name: 'health-sync', schedule: '*/5 * * * *', handler: syncHealth },
  { name: 'deploy-sync', schedule: '*/15 * * * *', handler: syncDeploys },
  { name: 'db-health-sync', schedule: '0 * * * *', handler: syncDbHealth },
  { name: 'automation-health-sync', schedule: '*/12 * * * *', handler: syncAutomationHealth },
  { 
    name: 'metrics-cleanup', 
    schedule: '0 2 * * *', 
    handler: async () => {
      const deletedCount = await cleanupMetrics();
      console.log(`[sync] Cleaned up ${deletedCount} old metrics`);
    }
  },
];

const scheduleJob = (job: CronJobConfig) => {
  cron.schedule(job.schedule, async () => {
    const startTime = new Date().toISOString();
    console.log(`[cron] ${job.name} started at ${startTime} (schedule: ${job.schedule})`);
    try {
      await job.handler();
      const endTime = new Date().toISOString();
      console.log(`[cron] ${job.name} completed successfully at ${endTime}`);
    } catch (error: any) {
      const endTime = new Date().toISOString();
      console.error(`[cron] ${job.name} failed at ${endTime}: ${error?.message ?? 'unknown error'}`);
      if (error.stack) {
        console.error(`[cron] ${job.name} error stack:`, error.stack);
      }
    }
  });
};

export const startScheduler = (): void => {
  console.log('[cron] ========================================');
  console.log('[cron] Scheduler Initializing...');
  console.log('[cron] Scheduled Jobs:');
  jobs.forEach((job) => {
    console.log(`[cron]   - ${job.name}: ${job.schedule} (${getScheduleDescription(job.schedule)})`);
  });
  console.log('[cron] ========================================');

  jobs.forEach(scheduleJob);
  console.log('[cron] Scheduler initialized and running');
};

const getScheduleDescription = (schedule: string): string => {
  const descriptions: Record<string, string> = {
    '*/5 * * * *': 'Every 5 minutes',
    '*/12 * * * *': 'Every 12 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '0 * * * *': 'Every hour (at minute 0)',
    '0 2 * * *': 'Daily at 2:00 AM UTC',
  };
  return descriptions[schedule] || schedule;
};

