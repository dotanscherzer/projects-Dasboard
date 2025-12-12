import Service from '../models/Service';
import Metric from '../models/Metric';
import serviceService from './serviceService';
import metricService from './metricService';
import { renderApi } from '../integrations';
import { netlifyApi } from '../integrations';
import { mongodbAtlasApi } from '../integrations';

export const syncHealth = async (): Promise<void> => {
  console.log('[sync] Starting health sync...');
  
  // Check if Render API key is configured
  const { config } = await import('../config/env');
  const hasRenderApiKey = !!config.renderApiKey;
  
  // Sync Render services
  const renderServices = await Service.find({ provider: 'render' });
  console.log(`[sync] Found ${renderServices.length} Render service(s) to sync`);
  
  if (renderServices.length > 0 && !hasRenderApiKey) {
    console.warn('[sync] RENDER_API_KEY not configured. Render service health checks will fail.');
    console.warn('[sync] Set RENDER_API_KEY environment variable to enable Render service health monitoring.');
  }
  
  for (const service of renderServices) {
    try {
      console.log(`[sync] Syncing Render service: ${service.name} (${service.providerInternalId})`);
      const healthData = await renderApi.getServiceHealth(service.providerInternalId);
      
      // Log the response structure for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[sync] Render API response structure:`, JSON.stringify(healthData, null, 2).substring(0, 500));
      }
      
      // Determine status from Render API response
      // The response structure can vary, so check multiple possible locations
      let status: 'unknown' | 'up' | 'down' | 'degraded' | 'ok' | 'failing' | 'stale' = 'unknown';
      
      // Check for healthCheckStatus in various possible locations
      const healthCheckStatus = healthData.service?.serviceDetails?.healthCheckStatus 
        || healthData.serviceDetails?.healthCheckStatus
        || healthData.healthCheckStatus;
      
      if (healthCheckStatus) {
        // Map Render's health check status to our status
        const healthStatus = healthCheckStatus.toLowerCase();
        // Normalize status values
        if (healthStatus === 'healthy' || healthStatus === 'ok') {
          status = 'up';
        } else if (healthStatus === 'unhealthy' || healthStatus === 'failing') {
          status = 'down';
        } else {
          status = 'unknown';
        }
      } else {
        // If no health check status, use service state indicators
        // Check if service is suspended
        if (healthData.service?.suspended === 'not_suspended' || healthData.suspended === 'not_suspended') {
          // Service is not suspended, check if it has a URL (means it's deployed)
          if (healthData.service?.serviceDetails?.url || healthData.serviceDetails?.url || healthData.url) {
            status = 'up'; // Service is deployed and not suspended, likely up
          }
        } else if (healthData.service?.suspended || healthData.suspended) {
          status = 'down'; // Service is suspended
        }
      }
      
      console.log(`[sync] Render service ${service.name} - healthCheckStatus: ${healthCheckStatus || 'not found'}, determined status: ${status}`);
      
      await serviceService.updateService(service._id.toString(), {
        status,
        lastCheckedAt: new Date(),
        providerStatus: healthData,
      });
      console.log(`[sync] Updated ${service.name} status to: ${status}`);

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'health',
        metricValue: status,
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`[sync] Error syncing Render service ${service.name} (${service._id}):`, error.message);
      await serviceService.updateService(service._id.toString(), {
        status: 'down',
        lastCheckedAt: new Date(),
      });
    }
  }

  // Sync Netlify sites
  const netlifyServices = await Service.find({ provider: 'netlify' });
  console.log(`[sync] Found ${netlifyServices.length} Netlify service(s) to sync`);
  for (const service of netlifyServices) {
    try {
      console.log(`[sync] Syncing Netlify service: ${service.name} (${service.providerInternalId})`);
      const siteData = await netlifyApi.getSiteStatus(service.providerInternalId);
      // Netlify states: "ready" and "current" both indicate healthy/live sites
      const status = (siteData.state === 'ready' || siteData.state === 'current') ? 'up' : 'degraded';
      await serviceService.updateService(service._id.toString(), {
        status,
        lastCheckedAt: new Date(),
        providerStatus: siteData,
      });
      console.log(`[sync] Updated ${service.name} status to: ${status} (Netlify state: ${siteData.state})`);

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'health',
        metricValue: siteData.state || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`[sync] Error syncing Netlify service ${service.name} (${service._id}):`, error.message);
      await serviceService.updateService(service._id.toString(), {
        status: 'down',
        lastCheckedAt: new Date(),
      });
    }
  }

  // Sync MongoDB Atlas clusters (also included in regular health sync for more frequent updates)
  await syncMongoDBAtlasClusters();
  
  console.log('[sync] Health sync completed');
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

// Internal function to sync MongoDB Atlas clusters (used by both health-sync and db-health-sync)
const syncMongoDBAtlasClusters = async (): Promise<void> => {
  // Check if MongoDB Atlas API credentials are configured
  const { config } = await import('../config/env');
  if (!config.mongodbAtlasApiPublicKey || !config.mongodbAtlasApiPrivateKey || !config.mongodbAtlasProjectId) {
    console.warn('[sync] MongoDB Atlas API credentials not configured. Skipping DB health sync.');
    console.warn('[sync] Required: MONGODB_ATLAS_API_PUBLIC_KEY, MONGODB_ATLAS_API_PRIVATE_KEY, MONGODB_ATLAS_PROJECT_ID');
    return;
  }

  // Sync MongoDB Atlas clusters
  const atlasServices = await Service.find({ provider: 'mongodb_atlas' });
  console.log(`[sync] Found ${atlasServices.length} MongoDB Atlas service(s) to sync`);
  
  for (const service of atlasServices) {
    try {
      console.log(`[sync] Syncing MongoDB Atlas service: ${service.name} (${service.providerInternalId})`);
      const clusterData = await mongodbAtlasApi.getClusterHealth(service.providerInternalId);
      const status = clusterData.stateName === 'IDLE' ? 'up' : 'degraded';
      await serviceService.updateService(service._id.toString(), {
        status,
        lastCheckedAt: new Date(),
        providerStatus: clusterData,
      });
      console.log(`[sync] Updated ${service.name} status to: ${status} (cluster state: ${clusterData.stateName})`);

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'db_health',
        metricValue: clusterData.stateName || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      console.error(`[sync] Error syncing MongoDB Atlas service ${service.name} (${service._id}):`, error.message);
      if (error.response) {
        console.error(`[sync] API response status: ${error.response.status}, data:`, error.response.data);
      }
      // Only mark as "down" if it's a real error, not a configuration issue
      // If credentials are wrong or cluster not found, keep status as "unknown"
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn(`[sync] Authentication failed for ${service.name}. Check MongoDB Atlas API credentials.`);
        await serviceService.updateService(service._id.toString(), {
          status: 'unknown',
          lastCheckedAt: new Date(),
        });
      } else if (error.response?.status === 404) {
        console.warn(`[sync] Cluster not found for ${service.name}. Check if providerInternalId (${service.providerInternalId}) is correct (should be cluster name, not project ID).`);
        await serviceService.updateService(service._id.toString(), {
          status: 'unknown',
          lastCheckedAt: new Date(),
        });
      } else {
        // For other errors, mark as down
        await serviceService.updateService(service._id.toString(), {
          status: 'down',
          lastCheckedAt: new Date(),
        });
      }
    }
  }
};

export const syncDbHealth = async (): Promise<void> => {
  console.log('[sync] Starting DB health sync...');
  await syncMongoDBAtlasClusters();
  console.log('[sync] DB health sync completed');
};

