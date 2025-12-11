import Service from '../models/Service';
import Metric from '../models/Metric';
import serviceService from './serviceService';
import metricService from './metricService';

interface MakeWebhookPayload {
  scenarioId: string | number;
  scenarioName: string;
  status: 'success' | 'error';
  startedAt: string;
  finishedAt: string;
  errorMessage?: string | null;
}

export const handleMakeWebhook = async (payload: MakeWebhookPayload): Promise<void> => {
  const { scenarioId, scenarioName, status, startedAt, finishedAt, errorMessage } = payload;

  // Find service by provider='make' and providerInternalId=scenarioId
  const service = await serviceService.getServiceByProvider('make', String(scenarioId));

  if (!service) {
    console.warn(`Service not found for Make scenario ID: ${scenarioId}`);
    return;
  }

  const startedAtDate = new Date(startedAt);
  const finishedAtDate = new Date(finishedAt);
  const durationMs = finishedAtDate.getTime() - startedAtDate.getTime();

  // Update service
  const updateData: any = {
    lastRunAt: finishedAtDate,
    lastRunStatus: status === 'success' ? 'success' : 'error',
    status: status === 'success' ? 'ok' : 'failing',
    lastCheckedAt: new Date(),
  };

  await serviceService.updateService(service._id.toString(), updateData);

  // Insert metrics
  await metricService.createMetric({
    serviceId: service._id,
    metricName: 'automation_status',
    metricValue: status,
    collectedAt: finishedAtDate,
  });

  await metricService.createMetric({
    serviceId: service._id,
    metricName: 'automation_duration_ms',
    metricValue: durationMs,
    collectedAt: finishedAtDate,
  });

  if (errorMessage) {
    await metricService.createMetric({
      serviceId: service._id,
      metricName: 'automation_error',
      metricValue: errorMessage,
      collectedAt: finishedAtDate,
    });
  }
};

export const syncAutomationHealth = async (): Promise<void> => {
  // Find all automation services
  const automationServices = await Service.find({
    type: 'automation',
    provider: 'make',
  });

  const now = new Date();

  for (const service of automationServices) {
    if (!service.expectedFrequencyMinutes) {
      continue;
    }

    const expectedIntervalMs = service.expectedFrequencyMinutes * 60 * 1000;
    const lastRunTime = service.lastRunAt?.getTime() || 0;
    const timeSinceLastRun = now.getTime() - lastRunTime;

    // If service hasn't run in more than 2x expected frequency, mark as stale
    if (timeSinceLastRun > expectedIntervalMs * 2) {
      await serviceService.updateService(service._id.toString(), {
        status: 'stale',
        lastCheckedAt: now,
      });
    }
  }
};

