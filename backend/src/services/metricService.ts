import Metric from '../models/Metric';
import { IMetric } from '../models/Metric';

class MetricService {
  async createMetric(data: Partial<IMetric>): Promise<IMetric> {
    const metric = new Metric(data);
    return await metric.save();
  }

  async getMetricsByService(serviceId: string, metricName?: string, limit: number = 100): Promise<IMetric[]> {
    const filter: any = { serviceId };
    if (metricName) {
      filter.metricName = metricName;
    }
    return await Metric.find(filter).sort({ collectedAt: -1 }).limit(limit);
  }

  async cleanupOldMetrics(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Metric.deleteMany({
      collectedAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }
}

export const cleanupMetrics = async (daysToKeep: number = 30): Promise<number> => {
  return await new MetricService().cleanupOldMetrics(daysToKeep);
};

export default new MetricService();

