import os
import sys
import logging
import threading
import time
from flask import Flask
from app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('debug_server.log')
    ]
)
logger = logging.getLogger("DebugServer")

def check_data_cache():
    """Check and report on the status of the data cache"""
    logger.info("Checking data cache status...")
    
    # Ensure data cache directory exists
    data_cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")
    if not os.path.exists(data_cache_dir):
        logger.warning("Data cache directory does not exist, creating it...")
        os.makedirs(data_cache_dir, exist_ok=True)
    
    # Check for required data files
    required_files = ["msa_data.pkl", "county_data.pkl", "states_data.pkl", "county_msa_relationships.pkl"]
    missing_files = [f for f in required_files if not os.path.exists(os.path.join(data_cache_dir, f))]
    
    if missing_files:
        logger.warning(f"Missing data cache files: {missing_files}")
        logger.info("Will trigger data preload when server starts")
        return False
    else:
        # Check size of files to ensure they're valid
        total_size = sum(os.path.getsize(os.path.join(data_cache_dir, f)) for f in required_files)
        logger.info(f"Data cache is ready - {len(required_files)} files, total size: {total_size/1024/1024:.2f} MB")
        return True

def check_map_cache():
    """Check and report on the status of the map cache"""
    logger.info("Checking map cache status...")
    
    # Ensure cache directory exists
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
    if not os.path.exists(cache_dir):
        logger.warning("Map cache directory does not exist, creating it...")
        os.makedirs(cache_dir, exist_ok=True)
        return False
    
    # Count cached maps
    cached_maps = [f for f in os.listdir(cache_dir) if f.endswith('.html')]
    if cached_maps:
        logger.info(f"Found {len(cached_maps)} cached maps")
        return True
    else:
        logger.info("No cached maps found")
        return False

def monitor_cache_directories():
    """Periodically monitor cache directories and report status"""
    while True:
        # Check data cache
        data_cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")
        if os.path.exists(data_cache_dir):
            data_files = [f for f in os.listdir(data_cache_dir) if f.endswith('.pkl')]
            logger.info(f"Data cache status: {len(data_files)} data files")
        
        # Check map cache
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
        if os.path.exists(cache_dir):
            map_files = [f for f in os.listdir(cache_dir) if f.endswith('.html')]
            logger.info(f"Map cache status: {len(map_files)} map files")
        
        # Sleep for a minute before checking again
        time.sleep(60)

def preload_data():
    """Preload essential data before starting the server"""
    try:
        from data_preloader import get_all_cached_data
        logger.info("Preloading data...")
        start_time = time.time()
        data = get_all_cached_data()
        elapsed_time = time.time() - start_time
        
        if data and all(data):
            logger.info(f"Data preloaded successfully in {elapsed_time:.2f} seconds")
            return True
        else:
            logger.warning(f"Data preload failed or incomplete")
            return False
    except Exception as e:
        logger.exception(f"Error preloading data: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Starting debug server...")
    
    # Check cache directories
    data_cache_ready = check_data_cache()
    map_cache_ready = check_map_cache()
    
    # Start cache monitor in background
    monitor_thread = threading.Thread(target=monitor_cache_directories, daemon=True)
    monitor_thread.start()
    
    # Preload data if needed
    if not data_cache_ready:
        logger.info("Preloading data before starting server...")
        preload_data()
    
    # Start the server
    logger.info("Starting Flask server on port 5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 