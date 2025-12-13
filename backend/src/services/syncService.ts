import Service from '../models/Service';
import Metric from '../models/Metric';
import serviceService from './serviceService';
import metricService from './metricService';
import { renderApi } from '../integrations';
import { netlifyApi } from '../integrations';
import { mongodbAtlasApi } from '../integrations';

/**
 * Safely parse a date from a deploy object, trying multiple possible field names
 * @param deploy - The deploy object from Render or Netlify API
 * @returns A valid Date object, or null if no valid date can be found
 */
const parseDeployDate = (deploy: any): Date | null => {
  if (!deploy || typeof deploy !== 'object') {
    return null;
  }

  // Try multiple possible date field names (common variations)
  const dateFields = ['createdAt', 'created_at', 'created', 'finishedAt', 'finished_at', 'finished', 'updatedAt', 'updated_at'];
  
  for (const field of dateFields) {
    const dateValue = deploy[field];
    
    if (dateValue === null || dateValue === undefined) {
      continue;
    }
    
    // If it's already a Date object, validate it
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue;
      }
      continue;
    }
    
    // If it's a string or number, try to parse it
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }
  
  return null;
};

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
  console.log('[sync] Starting deploy sync...');
  
  // Sync Render deploys
  const renderServices = await Service.find({ provider: 'render' });
  console.log(`[sync] Found ${renderServices.length} Render service(s) to sync deploys`);
  for (const service of renderServices) {
    try {
      console.log(`[sync] Syncing Render deploys for service: ${service.name} (${service.providerInternalId})`);
      const deployResponse: any = await renderApi.getServiceDeploys(service.providerInternalId);
      
      // Render API returns { deploy: [...], cursor: ... } or just an array
      let deploys: any[] = [];
      if (Array.isArray(deployResponse)) {
        deploys = deployResponse;
      } else if (deployResponse && typeof deployResponse === 'object' && 'deploy' in deployResponse) {
        deploys = Array.isArray(deployResponse.deploy) ? deployResponse.deploy : [];
      }
      
      if (deploys && deploys.length > 0) {
        const latestDeploy = deploys[0];
        const deployDate = parseDeployDate(latestDeploy);
        
        if (deployDate) {
          await serviceService.updateService(service._id.toString(), {
            lastDeployAt: deployDate,
            lastCheckedAt: new Date(),
          });
          console.log(`[sync] Updated ${service.name} lastDeployAt to: ${deployDate.toISOString()}`);
        } else {
          console.warn(`[sync] Could not parse deploy date for ${service.name}. Available fields:`, Object.keys(latestDeploy));
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[sync] Deploy object structure:`, JSON.stringify(latestDeploy, null, 2).substring(0, 500));
          }
          // Still update lastCheckedAt even if we can't parse the deploy date
          await serviceService.updateService(service._id.toString(), {
            lastCheckedAt: new Date(),
          });
        }

        // Create metric
        await metricService.createMetric({
          serviceId: service._id,
          metricName: 'deploy_status',
          metricValue: latestDeploy.status || 'unknown',
          collectedAt: new Date(),
        });
      } else {
        console.log(`[sync] No deploys found for ${service.name}`);
      }
    } catch (error: any) {
      console.error(`[sync] Error syncing Render deploys for service ${service.name} (${service._id}):`, error.message);
      if (error.stack) {
        console.error(`[sync] Error stack:`, error.stack);
      }
    }
  }

  // Sync Netlify deploys
  const netlifyServices = await Service.find({ provider: 'netlify' });
  console.log(`[sync] Found ${netlifyServices.length} Netlify service(s) to sync deploys`);
  for (const service of netlifyServices) {
    try {
      console.log(`[sync] Syncing Netlify deploys for service: ${service.name} (${service.providerInternalId})`);
      const deploys = await netlifyApi.getSiteDeploys(service.providerInternalId);
      if (deploys && deploys.length > 0) {
        const latestDeploy = deploys[0];
        const deployDate = parseDeployDate(latestDeploy);
        
        if (deployDate) {
          await serviceService.updateService(service._id.toString(), {
            lastDeployAt: deployDate,
            lastCheckedAt: new Date(),
          });
          console.log(`[sync] Updated ${service.name} lastDeployAt to: ${deployDate.toISOString()}`);
        } else {
          console.warn(`[sync] Could not parse deploy date for ${service.name}. Available fields:`, Object.keys(latestDeploy));
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[sync] Deploy object structure:`, JSON.stringify(latestDeploy, null, 2).substring(0, 500));
          }
          // Still update lastCheckedAt even if we can't parse the deploy date
          await serviceService.updateService(service._id.toString(), {
            lastCheckedAt: new Date(),
          });
        }

        // Create metric
        await metricService.createMetric({
          serviceId: service._id,
          metricName: 'deploy_status',
          metricValue: latestDeploy.state || 'unknown',
          collectedAt: new Date(),
        });
      } else {
        console.log(`[sync] No deploys found for ${service.name}`);
      }
    } catch (error: any) {
      console.error(`[sync] Error syncing Netlify deploys for service ${service.name} (${service._id}):`, error.message);
      if (error.stack) {
        console.error(`[sync] Error stack:`, error.stack);
      }
    }
  }
  
  console.log('[sync] Deploy sync completed');
};

