# API Tokens & Environment Variables Setup Guide

This guide will walk you through obtaining and configuring all API tokens and environment variables needed for the Project Ops Dashboard.

## Table of Contents

1. [Overview](#overview)
2. [Required vs Optional Variables](#required-vs-optional-variables)
3. [Netlify Configuration](#netlify-configuration)
4. [Render Configuration](#render-configuration)
5. [MongoDB Atlas Configuration](#mongodb-atlas-configuration)
6. [Make.com Configuration](#makecom-configuration)
7. [Configuring in Render Dashboard](#configuring-in-render-dashboard)
8. [Finding Provider Internal IDs](#finding-provider-internal-ids)
9. [Testing Your Configuration](#testing-your-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Project Ops Dashboard integrates with multiple cloud providers to monitor services. Each provider requires API tokens or keys for authentication. These tokens are **account-level** and can access all services under your account, but each **service** in the dashboard is identified by its unique `providerInternalId`.

### Architecture

- **API Tokens**: Account-level credentials (one per provider account)
- **Provider Internal IDs**: Service-specific identifiers (unique per service)
- **Example**: 
  - Project A has a Render service with ID `srv-abc123`
  - Project B has a Render service with ID `srv-def456`
  - Both use the same `RENDER_API_KEY`, but are queried individually

---

## Required vs Optional Variables

### Required (Must Configure)

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `MONGODB_URI` | Database connection string | MongoDB Atlas → Connect → Connection String |
| `JWT_SECRET` | JWT token signing secret | Generate random string (see below) |
| `INTERNAL_SECRET` | Internal API authentication | Generate random string (see below) |

### Optional (For Service Monitoring)

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `RENDER_API_KEY` | Render API access | Render → Account → API Keys |
| `NETLIFY_API_TOKEN` | Netlify API access | Netlify → User Settings → Applications |
| `NETLIFY_SITE_ID` | Not currently used | Netlify site settings (optional) |
| `MONGODB_ATLAS_API_PUBLIC_KEY` | MongoDB Atlas API access | MongoDB Atlas → Access Manager → API Keys |
| `MONGODB_ATLAS_API_PRIVATE_KEY` | MongoDB Atlas API access | MongoDB Atlas → Access Manager → API Keys |
| `MONGODB_ATLAS_PROJECT_ID` | MongoDB Atlas project identifier | MongoDB Atlas → Project Settings |
| `MAKE_WEBHOOK_SECRET` | Make.com webhook validation | Generate or from Make.com webhook settings |

---

## Netlify Configuration

### Step 1: Get Netlify API Token

1. **Log in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with your account

2. **Navigate to User Settings**
   - Click on your profile picture/avatar (top right)
   - Select **User settings**

3. **Go to Applications**
   - In the left sidebar, click **Applications**
   - Or go directly to: https://app.netlify.com/user/applications

4. **Create New Access Token**
   - Click **New access token** button
   - Enter a descriptive name (e.g., "Project Ops Dashboard")
   - Click **Generate token**

5. **Copy the Token**
   - ⚠️ **IMPORTANT**: The token is shown only once
   - Copy it immediately and store it securely
   - Format: `nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **Save for Later**
   - You'll add this to Render environment variables as `NETLIFY_API_TOKEN`

### Step 2: Get Netlify Site ID (Optional)

**Method 1: From Site Dashboard**
1. Go to your Netlify site dashboard
2. Click **Site settings** (gear icon)
3. Under **General**, find **Site ID**
4. Copy the ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Method 2: From API**
- Use the Netlify API to list all sites
- The site ID is in the response for each site

**Note**: This variable is defined but not currently used in the codebase. Each service stores its own `providerInternalId` which is the site ID.

---

## Render Configuration

### Step 1: Get Render API Key

1. **Log in to Render**
   - Go to https://dashboard.render.com
   - Sign in with your account

2. **Navigate to API Keys**
   - Click on your account name (top right)
   - Select **Account Settings**
   - Or go directly to: https://dashboard.render.com/account/api-keys

3. **Create API Key**
   - Click **Create API Key** button
   - Enter a descriptive name (e.g., "Project Ops Dashboard")
   - Click **Create**

4. **Copy the API Key**
   - ⚠️ **IMPORTANT**: The key is shown only once
   - Copy it immediately and store it securely
   - Format: `rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Save for Later**
   - You'll add this to Render environment variables as `RENDER_API_KEY`

### Step 2: Find Render Service IDs

When adding services in the wizard, you'll need the **Service ID** for each Render service:

1. **From Render Dashboard**
   - Go to your Render service
   - The Service ID is in the URL: `https://dashboard.render.com/web/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Or look in **Settings** → **Info** section

2. **From API**
   - Use the Render API to list all services
   - Each service has an `id` field

**Note**: This is the `providerInternalId` you'll enter when creating a service in the Project Ops Dashboard.

---

## MongoDB Atlas Configuration

### Step 1: Get MongoDB Atlas API Keys

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com
   - Sign in with your account

2. **Navigate to API Keys**
   - Click on your **Organization** name (top left)
   - Select **Access Manager** → **API Keys**
   - Or go directly to: https://cloud.mongodb.com/v2#/org/{orgId}/access/apiKeys

3. **Create API Key**
   - Click **Create API Key** button
   - Enter a descriptive name (e.g., "Project Ops Dashboard")
   - Select **Project Owner** or appropriate role
   - Click **Next**

4. **Copy Public and Private Keys**
   - ⚠️ **IMPORTANT**: The **Private Key** is shown only once
   - Copy both keys immediately:
     - **Public Key**: Format `xxxxxxxx`
     - **Private Key**: Format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Store them securely

5. **Save for Later**
   - Public Key → `MONGODB_ATLAS_API_PUBLIC_KEY`
   - Private Key → `MONGODB_ATLAS_API_PRIVATE_KEY`

### Step 2: Get MongoDB Atlas Project ID

1. **Navigate to Project Settings**
   - In MongoDB Atlas, select your project
   - Click **Project Settings** (gear icon in left sidebar)
   - Or go to: https://cloud.mongodb.com/v2#/org/{orgId}/projects

2. **Find Project ID**
   - Under **General**, find **Project ID**
   - Copy the ID (format: `xxxxxxxxxxxxxxxxxxxxxxxx`)

3. **Save for Later**
   - You'll add this as `MONGODB_ATLAS_PROJECT_ID`

### Step 3: Get MongoDB Connection String (MONGODB_URI)

1. **Navigate to Database**
   - In MongoDB Atlas, go to **Database** → **Deployments**
   - Click **Connect** on your cluster

2. **Choose Connection Method**
   - Select **Connect your application**
   - Choose **Node.js** as driver
   - Copy the connection string

3. **Update Connection String**
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (or remove it)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

4. **Save for Later**
   - You'll add this as `MONGODB_URI`

### Step 4: Find MongoDB Atlas Cluster Names

When adding database services in the wizard, you'll need the **Cluster Name**:

1. **From MongoDB Atlas Dashboard**
   - Go to **Database** → **Deployments**
   - Your cluster name is displayed (e.g., "Cluster0")
   - This is the `providerInternalId` you'll enter

---

## Make.com Configuration

### Step 1: Get Make.com Webhook Secret

**Option 1: From Make.com Webhook Settings**
1. Log in to Make.com (formerly Integromat)
2. Open your webhook scenario
3. In the webhook module settings, look for a "Secret" or "Webhook Secret" field
4. If you set one, copy it
5. If not set, you can generate a random secret (see Option 2)

**Option 2: Generate Your Own Secret**
- Generate a secure random string (similar to JWT_SECRET)
- Use this to validate webhook requests from Make.com
- You'll need to configure this same secret in your Make.com webhook

**Generate Secret (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Generate Secret (Node.js):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Save for Later**
- You'll add this as `MAKE_WEBHOOK_SECRET`

### Step 2: Find Make.com Scenario ID

When adding automation services in the wizard, you'll need the **Scenario ID**:

1. **From Make.com Dashboard**
   - Open your scenario
   - The Scenario ID is in the URL: `https://www.make.com/en/scenarios/123456789`
   - Or look in scenario settings

2. **Save for Later**
   - This is the `providerInternalId` you'll enter when creating an automation service

---

## Configuring in Render Dashboard

### Step 1: Access Environment Variables

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Click on your **project-ops-backend** service

2. **Open Environment Tab**
   - Click **Environment** in the left sidebar
   - You'll see a list of existing environment variables

### Step 2: Add Environment Variables

For each variable, follow these steps:

1. **Click "Add Environment Variable"**
2. **Enter Key**: The variable name (e.g., `NETLIFY_API_TOKEN`)
3. **Enter Value**: The token/key you obtained
4. **Click "Save Changes"**
5. **Render will automatically restart** your service

### Step 3: Required Variables Checklist

Add these **required** variables first:

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Generate random string (see below)
- [ ] `INTERNAL_SECRET` - Generate random string (see below)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Set to `10000`

### Step 4: Optional Variables Checklist

Add these **optional** variables for service monitoring:

- [ ] `RENDER_API_KEY` - Render API key
- [ ] `NETLIFY_API_TOKEN` - Netlify API token
- [ ] `NETLIFY_SITE_ID` - Netlify site ID (optional, not currently used)
- [ ] `MONGODB_ATLAS_API_PUBLIC_KEY` - MongoDB Atlas public key
- [ ] `MONGODB_ATLAS_API_PRIVATE_KEY` - MongoDB Atlas private key
- [ ] `MONGODB_ATLAS_PROJECT_ID` - MongoDB Atlas project ID
- [ ] `MAKE_WEBHOOK_SECRET` - Make.com webhook secret

### Step 5: Generate Random Secrets

For `JWT_SECRET` and `INTERNAL_SECRET`, generate secure random strings:

**Using PowerShell (Windows):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using Online Generator:**
- Visit https://generate-secret.vercel.app/64
- Generate two different secrets (one for JWT, one for Internal)

**Important**: 
- Use **different** values for `JWT_SECRET` and `INTERNAL_SECRET`
- Keep them secure and never commit them to version control
- Store them in a password manager

---

## Finding Provider Internal IDs

When adding services in the Project Creation Wizard, you'll need the **Provider Internal ID** for each service. This is the unique identifier that the provider uses for that specific service.

### Render Service ID

**Method 1: From Dashboard URL**
1. Go to your Render service dashboard
2. Look at the URL: `https://dashboard.render.com/web/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. The part after `/web/` is your Service ID

**Method 2: From Settings**
1. Go to your Render service
2. Click **Settings** → **Info**
3. Find **Service ID** field

**Method 3: From API**
- Use Render API: `GET /services`
- Find your service in the list
- Use the `id` field

### Netlify Site ID

**Method 1: From Site Settings**
1. Go to your Netlify site dashboard
2. Click **Site settings** (gear icon)
3. Under **General**, find **Site ID**
4. Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Method 2: From API**
- Use Netlify API: `GET /sites`
- Find your site in the list
- Use the `id` field

### MongoDB Atlas Cluster Name

1. Go to MongoDB Atlas dashboard
2. Navigate to **Database** → **Deployments**
3. Your cluster name is displayed (e.g., "Cluster0")
4. This is the cluster name you'll use

### Make.com Scenario ID

1. Open your Make.com scenario
2. Look at the URL: `https://www.make.com/en/scenarios/123456789`
3. The number at the end is your Scenario ID
4. Or check scenario settings for the ID

---

## Testing Your Configuration

### Step 1: Verify Environment Variables

1. **Check Render Logs**
   - Go to your Render service → **Logs**
   - Look for any errors related to missing environment variables
   - The server should start without errors

2. **Test API Endpoints**
   - Try accessing your backend API: `https://your-backend.onrender.com/api/summary`
   - Should return data (may require authentication)

### Step 2: Test Service Monitoring

1. **Add a Test Project**
   - Use the Project Creation Wizard
   - Add a service with a valid `providerInternalId`
   - Save the project

2. **Check Service Status**
   - Go to Project Details page
   - Service status should update after the next sync cycle
   - Health sync runs every 5 minutes

3. **Check Logs**
   - Monitor Render logs for sync operations
   - Should see successful API calls to providers
   - No authentication errors

### Step 3: Verify API Access

**Test Render API:**
```bash
curl -H "Authorization: Bearer YOUR_RENDER_API_KEY" \
  https://api.render.com/v1/services
```

**Test Netlify API:**
```bash
curl -H "Authorization: Bearer YOUR_NETLIFY_TOKEN" \
  https://api.netlify.com/api/v1/sites
```

**Test MongoDB Atlas API:**
- More complex (requires signature generation)
- Best tested through the application

---

## Troubleshooting

### Issue: "JWT secret not configured"

**Solution:**
- Ensure `JWT_SECRET` is set in Render environment variables
- Restart the service after adding the variable
- Check that the value is not empty

### Issue: "Unauthorized: Invalid internal secret"

**Solution:**
- Ensure `INTERNAL_SECRET` is set in Render environment variables
- Verify it matches across all services (if using multiple)
- Restart the service after adding/updating

### Issue: Service Status Shows "unknown" or "down"

**Possible Causes:**
1. **Missing API Token**
   - Check that the provider API token is set (e.g., `RENDER_API_KEY`)
   - Verify the token is valid and not expired

2. **Incorrect Provider Internal ID**
   - Verify the `providerInternalId` matches the actual service ID
   - Check provider dashboard to confirm the ID

3. **API Rate Limits**
   - Some providers have rate limits
   - Check provider documentation for limits

4. **Service Doesn't Exist**
   - Verify the service exists on the provider
   - Check that you have access to the service

**Solution Steps:**
1. Check Render logs for error messages
2. Verify API token is correct
3. Test API access manually (see Testing section)
4. Verify `providerInternalId` is correct
5. Wait for next sync cycle (health sync runs every 5 minutes)

### Issue: MongoDB Connection Error

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check that password is URL-encoded (special characters)
3. Verify IP whitelist allows Render IPs (or use 0.0.0.0/0 for all)
4. Check MongoDB Atlas cluster is running

### Issue: API Token Not Working

**Solution:**
1. **Verify Token Format**
   - Render: Should start with `rnd_`
   - Netlify: Should start with `nfp_`
   - MongoDB Atlas: Public key is short, private key is long

2. **Check Token Permissions**
   - Ensure token has necessary permissions
   - Some tokens may need specific scopes

3. **Regenerate Token**
   - If token is lost or compromised, revoke old one
   - Create new token and update environment variable

4. **Test Token Manually**
   - Use curl or Postman to test API access
   - See Testing section for examples

### Issue: Can't Find Provider Internal ID

**Solution:**
1. **Check Provider Dashboard**
   - Most providers show IDs in service/site settings
   - Look for "ID", "Service ID", "Site ID", etc.

2. **Use Provider API**
   - List all services/sites using the API
   - Find your service in the response
   - Use the `id` field

3. **Check URLs**
   - Many providers include IDs in dashboard URLs
   - Extract from URL if visible

### Issue: Environment Variables Not Loading

**Solution:**
1. **Verify Variable Names**
   - Check for typos (case-sensitive)
   - Ensure exact match with code expectations

2. **Restart Service**
   - Render requires restart after adding variables
   - Go to service → **Manual Deploy** → **Deploy latest commit**

3. **Check Variable Scope**
   - Ensure variables are set for correct environment
   - Check if variables are set at service or group level

4. **Verify Sync Status**
   - In Render, check that variables show as "Synced"
   - If using `sync: false` in render.yaml, set manually

---

## Security Best Practices

1. **Never Commit Secrets**
   - Use `.gitignore` to exclude `.env` files
   - Never push secrets to version control

2. **Use Strong Secrets**
   - Generate random strings for JWT and internal secrets
   - Use at least 32 characters

3. **Rotate Tokens Regularly**
   - Periodically regenerate API tokens
   - Update environment variables when rotating

4. **Limit Token Permissions**
   - Only grant necessary permissions to API tokens
   - Use read-only tokens when possible

5. **Monitor Access**
   - Regularly check provider dashboards for unusual activity
   - Revoke unused tokens

6. **Use Environment-Specific Values**
   - Use different secrets for development and production
   - Never use production secrets in development

---

## Quick Reference

### Environment Variables Summary

| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `MONGODB_URI` | ✅ | Connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | ✅ | Random string | `abc123...xyz` (64 chars) |
| `INTERNAL_SECRET` | ✅ | Random string | `def456...uvw` (64 chars) |
| `RENDER_API_KEY` | ❌ | `rnd_...` | `rnd_xxxxxxxxxxxxxxxx` |
| `NETLIFY_API_TOKEN` | ❌ | `nfp_...` | `nfp_xxxxxxxxxxxxxxxx` |
| `MONGODB_ATLAS_API_PUBLIC_KEY` | ❌ | Short string | `xxxxxxxx` |
| `MONGODB_ATLAS_API_PRIVATE_KEY` | ❌ | Long string | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxxxx` |
| `MONGODB_ATLAS_PROJECT_ID` | ❌ | Hex string | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `MAKE_WEBHOOK_SECRET` | ❌ | Random string | `ghi789...rst` (64 chars) |

### Provider Internal ID Formats

| Provider | Format | Example |
|----------|--------|---------|
| Render | UUID | `srv-abc123def456` |
| Netlify | UUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| MongoDB Atlas | Cluster name | `Cluster0` |
| Make.com | Numeric | `123456789` |

---

## Additional Resources

- [Render API Documentation](https://render.com/docs/api)
- [Netlify API Documentation](https://docs.netlify.com/api/get-started/)
- [MongoDB Atlas API Documentation](https://www.mongodb.com/docs/atlas/reference/api-resources/)
- [Make.com Webhooks](https://www.make.com/en/help/apps/webhooks)

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the main [README.md](README.md) for general troubleshooting
2. Review Render service logs for error messages
3. Verify all environment variables are set correctly
4. Test API access manually using curl or Postman
5. Check provider documentation for API changes

---

**Last Updated**: 2024
**Version**: 1.0

