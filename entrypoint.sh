#!/bin/bash
set -e

# Get PORT from environment or default to 8080
PORT="${PORT:-8080}"

# Configure path and other environment variables
export PYTHONPATH="${PYTHONPATH}:/app:/app/backend"

# Log startup information
echo "Starting backend service on port $PORT"
echo "Using Python: $(python3 --version)"
echo "Working directory: $(pwd)"

# Check if gunicorn.conf.py exists
if [ -f "gunicorn.conf.py" ]; then
  echo "Using Gunicorn config file"
  exec gunicorn --config=gunicorn.conf.py app:app --bind "0.0.0.0:$PORT"
else
  echo "No Gunicorn config found, using default settings"
  exec gunicorn app:app --bind "0.0.0.0:$PORT" --workers 4 --timeout 120
fi 