export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  internalSecret: process.env.INTERNAL_SECRET || '',
  renderApiKey: process.env.RENDER_API_KEY || '',
  netlifyApiToken: process.env.NETLIFY_API_TOKEN || '',
  netlifySiteId: process.env.NETLIFY_SITE_ID || '',
  mongodbAtlasApiPublicKey: process.env.MONGODB_ATLAS_API_PUBLIC_KEY || '',
  mongodbAtlasApiPrivateKey: process.env.MONGODB_ATLAS_API_PRIVATE_KEY || '',
  mongodbAtlasProjectId: process.env.MONGODB_ATLAS_PROJECT_ID || '',
  makeWebhookSecret: process.env.MAKE_WEBHOOK_SECRET || '',
};

