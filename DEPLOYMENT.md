# Deployment Guide for SST Project

This guide explains how to deploy the SST project to Vercel (frontend) and Render (backend) and how to configure them to work together.

## CORS Configuration

The application uses CORS to allow the frontend and backend to communicate when deployed to different domains. The following steps ensure proper CORS configuration:

### Backend Configuration (Render)

1. The backend automatically allows requests from the following domains:
   - http://localhost:3000 (local development)
   - https://sst-project.onrender.com (backend URL)
   - https://sst-project-kappa.vercel.app (production Vercel URL)
   - https://sst-project-git-main-vivnovation.vercel.app (preview Vercel URL)
   - Any Vercel domain containing "vercel.app"

2. You can customize allowed origins by setting the `CORS_ORIGINS` environment variable in Render:
   ```
   CORS_ORIGINS=https://your-domain.com,https://another-domain.com
   ```

### Frontend Configuration (Vercel)

1. Set the `VITE_API_URL` environment variable in your Vercel project settings:
   ```
   VITE_API_URL=https://sst-project.onrender.com
   ```

2. Make sure this URL points to your actual backend deployment URL.

## Environment Variables

### Backend (Render)

Required environment variables:
- `PORT`: Port for the server (default: 5000)
- `NODE_ENV`: "production" for production deployment
- `CORS_ORIGINS`: Comma-separated list of allowed domains (optional)

### Frontend (Vercel)

Required environment variables:
- `VITE_API_URL`: Backend API URL (e.g., https://sst-project.onrender.com)

## Deployment Steps

### Backend to Render

1. Connect your GitHub repository to Render
2. Select "Web Service" as the type
3. Configure the service:
   - Name: sst-project
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Add environment variables
5. Deploy

### Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the project:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: dist
3. Add environment variables:
   - VITE_API_URL=https://sst-project.onrender.com
4. Deploy

## Troubleshooting CORS Issues

If you encounter CORS errors:

1. Check browser console for specific error messages
2. Verify the `Origin` header in the request
3. Check backend logs for any CORS-related messages
4. Ensure the frontend is using the correct API URL
5. Try using the `fetchWithCORSHandling` utility for API requests to handle CORS errors gracefully

Remember that CORS is enforced by browsers, so API requests from server-side code (like during SSR) will not be subject to CORS restrictions. 