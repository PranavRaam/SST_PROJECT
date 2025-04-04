FROM python:3.9-slim

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
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Set the working directory to the backend folder
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application - using shell form
CMD gunicorn app:app --bind 0.0.0.0:${PORT:-8080} 