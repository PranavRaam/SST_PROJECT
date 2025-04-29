import os
import pandas as pd
import geopandas as gpd
import logging
import time
import pickle
from functools import lru_cache
import main  # Import the main module with the existing data loading functions
import sys

# Configure logging to output to console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('data_preloader.log')
    ]
)
logger = logging.getLogger(__name__)

# Define the data cache directory
DATA_CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")
if not os.path.exists(DATA_CACHE_DIR):
    os.makedirs(DATA_CACHE_DIR)
    logger.info(f"Created data cache directory: {DATA_CACHE_DIR}")
else:
    logger.info(f"Using existing data cache directory: {DATA_CACHE_DIR}")

# Define pickle file paths
MSA_DATA_CACHE = os.path.join(DATA_CACHE_DIR, "msa_data.pkl")
COUNTY_DATA_CACHE = os.path.join(DATA_CACHE_DIR, "county_data.pkl")
STATES_DATA_CACHE = os.path.join(DATA_CACHE_DIR, "states_data.pkl")
COUNTY_MSA_CACHE = os.path.join(DATA_CACHE_DIR, "county_msa_relationships.pkl")

def download_and_cache_all_data():
    """
    Download all census data and cache it for faster future access
    """
    logger.info("Starting data download and caching process...")
    start_time = time.time()
    
    # Download and cache MSA data
    try:
        logger.info("Downloading MSA data...")
        msa_data = main.get_msa_data()
        logger.info(f"Downloaded {len(msa_data)} MSA records")
        
        # Pre-process the data
        logger.info("Pre-processing MSA data...")
        msa_data['geometry'] = msa_data.geometry.simplify(0.01)
        
        # Save to pickle file
        with open(MSA_DATA_CACHE, 'wb') as f:
            pickle.dump(msa_data, f)
        logger.info(f"MSA data cached to {MSA_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error downloading MSA data: {str(e)}")
    
    # Download and cache County data
    try:
        logger.info("Downloading County data...")
        county_data = main.get_county_data()
        logger.info(f"Downloaded {len(county_data)} County records")
        
        # Pre-process the data
        logger.info("Pre-processing County data...")
        county_data['geometry'] = county_data.geometry.simplify(0.01)
        
        # Save to pickle file
        with open(COUNTY_DATA_CACHE, 'wb') as f:
            pickle.dump(county_data, f)
        logger.info(f"County data cached to {COUNTY_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error downloading County data: {str(e)}")
    
    # Download and cache States data
    try:
        logger.info("Downloading States data...")
        states_data = main.get_states_data()
        logger.info(f"Downloaded {len(states_data)} States records")
        
        # Pre-process the data
        logger.info("Pre-processing States data...")
        states_data['geometry'] = states_data.geometry.simplify(0.001)
        
        # Save to pickle file
        with open(STATES_DATA_CACHE, 'wb') as f:
            pickle.dump(states_data, f)
        logger.info(f"States data cached to {STATES_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error downloading States data: {str(e)}")
    
    # Download and cache County-MSA relationships
    try:
        logger.info("Downloading County-MSA relationships...")
        county_msa, df = main.get_county_msa_relationships()
        logger.info(f"Downloaded {len(county_msa)} County-MSA relationships")
        
        # Save to pickle file
        with open(COUNTY_MSA_CACHE, 'wb') as f:
            pickle.dump((county_msa, df), f)
        logger.info(f"County-MSA relationships cached to {COUNTY_MSA_CACHE}")
    except Exception as e:
        logger.error(f"Error downloading County-MSA relationships: {str(e)}")
    
    elapsed_time = time.time() - start_time
    logger.info(f"Data download and caching completed in {elapsed_time:.2f} seconds")

