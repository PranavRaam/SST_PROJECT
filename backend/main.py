import geopandas as gpd
import folium
from folium.plugins import MousePosition, Fullscreen, MiniMap
import branca.colormap as cm
import pandas as pd
import numpy as np
import requests
import io
import os
import zipfile
import tempfile
from folium import IFrame, Figure
from branca.element import MacroElement
from jinja2 import Template
import logging

# Import the customer_data_processor module for virgin/non-virgin MSA analysis
try:
    import customer_data_processor
except ImportError:
    # Create a custom handler if the module is missing
    class DummyCustomerDataProcessor:
        @staticmethod
        def identify_virgin_statistical_areas(*args, **kwargs):
            print("Warning: customer_data_processor module not available, using empty data")
            return [], []
    customer_data_processor = DummyCustomerDataProcessor()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LegendControl(MacroElement):
    def __init__(self, title, color_dict, position='bottomright'):
        super(LegendControl, self).__init__()
        self._name = 'LegendControl'
        self.title = title
        self.color_dict = color_dict
        self.position = position
        
        self.template = Template("""
            {% macro script(this, kwargs) %}
            var legend = L.control({position: "{{this.position}}"});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create("div", "legend");
                div.innerHTML = `
                    <div style="background-color: white; padding: 10px; border-radius: 5px; border: 2px solid gray;">
                        <div style="text-align: center; margin-bottom: 5px; font-weight: bold;">{{this.title}}</div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            {% for name, color in this.color_dict.items() %}
                                <div style="display: flex; align-items: center;">
                                    <span style="background: {{color}}; width: 20px; height: 15px; display: inline-block;"></span>
                                    <span style="margin-left: 5px; font-size: 12px;">{{name}}</span>
                                </div>
                            {% endfor %}
                        </div>
                    </div>
                `;
                return div;
            };
            legend.addTo({{this._parent.get_name()}});
            {% endmacro %}
        """)

def download_and_unzip(url, extract_to=None, cache=True):
    if extract_to is None:
        extract_to = tempfile.mkdtemp()
        
    cache_dir = os.path.join(tempfile.gettempdir(), 'county_map_cache')
    os.makedirs(cache_dir, exist_ok=True)
    
    cache_key = os.path.basename(url)
    cache_path = os.path.join(cache_dir, cache_key)
    
    if cache and os.path.exists(cache_path):
        print(f"Using cached data for {url}")
        return cache_path
    
    print(f"Downloading data from {url}...")
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download from {url}. Status code: {response.status_code}")
        
    output_dir = cache_path if cache else extract_to
    os.makedirs(output_dir, exist_ok=True)
    
    z = zipfile.ZipFile(io.BytesIO(response.content))
    z.extractall(output_dir)
    print(f"Data extracted to {output_dir}")
    return output_dir

def get_county_data():
    url = "https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/tl_2023_us_county.zip"
    data_dir = download_and_unzip(url)
    
    county_file = os.path.join(data_dir, "tl_2023_us_county.shp")
    county_data = gpd.read_file(county_file)
    
    county_data = county_data[county_data['STATEFP'].isin([
        '01', '02', '04', '05', '06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19',
        '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
        '36', '37', '38', '39', '40', '41', '42', '44', '45', '46', '47', '48', '49', '50', '51', '53', '54', '55', '56'
    ])]
    
    county_data['geometry'] = county_data.geometry.simplify(0.01)
    
    return county_data

def get_states_data():
    url = "https://www2.census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip"
    data_dir = download_and_unzip(url)
    
    states_file = os.path.join(data_dir, "tl_2023_us_state.shp")
    states_data = gpd.read_file(states_file)
    
    states_data = states_data[~states_data['STUSPS'].isin(['AS', 'GU', 'MP', 'PR', 'VI'])]
    states_data['geometry'] = states_data.geometry.simplify(0.01)
    
    return states_data

def get_msa_data():
    url = "https://www2.census.gov/geo/tiger/TIGER2023/CBSA/tl_2023_us_cbsa.zip"
    data_dir = download_and_unzip(url)
    
    msa_file = os.path.join(data_dir, "tl_2023_us_cbsa.shp")
    msa_data = gpd.read_file(msa_file)
    
    msa_data = msa_data[msa_data['LSAD'] == 'M1']
    msa_data['geometry'] = msa_data.geometry.simplify(0.01)
    
    # Add placeholder for state count that will be populated later
    msa_data['STATE_COUNT'] = 0
    
    # Add placeholders for virgin/non-virgin status
    msa_data['IS_VIRGIN'] = False
    msa_data['HAS_CUSTOMERS'] = False
    
    return msa_data

