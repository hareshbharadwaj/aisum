# Railway Deployment Guide

## Environment Variables Required on Railway

When deploying to Railway, you **MUST** set these environment variables in Railway's dashboard **BEFORE** triggering a build:

### Required Variables:

```
GEMINI_API_KEY=your_actual_gemini_api_key
VITE_GOOGLE_API_KEY=your_actual_gemini_api_key
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai_study_companion?retryWrites=true&w=majority
```

### Steps to Deploy:

1. **Go to Railway Dashboard** → Your Project → Variables
2. **Add the following environment variables:**
   - `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikeys
   - `VITE_GOOGLE_API_KEY` - Same as above (required for frontend build)
   - `MONGO_URI` - Your MongoDB Atlas connection string

3. **Important:** Set these variables **BEFORE** deploying. Railway will automatically rebuild with these env vars.

4. **Trigger deployment:**
   - Push to GitHub and Railway will auto-deploy
   - OR manually trigger via Railway dashboard

### Why This is Important:

- **Vite embeds API keys at build time** - If `VITE_GOOGLE_API_KEY` is not set during build, the frontend won't have the API key
- **Docker layer caching** - Railway caches layers, so ensure env vars are set before build
- **Frontend vs Backend** - Both need the API keys:
  - Frontend uses `VITE_GOOGLE_API_KEY` for Gemini API calls
  - Backend uses `GEMINI_API_KEY` for database operations (via environment)

### Troubleshooting:

If you see "Failed to generate summary due to an API error":
1. Check Railway logs for build errors
2. Verify all three env vars are set in Railway dashboard
3. Redeploy after setting variables

### Local Development:

Use `.env.local` for local testing:
```
GEMINI_API_KEY=your_key
VITE_GOOGLE_API_KEY=your_key
MONGO_URI=your_atlas_uri
```

### Docker Local Deployment:

```bash
docker build -t ai-study-companion .
docker run -p 3500:4000 --env-file .env.local ai-study-companion
```