def get_cached_msa_data():
    """
    Get MSA data from cache, or download if not available
    """
    if os.path.exists(MSA_DATA_CACHE):
        try:
            with open(MSA_DATA_CACHE, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading cached MSA data: {str(e)}")
    
    # If cache doesn't exist or loading fails, download the data and cache it
    logger.info("MSA data cache not found or invalid, downloading...")
    msa_data = main.get_msa_data()
    msa_data['geometry'] = msa_data.geometry.simplify(0.01)
    
    # Save to cache
    try:
        with open(MSA_DATA_CACHE, 'wb') as f:
            pickle.dump(msa_data, f)
        logger.info(f"MSA data cached to {MSA_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error caching MSA data: {str(e)}")
    
    return msa_data

def get_cached_county_data():
    """
    Get County data from cache, or download if not available
    """
    if os.path.exists(COUNTY_DATA_CACHE):
        try:
            with open(COUNTY_DATA_CACHE, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading cached County data: {str(e)}")
    
    # If cache doesn't exist or loading fails, download the data and cache it
    logger.info("County data cache not found or invalid, downloading...")
    county_data = main.get_county_data()
    county_data['geometry'] = county_data.geometry.simplify(0.01)
    
    # Save to cache
    try:
        with open(COUNTY_DATA_CACHE, 'wb') as f:
            pickle.dump(county_data, f)
        logger.info(f"County data cached to {COUNTY_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error caching County data: {str(e)}")
    
    return county_data

def get_cached_states_data():
    """
    Get States data from cache, or download if not available
    """
    if os.path.exists(STATES_DATA_CACHE):
        try:
            with open(STATES_DATA_CACHE, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading cached States data: {str(e)}")
    
    # If cache doesn't exist or loading fails, download the data and cache it
    logger.info("States data cache not found or invalid, downloading...")
    states_data = main.get_states_data()
    states_data['geometry'] = states_data.geometry.simplify(0.001)
    
    # Save to cache
    try:
        with open(STATES_DATA_CACHE, 'wb') as f:
            pickle.dump(states_data, f)
        logger.info(f"States data cached to {STATES_DATA_CACHE}")
    except Exception as e:
        logger.error(f"Error caching States data: {str(e)}")
    
    return states_data

def get_cached_county_msa_relationships():
    """
    Get County-MSA relationships from cache, or download if not available
    """
    if os.path.exists(COUNTY_MSA_CACHE):
        try:
            with open(COUNTY_MSA_CACHE, 'rb') as f:
                cached_data = pickle.load(f)
                
                # Ensure we return a consistent tuple format
                if isinstance(cached_data, tuple) and len(cached_data) >= 2:
                    # The cache contains the expected (county_msa, df) tuple
                    return cached_data
                elif isinstance(cached_data, dict):
                    # The cache only contains the county_msa dictionary
                    logger.warning("Cache contains only county_msa dictionary, reconstructing tuple")
                    return cached_data, None
                else:
                    # Unknown format, log warning and fall back to downloading
                    logger.warning(f"Unexpected format in County-MSA cache: {type(cached_data)}")
                    raise ValueError("Cache format not recognized")
        except Exception as e:
            logger.error(f"Error loading cached County-MSA relationships: {str(e)}")
    
    # If cache doesn't exist or loading fails, download the data and cache it
    logger.info("County-MSA relationships cache not found or invalid, downloading...")
    county_msa, df = main.get_county_msa_relationships()
    
    # Save to cache
    try:
        with open(COUNTY_MSA_CACHE, 'wb') as f:
            pickle.dump((county_msa, df), f)
        logger.info(f"County-MSA relationships cached to {COUNTY_MSA_CACHE}")
    except Exception as e:
        logger.error(f"Error caching County-MSA relationships: {str(e)}")
    
    return county_msa, df

@lru_cache(maxsize=1)
def get_all_cached_data():
    """
    Get all data from cache, or download if not available
    """
    logger.info("Loading all cached data...")
    msa_data = get_cached_msa_data()
    county_data = get_cached_county_data()
    states_data = get_cached_states_data()
    
    # Fix unpacking issue by handling the return value more carefully
    result = get_cached_county_msa_relationships()
    
    # Check if result is a tuple with at least one item
    if isinstance(result, tuple) and len(result) > 0:
        county_msa = result[0]  # Get the first item (county_msa dictionary)
    else:
        # Fallback in case the cached data is not in the expected format
        logger.warning("Unexpected format from get_cached_county_msa_relationships, fetching directly")
        county_msa, _ = main.get_county_msa_relationships()
    
    return msa_data, county_data, states_data, county_msa

if __name__ == "__main__":
    download_and_cache_all_data() 