def get_county_msa_relationships():
    try:
        url = "https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2020/delineation-files/list1_2020.xls"
        print(f"Downloading MSA-County relationships from {url}...")
        response = requests.get(url)
        if response.status_code != 200:
            url = "https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2020/delineation-files/list1.xls"
            print(f"First URL failed. Trying alternative: {url}")
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Failed to download MSA-County relationships. Status code: {response.status_code}")
        
        df = pd.read_excel(io.BytesIO(response.content), header=2)
        
        # Ensure column names exist before renaming
        if all(col in df.columns for col in ['FIPS State Code', 'FIPS County Code', 'CBSA Code', 'CBSA Title', 'Metropolitan/Micropolitan Statistical Area']):
            df = df.rename(columns={
                'FIPS State Code': 'STATEFP',
                'FIPS County Code': 'COUNTYFP',
                'CBSA Code': 'CBSAFP',
                'CBSA Title': 'CBSA_NAME',
                'Metropolitan/Micropolitan Statistical Area': 'LSAD'
            })
        else:
            # Try alternate column names that might be present
            possible_columns = {
                'State Code': 'STATEFP',
                'County Code': 'COUNTYFP', 
                'CBSA Code': 'CBSAFP',
                'CBSA Title': 'CBSA_NAME',
                'Metropolitan Division Title': 'CBSA_NAME',
                'Metropolitan/Micropolitan Statistical Area': 'LSAD',
                'CBSA Type': 'LSAD'
            }
            
            rename_dict = {}
            for old_col, new_col in possible_columns.items():
                if old_col in df.columns:
                    rename_dict[old_col] = new_col
            
            if rename_dict:
                df = df.rename(columns=rename_dict)
            else:
                print("Warning: Expected columns not found in MSA-County relationship file")
                print(f"Available columns: {df.columns.tolist()}")
                raise Exception("Could not map MSA-County relationship file columns")
        
    except Exception as e:
        print(f"Warning: Couldn't download or process the MSA-County relationship file: {e}")
        print("Attempting to create relationships from the CBSA and County shapefiles directly...")
        
        county_data = get_county_data()
        msa_data = get_msa_data()
        
        if county_data.crs != msa_data.crs:
            msa_data = msa_data.to_crs(county_data.crs)
        
        counties_list = []
        for _, county in county_data.iterrows():
            county_point = county.geometry.centroid
            
            for _, msa in msa_data.iterrows():
                if msa.geometry.contains(county_point):
                    counties_list.append({
                        'STATEFP': county['STATEFP'],
                        'COUNTYFP': county['COUNTYFP'],
                        'CBSAFP': msa['CBSAFP'],
                        'CBSA_NAME': msa['NAME'],
                        'LSAD': 'Metropolitan Statistical Area',
                    })
                    break
                    
        df = pd.DataFrame(counties_list)
    
    # Create county_to_msa dictionary
    county_to_msa = {}
    if set(['STATEFP', 'COUNTYFP', 'CBSAFP']).issubset(df.columns):
        df['STATEFP'] = df['STATEFP'].astype(str).str.zfill(2)
        df['COUNTYFP'] = df['COUNTYFP'].astype(str).str.zfill(3)
        
        # Filter to metropolitan areas if LSAD column exists
        if 'LSAD' in df.columns:
            df = df[df['LSAD'].str.contains('Metro', case=False, na=False)]
        
        for _, row in df.iterrows():
            county_id = row['STATEFP'] + row['COUNTYFP']
            county_to_msa[county_id] = {
                'CBSAFP': row['CBSAFP'],
                'CBSA_NAME': row.get('CBSA_NAME', row.get('NAME', ''))  # Try alternative column name
            }
    
    if not county_to_msa:
        print("Warning: Could not create MSA-County relationships. MSA information may be incomplete.")
    
    return county_to_msa, df

