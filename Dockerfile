FROM python:3.9-slim AS backend

WORKDIR /app

# Install system dependencies including GDAL
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    gcc \
    g++ \
    libstdc++6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the backend files to reduce image size
COPY backend /app/backend
COPY entrypoint.sh /app/

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the working directory to the backend folder
WORKDIR /app/backend

# Build frontend separately
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies 
COPY frontend/package*.json ./
RUN npm ci --only=production

# Explicitly install terser to ensure it's available for the build
RUN npm install --no-save terser@5.26.0

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Final stage: Combine with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend build files from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Create backend directory
WORKDIR /app/backend

# Copy backend files from backend stage
COPY --from=backend /app/backend ./

# Copy entrypoint
COPY --from=backend /app/entrypoint.sh /app/

# Install Python and required packages with specific versions to avoid compatibility issues
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --no-cache-dir flask==2.0.1 gunicorn==20.1.0 flask-cors==3.0.10 psutil==5.9.0

# Expose the port
EXPOSE 80

# Create a custom entrypoint script
RUN echo '#!/bin/sh\n\
# Start backend in background\n\
cd /app/backend && gunicorn --config=gunicorn.conf.py app:app --bind 0.0.0.0:5000 &\n\
# Wait for backend to start\n\
sleep 5\n\
# Start nginx in foreground\n\
nginx -g "daemon off;"' > /start.sh && \
chmod +x /start.sh

CMD ["/start.sh"] 