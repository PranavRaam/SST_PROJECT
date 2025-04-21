import multiprocessing
import os

# Determine workers based on environment or CPU count
workers_count = int(os.environ.get('GUNICORN_WORKERS', 
                                  min(multiprocessing.cpu_count() * 2 + 1, 8)))  # Cap at 8 to avoid overloading

# Gunicorn server configurations
bind = os.environ.get('GUNICORN_BIND', '0.0.0.0:5000')
workers = workers_count
worker_class = 'gthread'
threads = int(os.environ.get('GUNICORN_THREADS', '4'))
worker_connections = 1000
timeout = int(os.environ.get('GUNICORN_TIMEOUT', '120'))
keepalive = 5

# Logging
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr
loglevel = os.environ.get('GUNICORN_LOG_LEVEL', 'info')

# Process naming
proc_name = 'sst_project_backend'

# Performance tuning - adjust for cloud environments
max_requests = int(os.environ.get('GUNICORN_MAX_REQUESTS', '1000'))
max_requests_jitter = int(os.environ.get('GUNICORN_MAX_REQUESTS_JITTER', '100'))
graceful_timeout = int(os.environ.get('GUNICORN_GRACEFUL_TIMEOUT', '30'))

# Important for containerized environments
forwarded_allow_ips = '*'