def define_regions():
    # Create a color palette matching the image
    regions = {
        "Pacific Northwest Division": {
            "states": ["WA", "OR", "AK", "HI"],
            "color": "#FF5B76"  # Pink-Red
        },
        "Intermountain Division": {
            "states": ["MT", "ID", "WY", "NV", "UT", "CO"],
            "color": "#FF9A8B"  # Light Salmon
        },
        "Southwest Division": {
            "states": ["AZ", "NM"],  # Will also include specific TX counties
            "color": "#FF6C5C"  # Coral-Red
        },
        "LA CA Division": {
            "states": [],  # Will be populated with specific CA counties
            "color": "#CC0000"  # Deep Red
        },
        "Bay Area Central CA Division": {
            "states": [],  # Will be populated with specific CA counties
            "color": "#FFBDB4"  # Pale Pink
        },
        "Great Plains Division": {
            "states": ["ND", "SD", "NE", "KS", "MN", "IA"],  # Will also include specific MO counties
            "color": "#FFF7AA"  # Light Yellow
        },
        "Illinois Wisconsin Division": {
            "states": ["WI", "IL"],  # Will exclude specific IL counties
            "color": "#FFBB8B"  # Light Orange
        },
        "Central Division 3": {
            "states": ["OK", "MO"],  # Will include specific OK counties and exclude specific MO counties
            "color": "#FFFF00"  # Bright Yellow
        },
        "The South Division": {
            "states": ["AR", "LA", "MS", "AL"],
            "color": "#bfab97"  # Very Pale Yellow
        },
        "Central & East Texas Division": {
            "states": [],  # Will be populated with specific TX counties
            "color": "#F0F0DC"  # Light Beige
        },
        "NEMA Divisional GRP Division 1": {
            "states": ["ME", "NH", "VT", "MA", "CT", "RI"],
            "color": "#702080"  # Deep Purple
        },
        "NEMA Divisional GRP Division 2": {
            "states": ["NJ"],  # Will also include specific NY counties
            "color": "#4B0082"  # Indigo
        },
        "NEMA Divisional GRP Division 3": {
            "states": ["PA", "DE"],  # Will also include specific NY counties
            "color": "#CCCCFF"  # Very Light Purple
        },
        "NEMA Divisional GRP Division 4": {
            "states": ["VA", "MD", "DC"],
            "color": "#AA80C0"  # Medium Purple
        },
        "NEMA Divisional GRP Division 5": {
            "states": ["NC", "SC"],
            "color": "#D8BFD8"  # Thistle (Light Purple)
        },
        "East Central Division 1": {
            "states": ["NY", "OH", "WV"],  # Will exclude specific NY counties and include specific PA counties
            "color": "#D6F6D5"  # Very Light Blue
        },
        "East Central Division 2": {
            "states": ["MI", "IN"],
            "color": "#90EE90"  # Light Green
        },
        "East Central Division 3": {
            "states": ["KY", "TN"],  # Also includes "West OS" (possibly West Ohio)
            "color": "#2F8F71"  # Teal Green
        },
        "East Central Division 4": {
            "states": ["GA"],  # Also includes parts of FL not explicitly mentioned
            "color": "#218C74"  # Forest Green
        },
        "East Central Division 5": {
            "states": [],  # Will be populated with specific FL counties
            "color": "#ABEBC6"  # Light Green
        }
    }
    
    # Define special county assignments
    # Southwest Division - specific TX counties
    southwest_tx_counties = [
        "Bailey", "Sherman", "Hansford", "Ochiltree", "Lipscomb", "Hartley", "Moore", 
        "Hutchinson", "Roberts", "Hemphill", "Oldham", "Potter", "Carson", "Gray", 
        "Wheeler", "Deaf Smith", "Randall", "Armstrong", "Donley", "Collingsworth", 
        "Parmer", "Castro", "Swisher", "Briscoe", "Hall", "Childress", "Hardeman", 
        "Foard", "Knox", "Baylor", "Cochran", "Hockley", "Crosby", "Dickens", "King", 
        "Yoakum", "Terry", "Lynn", "Garza", "Kent", "Gaines", "Dawson", "Borden", 
        "Scurry", "Andrews", "Martin", "Howard", "Mitchell", "Nolan", "El Paso", 
        "Hudspeth", "Culberson", "Reeves", "Pecos", "Jeff Davis", "Presidio", 
        "Brewster", "Terrell", "Val Verde", "Loving", "Winkler", "Ector", "Midland", 
        "Glasscock", "Sterling", "Coke", "Reagan", "Irion", "Tom Green", "Concho", 
        "McCulloch", "Crockett", "Schleicher", "Menard", "Mason", "Sutton", "Kimble", 
        "Edwards", "Real", "Kinney", "Uvalde", "Maverick", "Zavala", "Dimmit", "Frio", 
        "La Salle", "McMullen", "Live Oak", "Bee", "Goliad", "Victoria", "Webb", 
        "Duval", "Jim Wells", "Kleberg", "Zapata", "Jim Hogg", "Kenedy", "Starr", 
        "Hidalgo", "Willacy", "Cameron", "Lamb", "Hale", "Floyd", "Motley",  "Cottle", 
        "Lubbock", "Ward", "Crane", "Upton", "Dallam", "Brooks"
    ]
    
    # Great Plains Division - specific MO counties
    great_plains_mo_counties = [
        "Platte", "Clinton", "Caldwell", "Clay", "Ray", "Jackson", "Lafayette", "Cass", "Bates"
    ]
    
    # Illinois Wisconsin Division - specific IL counties to exclude
    il_wi_exclude_counties = [
        "Jersey", "Macoupin", "Madison", "Bond", "Clinton", "St. Clair", "Monroe"
    ]
    
    # Central Division 3 - specific OK counties and DFW TX counties
    # Fixed the issue - these were incorrectly labeled as OK counties when they're TX counties
    central_div3_tx_counties = [
        "Montague", "Cooke", "Grayson", "Fannin", "Denton", "Collin", "Hunt", 
        "Rockwall", "Parker", "Tarrant", "Dallas", "Kaufman", "Hood", "Johnson", "Ellis"
    ]
    
    # NEMA Divisional GRP Division 2 - specific NY counties
    nema_div2_ny_counties = [
        "Pike", "Putnam", "Rockland", "Westchester", "Bronx", "Queens", "Kings", 
        "Richmond", "Suffolk", "Nassau", "New York"
    ]
    
    # NEMA Divisional GRP Division 3 - specific NY counties
    nema_div3_ny_counties = ["Sullivan", "Ulster", "Dutchess", "Orange"]
    
    # East Central Division 1 - specific PA counties (fixed naming from OH/PA to PA only)
    east_central_div1_pa_counties = [
        "Erie", "Crawford", "Lawrence", "Butler", "Armstrong", "Beaver", "Allegheny", 
        "McKean", "Westmoreland", "Washington", "Fayette", "Greene"
    ]
    
    # East Central Division 5 - specific FL counties
    east_central_div5_fl_counties = [
        "Hernando", "Pasco", "Pinellas", "Hillsborough", "Manatee", "Sarasota", 
        "Charlotte", "Lee", "Collier", "Monroe", "Miami-Dade", "Broward", "Palm Beach", 
        "Martin", "St. Lucie", "Okeechobee", "Highlands", "Glades", "Hardee", "DeSoto", 
        "Sumter", "Lake", "Seminole", "Orange", "Osceola", "Brevard", "Indian River", "Polk",
        "Hendry"
    ]
    
    # California regions - more precisely defined with full county names
    ca_regions = {
        "LA CA Division": ["Los Angeles", "Orange", "Riverside", "San Bernardino", "San Diego", 
                           "Ventura", "Imperial", "Santa Barbara", "San Luis Obispo"],
        "Bay Area Central CA Division": ["Alameda", "Contra Costa", "Marin", "Napa", "San Francisco", 
                                        "San Mateo", "Santa Clara", "Solano", "Sonoma", "Sacramento", 
                                        "San Joaquin", "Stanislaus", "Merced", "Madera", "Fresno", 
                                        "Kings", "Tulare", "Kern", "Monterey", "San Benito", "Santa Cruz"]
    }
    
    # Create dictionaries of special county assignments with corrected labels
    special_county_regions = {
        "Southwest Division": {"TX": southwest_tx_counties},
        "Great Plains Division": {"MO": great_plains_mo_counties},
        "Central Division 3": {"TX": central_div3_tx_counties}, 
        "NEMA Divisional GRP Division 2": {"NY": nema_div2_ny_counties},  
        "NEMA Divisional GRP Division 3": {"NY": nema_div3_ny_counties},
        "East Central Division 1": {"PA": east_central_div1_pa_counties},
        "East Central Division 5": {"FL": east_central_div5_fl_counties}
    }
    
    # Counties to exclude from their default state assignment
    exclude_counties = {
        "IL": il_wi_exclude_counties,
        "NY": nema_div2_ny_counties + nema_div3_ny_counties  
    }
    
    return regions, ca_regions, special_county_regions, exclude_counties

