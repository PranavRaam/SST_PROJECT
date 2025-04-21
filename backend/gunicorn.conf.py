import multiprocessing

# Gunicorn server configurations
bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 4
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Process naming
proc_name = "sst_project_backend"

# Performance tuning
max_requests = 1000
max_requests_jitter = 100
graceful_timeout = 30
