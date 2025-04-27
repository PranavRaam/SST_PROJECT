import os
import pandas as pd
import logging
import geopandas as gpd
import csv
from pathlib import Path

logger = logging.getLogger(__name__)

def load_pg_and_hhah_data():
    """
    Load PG and HHAH data from the Actual_Data directory
    
    Returns:
        Two DataFrames: pg_data, hhah_data
    """
    logger.info("Loading PG and HHAH data from Actual_Data directory")
    
    # Define paths to data files
    base_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    actual_data_dir = base_dir / "Actual_Data"
    
    # Files to read
    pg_file = actual_data_dir / "Listing of all PG and HHAH - PG.csv"
    east_central_file = actual_data_dir / "Listing of all PG and HHAH - East Central_Details.csv"
    central_file = actual_data_dir / "Listing of all PG and HHAH - Central_Details.csv"
    west_file = actual_data_dir / "Listing of all PG and HHAH - West_Details.csv"
    
    # Load all details files
    detail_files = [east_central_file, central_file, west_file]
    all_details = []
    
    for file in detail_files:
        try:
            details = pd.read_csv(file)
            all_details.append(details)
        except Exception as e:
            logger.error(f"Error reading {file}: {e}")
    
    if not all_details:
        logger.error("Failed to load any detail files")
        return None, None
    
    # Combine all details
    hhah_data = pd.concat(all_details, ignore_index=True)
    
    # Extract PG data from the PG file
    pg_data = []
    try:
        with open(pg_file, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            # PG data is structured with regions in rows 0, 2, 4, 6 and cities in rows 1, 3, 5, 7
            regions = {"WEST": rows[0], "CENTRAL": rows[3], "EAST CENTRAL": rows[6]}
            cities = {"WEST": rows[1], "CENTRAL": rows[4], "EAST CENTRAL": rows[7]}
            
            for region, pgs in regions.items():
                region_cities = cities[region]
                for i, pg in enumerate(pgs):
                    if pg.strip():  # Skip empty values
                        pg_data.append({
                            "Region": region,
                            "Name": pg,
                            "City": region_cities[i] if i < len(region_cities) else "",
                            "Metropolitan Area": region_cities[i] if i < len(region_cities) else ""
                        })
    except Exception as e:
        logger.error(f"Error processing PG file: {e}")
    
    # Convert PG data to DataFrame
    pg_df = pd.DataFrame(pg_data)
    
    logger.info(f"Loaded {len(pg_df)} PGs and {len(hhah_data)} HHAHs")
    
    return pg_df, hhah_data

def identify_virgin_statistical_areas(msa_data):
    """
    Identify which MSAs have PGs/HHAHs (non-virgin) and which don't (virgin)
    
    Args:
        msa_data: GeoDataFrame containing MSA information
    
    Returns:
        Two lists: virgin_msas, non_virgin_msas (each containing CBSAFP codes)
    """
    logger.info("Identifying virgin and non-virgin statistical areas")
    
    # Load PG and HHAH data
    pg_df, hhah_data = load_pg_and_hhah_data()
    
    if pg_df is None or hhah_data is None:
        logger.error("Failed to load customer data")
        return [], []
    
    # Get all MSAs with customer data
    customer_msas = set()
    
    # Extract MSAs from PG data based on city
    if 'City' in pg_df.columns:
        pg_cities = set(pg_df['City'].dropna().str.strip())
        
        # Match PG cities to MSAs
        for _, msa in msa_data.iterrows():
            msa_name = msa['NAME']
            # Try to match city to MSA name
            for city in pg_cities:
                if city and city.lower() in msa_name.lower():
                    customer_msas.add(msa['CBSAFP'])
                    break
    
    # Extract MSAs from HHAH data based on Metropolitan Area column
    if 'Metropolitan (or Micropolitan) Statistical Area' in hhah_data.columns:
        hhah_msas = set(hhah_data['Metropolitan (or Micropolitan) Statistical Area'].dropna().str.strip())
        
        # Match HHAH MSAs to MSA data
        for _, msa in msa_data.iterrows():
            msa_name = msa['NAME']
            # Try to match MSA names
            for hhah_msa in hhah_msas:
                if hhah_msa and (
                    hhah_msa.lower() in msa_name.lower() or
                    hhah_msa.lower().split(' ')[0] in msa_name.lower()
                ):
                    customer_msas.add(msa['CBSAFP'])
                    break
    
    # Separate MSAs into virgin and non-virgin
    non_virgin_msas = list(customer_msas)
    
    # All MSAs not in customer_msas are virgin MSAs
    virgin_msas = [msa['CBSAFP'] for _, msa in msa_data.iterrows() 
                  if msa['CBSAFP'] not in customer_msas]
    
    logger.info(f"Identified {len(virgin_msas)} virgin MSAs and {len(non_virgin_msas)} non-virgin MSAs")
    
    return virgin_msas, non_virgin_msas 