def assign_counties_to_regions_and_msas(county_data, regions, ca_regions, special_county_regions, exclude_counties, county_to_msa):
    # Create a mapping from state code to region
    state_to_region = {}
    for region, data in regions.items():
        for state in data["states"]:
            state_to_region[state] = region
    
    # Get state data for mapping state codes to abbreviations
    states_data = get_states_data()
    state_mapping = dict(zip(states_data['STATEFP'], states_data['STUSPS']))
    
    # Add state abbreviations to county data
    county_data['STUSPS'] = county_data['STATEFP'].map(state_mapping)
    
    # Define function to assign regions
    def get_region(row):
        state = row['STUSPS']
        county_name = row['NAME']
        
        # First check if county is in any special county assignments
        for region, state_counties_dict in special_county_regions.items():
            for county_state, counties in state_counties_dict.items():
                if state == county_state and county_name in counties:
                    return region
        
        # Check if county should be excluded from default state assignment
        if state in exclude_counties and county_name in exclude_counties[state]:
            # For IL counties in the exclude list, assign to Central Division 3
            if state == "IL":
                return "Central Division 3"
            return "Unassigned"
        
        # Handle California counties
        if state == 'CA':
            for region, counties in ca_regions.items():
                if any(county_name == county for county in counties):
                    return region
            # Default for CA counties not explicitly assigned
            return "Bay Area Central CA Division"
        
        # Handle Texas counties not in Southwest Division or Central Division 3
        if state == 'TX':
            sw_counties = special_county_regions.get("Southwest Division", {}).get("TX", [])
            central_counties = special_county_regions.get("Central Division 3", {}).get("TX", [])
            
            if county_name in sw_counties:
                return "Southwest Division"
            elif county_name in central_counties:
                return "Central Division 3"
            else:
                return "Central & East Texas Division"
        
        # Handle Florida counties explicitly
        if state == 'FL':
            ec5_counties = special_county_regions.get("East Central Division 5", {}).get("FL", [])
            if county_name in ec5_counties:
                return "East Central Division 5"
            else:
                return "East Central Division 4"
        
        # Handle Delaware (entire state goes to NEMA Divisional GRP Division 3)
        if state == 'DE':
            return "NEMA Divisional GRP Division 3"
        
        # Handle other states based on default mappings
        return state_to_region.get(state, "Unassigned")
    
    # Apply the region assignment function
    county_data['Region'] = county_data.apply(get_region, axis=1)
    
    # Define function to get MSA info
    def get_msa_info(row):
        county_id = row['STATEFP'] + row['COUNTYFP']
        msa_info = county_to_msa.get(county_id, {})
        cbsafp = msa_info.get('CBSAFP', '')
        cbsa_name = msa_info.get('CBSA_NAME', '')
        return cbsafp, cbsa_name
    
    # Add MSA information to counties
    county_data['CBSAFP'], county_data['CBSA_NAME'] = zip(*county_data.apply(get_msa_info, axis=1))
    county_data['InMSA'] = county_data['CBSAFP'] != ''
    
    # Get virgin and non-virgin MSAs
    try:
        virgin_msas, non_virgin_msas = customer_data_processor.identify_virgin_statistical_areas(msa_data)
        
        # Mark MSAs based on virgin/non-virgin status
        for idx, msa in msa_data.iterrows():
            if msa['CBSAFP'] in virgin_msas:
                msa_data.at[idx, 'IS_VIRGIN'] = True
            if msa['CBSAFP'] in non_virgin_msas:
                msa_data.at[idx, 'HAS_CUSTOMERS'] = True
        
        logger.info(f"Identified {len(virgin_msas)} virgin MSAs and {len(non_virgin_msas)} non-virgin MSAs")
    except Exception as e:
        logger.error(f"Error identifying virgin/non-virgin MSAs: {e}")
        virgin_msas, non_virgin_msas = [], []
    
    # Prepare MSA data with state counts (restore this code)
    # First, make sure necessary columns exist in county_data
    if all(col in county_data.columns for col in ['InMSA', 'CBSAFP', 'STUSPS']):
        # Group counties by MSA to count states
        msa_counties = county_data[county_data['InMSA']]
        if not msa_counties.empty:
            msa_state_counts = msa_counties.groupby('CBSAFP')['STUSPS'].nunique().to_dict()
            
            # Add state count to MSA data
            if 'CBSAFP' in msa_data.columns:
                msa_data['STATE_COUNT'] = msa_data['CBSAFP'].map(lambda x: msa_state_counts.get(x, 0))
    
    return county_data

