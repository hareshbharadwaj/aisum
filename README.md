<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dvxPIRuXU8XgaYewoQRiy41J3u1UezQf

## Run Locally
**Prerequisites:** Node.js and (optionally) MongoDB Compass or a local MongoDB server

Quick start (single command):

1. Install dependencies (one-time):

```powershell
npm run setup
```

2. Start the app (this will create a `.env` from `.env.example` if missing and then start frontend + backend):

```powershell
npm run start
```

Notes:
- If you have MongoDB installed and want to use a specific connection, open the `.env` file (created by the start script) and update `MONGO_URI` to point to your MongoDB instance (for example the connection string copied from MongoDB Compass). The database will be created automatically on first write.
- If you don't have MongoDB installed, you can use Docker to start a local MongoDB with `npm run start:local` which will run a MongoDB container and start the app.

Set your Gemini API key in the generated `.env` (GEMINI_API_KEY) before using AI features.
