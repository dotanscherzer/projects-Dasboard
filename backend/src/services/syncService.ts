import Service from '../models/Service';
import Metric from '../models/Metric';
import serviceService from './serviceService';
import metricService from './metricService';
import { renderApi } from '../integrations';
import { netlifyApi } from '../integrations';
import { mongodbAtlasApi } from '../integrations';

export const syncHealth = async (): Promise<void> => {
  // Sync Render services
  const renderServices = await Service.find({ provider: 'render' });
  for (const service of renderServices) {
    try {
      const healthData = await renderApi.getServiceHealth(service.providerInternalId);
      await serviceService.updateService(service._id.toString(), {
        status: healthData.service?.serviceDetails?.healthCheckStatus || 'unknown',
        lastCheckedAt: new Date(),
        providerStatus: healthData,
      });

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'health',
        metricValue: healthData.service?.serviceDetails?.healthCheckStatus || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`Error syncing Render service ${service._id}:`, error.message);
      await serviceService.updateService(service._id.toString(), {
        status: 'down',
        lastCheckedAt: new Date(),
      });
    }
  }

  // Sync Netlify sites
  const netlifyServices = await Service.find({ provider: 'netlify' });
  for (const service of netlifyServices) {
    try {
      const siteData = await netlifyApi.getSiteStatus(service.providerInternalId);
      await serviceService.updateService(service._id.toString(), {
        status: siteData.state === 'ready' ? 'up' : 'degraded',
        lastCheckedAt: new Date(),
        providerStatus: siteData,
      });

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'health',
        metricValue: siteData.state || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`Error syncing Netlify service ${service._id}:`, error.message);
      await serviceService.updateService(service._id.toString(), {
        status: 'down',
        lastCheckedAt: new Date(),
      });
    }
  }
};

export const syncDeploys = async (): Promise<void> => {
  // Sync Render deploys
  const renderServices = await Service.find({ provider: 'render' });
  for (const service of renderServices) {
    try {
      const deploys = await renderApi.getServiceDeploys(service.providerInternalId);
      if (deploys && deploys.length > 0) {
        const latestDeploy = deploys[0];
        await serviceService.updateService(service._id.toString(), {
          lastDeployAt: new Date(latestDeploy.createdAt),
          lastCheckedAt: new Date(),
        });

        // Create metric
        await metricService.createMetric({
          serviceId: service._id,
          metricName: 'deploy_status',
          metricValue: latestDeploy.status || 'unknown',
          collectedAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error(`Error syncing Render deploys for service ${service._id}:`, error.message);
    }
  }

  // Sync Netlify deploys
  const netlifyServices = await Service.find({ provider: 'netlify' });
  for (const service of netlifyServices) {
    try {
      const deploys = await netlifyApi.getSiteDeploys(service.providerInternalId);
      if (deploys && deploys.length > 0) {
        const latestDeploy = deploys[0];
        await serviceService.updateService(service._id.toString(), {
          lastDeployAt: new Date(latestDeploy.created_at),
          lastCheckedAt: new Date(),
        });

        // Create metric
        await metricService.createMetric({
          serviceId: service._id,
          metricName: 'deploy_status',
          metricValue: latestDeploy.state || 'unknown',
          collectedAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error(`Error syncing Netlify deploys for service ${service._id}:`, error.message);
    }
  }
};

export const syncDbHealth = async (): Promise<void> => {
  // Sync MongoDB Atlas clusters
  const atlasServices = await Service.find({ provider: 'mongodb_atlas' });
  for (const service of atlasServices) {
    try {
      const clusterData = await mongodbAtlasApi.getClusterHealth(service.providerInternalId);
      await serviceService.updateService(service._id.toString(), {
        status: clusterData.stateName === 'IDLE' ? 'up' : 'degraded',
        lastCheckedAt: new Date(),
        providerStatus: clusterData,
      });

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'db_health',
        metricValue: clusterData.stateName || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`Error syncing MongoDB Atlas service ${service._id}:`, error.message);
      await serviceService.updateService(service._id.toString(), {
        status: 'down',
        lastCheckedAt: new Date(),
      });
    }
  }
};