def create_enhanced_interactive_map(county_data, msa_data, regions):
    # Create figure
    fig = Figure(width=1200, height=800)
    
    # Set map bounds for the United States
    us_bounds = [
        [24.396308, -125.0],  # SW corner
        [49.384358, -66.93457]  # NE corner
    ]

    # Create base map
    m = folium.Map(
        location=[39.8283, -98.5795],  # Center of the US
        zoom_start=4,
        tiles=None,
        max_bounds=True,
        max_zoom=12,
        min_zoom=4,
        control_scale=True,
        bounds=us_bounds
    )

    # Disable world wrapping
    m.options.update({'worldCopyJump': False, 'maxBoundsViscosity': 1.0})
    
    # Add base tile layers
    folium.TileLayer(
        tiles='CartoDB positron',
        name='Light Map',
        control=True,
        show=True,
        attr='CartoDB'
    ).add_to(m)
    
    folium.TileLayer(
        tiles='CartoDB dark_matter',
        name='Dark Map',
        control=True,
        show=False,
        attr='CartoDB'
    ).add_to(m)
    
    folium.TileLayer(
        tiles='OpenStreetMap',
        name='Street Map',
        control=True,
        show=False,
        attr='OpenStreetMap'
    ).add_to(m)
    
    # Get color scheme for regions
    region_colors = {region: data["color"] for region, data in regions.items()}
    
    # Get virgin and non-virgin MSAs
    try:
        virgin_msas, non_virgin_msas = customer_data_processor.identify_virgin_statistical_areas(msa_data)
        
        # Mark MSAs based on virgin/non-virgin status
        for idx, msa in msa_data.iterrows():
            if msa['CBSAFP'] in virgin_msas:
                msa_data.at[idx, 'IS_VIRGIN'] = True
            if msa['CBSAFP'] in non_virgin_msas:
                msa_data.at[idx, 'HAS_CUSTOMERS'] = True
        
        logger.info(f"Identified {len(virgin_msas)} virgin MSAs and {len(non_virgin_msas)} non-virgin MSAs")
    except Exception as e:
        logger.error(f"Error identifying virgin/non-virgin MSAs: {e}")
        virgin_msas, non_virgin_msas = [], []
    
    # Style function for counties
    def style_county(feature):
        properties = feature['properties']
        region = properties.get('Region', 'Unassigned')
        in_msa = properties.get('InMSA', False)
        
        style = {
            'fillColor': region_colors.get(region, '#CCCCCC'),
            'color': '#333333',
            'weight': 0.5,
            'fillOpacity': 0.7
        }
        
        if in_msa:
            style['weight'] = 0.8
            style['color'] = '#444444'
            style['fillOpacity'] = 0.8
        
        return style
    
    # Add states layer (bottom layer)
    """
    states_layer = folium.GeoJson(
        get_states_data(),
        name='State Boundaries',
        show=True,
        style_function=lambda x: {
            'fillColor': 'transparent',
            'color': '#000000',
            'weight': 1.5,
            'fillOpacity': 0,
            'dashArray': '5, 5'
        },
        tooltip=folium.GeoJsonTooltip(
            fields=['NAME'],
            aliases=['State:'],
            localize=True,
            sticky=False,
            labels=True,
            style="background-color: rgba(255, 255, 255, 0.8); border: 2px solid black; border-radius: 3px; box-shadow: 3px 3px 3px rgba(0,0,0,0.3); font-size: 14px; padding: 5px;"
        )
    ).add_to(m)
    """
    
    # Add all counties layer
    try:
        counties_json = county_data.to_json()
        all_counties_layer = folium.GeoJson(
            data=counties_json,
            name='All Counties by Region',
            show=True,
            style_function=style_county,
            tooltip=folium.GeoJsonTooltip(
                fields=['NAME', 'Region', 'STUSPS', 'CBSA_NAME'],
                aliases=['County:', 'Region:', 'State:', 'MSA:'],
                localize=True,
                sticky=False,
                labels=True,
                style="""
                    background-color: rgba(255, 255, 255, 0.8);
                    border: 2px solid gray;
                    border-radius: 3px;
                    box-shadow: 3px 3px 3px rgba(0,0,0,0.3);
                    font-size: 14px;
                    padding: 5px;
                """
            ),
            highlight_function=lambda x: {
                'fillColor': '#FFFF00',
                'color': '#000000',
                'weight': 2,
                'fillOpacity': 0.7
            }
        ).add_to(m)
    except Exception as e:
        print(f"Warning: Could not add counties layer: {e}")
        all_counties_layer = None
    
    # Add Virgin Statistical Areas layer (MSAs with no customers)
    try:
        virgin_msa_data = msa_data[msa_data['IS_VIRGIN'] == True].copy()
        if len(virgin_msa_data) > 0:
            virgin_msa_json = virgin_msa_data.to_json()
            virgin_msa_layer = folium.GeoJson(
                data=virgin_msa_json,
                name='Virgin Statistical Areas',
                show=True,  # Show by default
                style_function=lambda x: {
                    'fillColor': '#FF5733',  # Orange-red
                    'color': '#FF5733',
                    'weight': 2.5,
                    'opacity': 0.8,
                    'fillOpacity': 0.2,
                    'dashArray': '5, 5'
                },
                tooltip=folium.GeoJsonTooltip(
                    fields=['NAME'],
                    aliases=['Virgin Metropolitan Area:'],
                    localize=True,
                    sticky=True,
                    labels=True,
                    style="""
                        background-color: rgba(255, 200, 200, 0.9);
                        border: 2px solid #FF5733;
                        border-radius: 5px;
                        box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
                        font-size: 14px;
                        padding: 8px;
                        min-width: 200px;
                    """
                ),
                highlight_function=lambda x: {
                    'fillColor': '#FFA07A',
                    'color': '#FF5733',
                    'weight': 3,
                    'opacity': 1,
                    'fillOpacity': 0.3,
                }
            ).add_to(m)
            logger.info(f"Added Virgin Statistical Areas layer with {len(virgin_msa_data)} areas")
    except Exception as e:
        logger.error(f"Warning: Could not add Virgin Statistical Areas layer: {e}")
    
    # Add Non-Virgin Statistical Areas layer (MSAs with customers)
    try:
        non_virgin_msa_data = msa_data[msa_data['HAS_CUSTOMERS'] == True].copy()
        if len(non_virgin_msa_data) > 0:
            non_virgin_msa_json = non_virgin_msa_data.to_json()
            non_virgin_msa_layer = folium.GeoJson(
                data=non_virgin_msa_json,
                name='Non-Virgin Statistical Areas',
                show=True,  # Show by default
                style_function=lambda x: {
                    'fillColor': '#33A1FF',  # Bright blue
                    'color': '#33A1FF',
                    'weight': 2.5,
                    'opacity': 0.8,
                    'fillOpacity': 0.2,
                    'dashArray': '5, 5'
                },
                tooltip=folium.GeoJsonTooltip(
                    fields=['NAME'],
                    aliases=['Non-Virgin Metropolitan Area:'],
                    localize=True,
                    sticky=True,
                    labels=True,
                    style="""
                        background-color: rgba(200, 225, 255, 0.9);
                        border: 2px solid #33A1FF;
                        border-radius: 5px;
                        box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
                        font-size: 14px;
                        padding: 8px;
                        min-width: 200px;
                    """
                ),
                highlight_function=lambda x: {
                    'fillColor': '#87CEFA',
                    'color': '#33A1FF',
                    'weight': 3,
                    'opacity': 1,
                    'fillOpacity': 0.3,
                }
            ).add_to(m)
            logger.info(f"Added Non-Virgin Statistical Areas layer with {len(non_virgin_msa_data)} areas")
    except Exception as e:
        logger.error(f"Warning: Could not add Non-Virgin Statistical Areas layer: {e}")
    
    # Add MSA counties layer
    try:
        msa_counties = county_data[county_data['InMSA']]
        if not msa_counties.empty:
            msa_counties_json = msa_counties.to_json()
            msa_counties_layer = folium.GeoJson(
                data=msa_counties_json,
                name='Counties in MSAs',
                show=False,
                style_function=lambda x: {
                    'fillColor': region_colors.get(x['properties']['Region'], '#CCCCCC'),
                    'color': '#3388FF',
                    'weight': 1,
                    'fillOpacity': 0.7,
                    'dashArray': '3, 3'
                },
                tooltip=folium.GeoJsonTooltip(
                    fields=['NAME', 'CBSA_NAME', 'Region', 'STUSPS'],
                    aliases=['County:', 'MSA:', 'Region:', 'State:'],
                    localize=True,
                    sticky=False,
                    labels=True,
                    style="""
                        background-color: rgba(200, 225, 255, 0.9);
                        border: 2px solid gray;
                        border-radius: 3px;
                        box-shadow: 3px 3px 3px rgba(0,0,0,0.3);
                        font-size: 14px;
                        padding: 5px;
                    """
                ),
                highlight_function=lambda x: {
                    'fillColor': '#FFFF00',
                    'color': '#000000',
                    'weight': 2,
                    'fillOpacity': 0.7
                }
            ).add_to(m)
    except Exception as e:
        print(f"Warning: Could not add MSA counties layer: {e}")
    
    # Add region legend
    legend = LegendControl(
        title="US 20-Region Classification",
        color_dict=region_colors,
        position="bottomright"
    )
    m.add_child(legend)
    
    # Add MSA legend
    m.get_root().html.add_child(folium.Element("""
    <div style="position: fixed; bottom: 40px; right: 10px; z-index: 999; 
                background-color: white; padding: 12px; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
        <div style="text-align: center; margin-bottom: 8px; font-weight: bold; font-size: 14px;">Metropolitan Statistical Areas</div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <svg height="18" width="22">
                <rect x="0" y="0" width="22" height="18" style="fill:rgba(255,87,51,0.2);stroke:#FF5733;stroke-width:1" />
            </svg>
            <span style="margin-left: 5px; font-size: 13px;">Virgin MSA (No Customers)</span>
        </div>
        <div style="display: flex; align-items: center;">
            <svg height="18" width="22">
                <rect x="0" y="0" width="22" height="18" style="fill:rgba(51,161,255,0.2);stroke:#33A1FF;stroke-width:1" />
            </svg>
            <span style="margin-left: 5px; font-size: 13px;">Non-Virgin MSA (Has Customers)</span>
        </div>
    </div>
    """))
    
    # Add map controls
    folium.LayerControl(collapsed=False).add_to(m)
    MousePosition().add_to(m)
    Fullscreen().add_to(m)
    
    # Add minimap
    minimap = MiniMap(
        toggle_display=True,
        position='bottomleft',
        tile_layer=folium.TileLayer('CartoDB positron'),
        zoom_level_offset=-5
    )
    m.add_child(minimap)
    
    # Add custom CSS to fix layer control alignment
    m.get_root().html.add_child(folium.Element("""
    <style>
        .leaflet-control-layers {
            clear: both;
            margin-top: 10px !important;
        }
        .leaflet-control-layers-selector {
            margin-right: 5px !important;
            vertical-align: middle !important;
        }
        .leaflet-control-layers-list {
            padding: 5px !important;
        }
        .leaflet-control-layers-base label, 
        .leaflet-control-layers-overlays label {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 5px !important;
        }
        .leaflet-control-layers-selector {
            margin: 0 5px 0 0 !important;
        }
        /* Hide search and export buttons */
        .leaflet-control-search, 
        .leaflet-draw-toolbar,
        .leaflet-draw-section,
        .leaflet-draw,
        .leaflet-draw-actions,
        .leaflet-bar a.leaflet-draw-toolbar-button,
        a.leaflet-draw-draw-polyline,
        a.leaflet-draw-draw-polygon,
        a.leaflet-draw-draw-rectangle,
        a.leaflet-draw-draw-circle,
        a.leaflet-draw-draw-circlemarker,
        a.leaflet-draw-edit-edit,
        a.leaflet-draw-edit-remove,
        a.search-button,
        a.search-expand,
        .leaflet-bar a[title="search locations"],
        .leaflet-bar a[title="Search"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            z-index: -1 !important;
        }
    </style>
    <script>
        // Make sure the filters are clickable and properly aligned
        document.addEventListener('DOMContentLoaded', function() {
            // Remove any remaining search or draw controls that might appear
            function removeControls() {
                var searchControls = document.querySelectorAll('.leaflet-control-search, .search-button, .search-expand, a[title="search locations"], a[title="Search"]');
                var drawControls = document.querySelectorAll('.leaflet-draw-toolbar, .leaflet-draw-section, .leaflet-draw, .leaflet-draw-actions, a.leaflet-draw-toolbar-button');
                
                searchControls.forEach(function(element) {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
                
                drawControls.forEach(function(element) {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
                
                // Also remove export buttons
                var exportButtons = document.querySelectorAll('.export, button:contains("Export"), [title*="export"], [aria-label*="export"]');
                exportButtons.forEach(function(element) {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
                
                // Make sure the layer checkboxes are properly aligned
                var layerCheckboxes = document.querySelectorAll('.leaflet-control-layers-selector');
                layerCheckboxes.forEach(function(checkbox) {
                    checkbox.style.marginRight = '5px';
                    checkbox.style.verticalAlign = 'middle';
                });
            }
            
            // Run immediately and also after a delay to catch dynamically added elements
            removeControls();
            setTimeout(removeControls, 500);
            setTimeout(removeControls, 1000);
            setTimeout(removeControls, 2000);
            
            // Set an observer to catch dynamically added elements
            var observer = new MutationObserver(function(mutations) {
                removeControls();
            });
            
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        });
    </script>
    """))
    
    return m, fig