// Internal function to sync MongoDB Atlas clusters (used by both health-sync and db-health-sync)
const syncMongoDBAtlasClusters = async (): Promise<void> => {
  // Check if MongoDB Atlas API credentials are configured (keys are required, project ID can come from service)
  const { config } = await import('../config/env');
  if (!config.mongodbAtlasApiPublicKey || !config.mongodbAtlasApiPrivateKey) {
    console.warn('[sync] MongoDB Atlas API credentials not configured. Skipping DB health sync.');
    console.warn('[sync] Required: MONGODB_ATLAS_API_PUBLIC_KEY, MONGODB_ATLAS_API_PRIVATE_KEY');
    console.warn('[sync] Note: MONGODB_ATLAS_PROJECT_ID can be set per service or as environment variable fallback');
    return;
  }

  // Sync MongoDB Atlas clusters
  const atlasServices = await Service.find({ provider: 'mongodb_atlas' });
  console.log(`[sync] Found ${atlasServices.length} MongoDB Atlas service(s) to sync`);
  
  for (const service of atlasServices) {
    try {
      // Use service-specific project ID if available, otherwise fall back to environment variable
      const projectId = (service as any).mongodbAtlasProjectId || config.mongodbAtlasProjectId;
      
      if (!projectId) {
        console.warn(`[sync] Skipping ${service.name}: No MongoDB Atlas project ID found (neither in service nor environment variable)`);
        await serviceService.updateService(service._id.toString(), {
          status: 'unknown',
          lastCheckedAt: new Date(),
        });
        continue;
      }
      
      const projectIdSource = (service as any).mongodbAtlasProjectId ? 'service' : 'environment';
      console.log(`[sync] Syncing MongoDB Atlas service: ${service.name} (cluster: ${service.providerInternalId}, project: ${projectId} [${projectIdSource}])`);
      
      const clusterData = await mongodbAtlasApi.getClusterHealth(service.providerInternalId, projectId);
      const status = clusterData.stateName === 'IDLE' ? 'up' : 'degraded';
      await serviceService.updateService(service._id.toString(), {
        status,
        lastCheckedAt: new Date(),
        providerStatus: clusterData,
      });
      console.log(`[sync] Updated ${service.name} status to: ${status} (cluster state: ${clusterData.stateName}, project: ${projectId})`);

      // Create metric
      await metricService.createMetric({
        serviceId: service._id,
        metricName: 'db_health',
        metricValue: clusterData.stateName || 'unknown',
        collectedAt: new Date(),
      });
    } catch (error: any) {
      const projectId = (service as any).mongodbAtlasProjectId || config.mongodbAtlasProjectId;
      console.error(`[sync] Error syncing MongoDB Atlas service ${service.name} (${service._id}):`, error.message);
      console.error(`[sync] Project ID used: ${projectId || 'none'}`);
      if (error.response) {
        console.error(`[sync] API response status: ${error.response.status}, data:`, error.response.data);
      }
      // Only mark as "down" if it's a real error, not a configuration issue
      // If credentials are wrong or cluster not found, keep status as "unknown"
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn(`[sync] Authentication failed for ${service.name}.`);
        console.warn(`[sync] Possible causes:`);
        console.warn(`[sync]   1. MongoDB Atlas API keys (MONGODB_ATLAS_API_PUBLIC_KEY / MONGODB_ATLAS_API_PRIVATE_KEY) are incorrect`);
        console.warn(`[sync]   2. API keys don't have access to project ${projectId}`);
        console.warn(`[sync]   3. API keys are expired or revoked`);
        console.warn(`[sync]   4. Project ID ${projectId} doesn't exist or you don't have access to it`);
        console.warn(`[sync] How to fix: Check your MongoDB Atlas API keys in Account Settings → API Keys and ensure they have access to this project.`);
        await serviceService.updateService(service._id.toString(), {
          status: 'unknown',
          lastCheckedAt: new Date(),
        });
      } else if (error.response?.status === 404) {
        console.warn(`[sync] Cluster not found for ${service.name}. Check if providerInternalId (${service.providerInternalId}) is correct (should be cluster name, not project ID).`);
        console.warn(`[sync] Project ID used: ${projectId || 'none'}`);
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