def main():
    print("Getting county data...")
    county_data = get_county_data()
    
    print("Getting MSA data...")
    msa_data = get_msa_data()
    
    print("Getting MSA-county relationships...")
    county_to_msa, _ = get_county_msa_relationships()
    
    print("Defining regions...")
    regions, ca_regions, special_county_regions, exclude_counties = define_regions()
    
    print("Assigning counties to regions and MSAs...")
    county_data = assign_counties_to_regions_and_msas(county_data, regions, ca_regions, special_county_regions, exclude_counties, county_to_msa)
    
    print("Creating interactive map...")
    m, fig = create_enhanced_interactive_map(county_data, msa_data, regions)
    
    output_file = "us_20regions_map.html"
    print(f"Saving map to {output_file}...")
    m.save(output_file)
    print(f"Map saved to {output_file}")
    
    # Try to apply map interaction script for frontend integration
    try:
        from map_injector import inject_script_into_map
        print("Injecting interaction scripts for frontend compatibility...")
        inject_script_into_map(output_file)
        print("Script injection complete")
    except ImportError:
        print("Warning: map_injector module not found, skipping script injection")
    except Exception as e:
        print(f"Warning: Error during script injection: {str(e)}")
    
    return m, county_data, msa_data, regions

if __name__ == "__main__":
    main()