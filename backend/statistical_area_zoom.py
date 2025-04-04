import folium
import geopandas as gpd
import numpy as np
import os
import tempfile
import random
from branca.element import Figure, MacroElement
from jinja2 import Template
import main  # Import the main module to reuse existing functions
import logging
import traceback
from folium import plugins
from folium.plugins import MousePosition, Draw, Fullscreen, MiniMap, Search
from branca.element import Figure, JavascriptLink, CssLink
from shapely.geometry import shape, Point
from functools import lru_cache
import time
from data_preloader import get_cached_msa_data, get_cached_county_data, get_cached_states_data, get_cached_county_msa_relationships, get_all_cached_data
import sys

# Configure logging to output to console and file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('statistical_area_zoom.log')
    ]
)
logger = logging.getLogger(__name__)

# Create a subclass of MacroElement to add legend to map
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

# Define a simple function to get coordinates for well-known cities
def get_coordinates_for_area(area_name):
    """Get coordinates for well-known areas"""
    # Dictionary of known city coordinates
    area_coordinates = {
        "New York": [40.7128, -74.0060],
        "Los Angeles": [34.0522, -118.2437],
        "Chicago": [41.8781, -87.6298],
        "Houston": [29.7604, -95.3698],
        "Phoenix": [33.4484, -112.0740],
        "Philadelphia": [39.9526, -75.1652],
        "San Antonio": [29.4241, -98.4936],
        "San Diego": [32.7157, -117.1611],
        "Dallas": [32.7767, -96.7970],
        "San Francisco": [37.7749, -122.4194],
        "Austin": [30.2672, -97.7431],
        "Seattle": [47.6062, -122.3321],
        "Denver": [39.7392, -104.9903],
        "Boston": [42.3601, -71.0589],
        "Las Vegas": [36.1699, -115.1398],
        "Portland": [45.5051, -122.6750],
        "Miami": [25.7617, -80.1918],
        "Atlanta": [33.7490, -84.3880],
        "Tampa": [27.9506, -82.4572],
        "Orlando": [28.5383, -81.3792],
        "Gainesville": [29.6516, -82.3248],
        "Lakeland": [28.0395, -81.9498],
        "Fort Myers": [26.6406, -81.8723],
        "Cape Coral": [26.5629, -81.9495],
        "Homosassa Springs": [28.7999, -82.5773],
        "The Villages": [28.9005, -82.0100],
        "Villages": [28.9005, -82.0100]
    }
    
    # Normalize the area name for searching
    normalized_area = area_name.lower()
    
    # Try to find an exact match first
    for city, coords in area_coordinates.items():
        if city.lower() in normalized_area:
            return coords
    
    # For Florida cities, default to central Florida if not found
    if "fl" in normalized_area or "florida" in normalized_area:
        return [28.0000, -82.4800]  # Central Florida
    
    # Default to US center
    return [39.8283, -98.5795]

def create_fallback_map(area_name, output_path=None, use_alternative_loading=False):
    """Create a fallback map for a specific area"""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Creating fallback map for {area_name} at {output_path}")
        title = f"Statistical Area: {area_name}"
        
        # Try to get coordinates for well-known cities
        coords = get_coordinates_for_area(area_name)
        
        # Set appropriate zoom level
        if coords[0] == 39.8283 and coords[1] == -98.5795:  # If using US center coordinates
            zoom_level = 4
            title = f"Statistical Area: {area_name} (Approximate Location)"
        else:
            zoom_level = 9
        
        # Create a simple map
        folium_map = folium.Map(
            location=coords,
            zoom_start=zoom_level,
            tiles='cartodbpositron'
        )
        
        # Add marker for the center
        folium.Marker(
            coords,
            popup=title,
            icon=folium.Icon(color='blue')
        ).add_to(folium_map)
        
        # Add a circle to represent the general area
        circle = folium.Circle(
            location=coords,
            radius=20000,  # 20km radius
            color='#4F46E5',
            fill=True,
            fill_color='#4F46E5',
            fill_opacity=0.2,
            weight=3,
            opacity=0.9
        ).add_to(folium_map)
        
        # Add a simple title box
        title_html = f'''
            <div style="position: fixed; 
                        top: 10px; left: 50px; width: 300px; height: auto;
                        background-color: white; border-radius: 8px;
                        border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                        font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                <h4 style="margin-top: 0; color: #1F2937;">{title}</h4>
                <p style="font-size: 12px; margin-bottom: 0;">
                    This is a simplified view of the {area_name} area.
                </p>
                <p style="font-size: 12px; margin-bottom: 0;">
                    This static map is shown when the interactive map cannot be loaded.
                </p>
            </div>
        '''
        folium_map.get_root().html.add_child(folium.Element(title_html))
        
        # Make sure the output path exists
        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            folium_map.save(output_path)
            logger.info(f"Fallback map saved to {output_path}")
            return output_path
        else:
            # If no output path, return HTML
            return folium_map._repr_html_()
    except Exception as e:
        logger.error(f"Error creating fallback map: {str(e)}")
        return None

# Cache directory setup
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# Cache for processed data
@lru_cache(maxsize=1)
def get_processed_data():
    """Cache the processed MSA, county, and state data"""
    logger = logging.getLogger(__name__)
    try:
        logger.info("Loading data from cache...")
        # Use the new cached data functions
        msa_data, county_data, states_data, county_to_msa = get_all_cached_data()
        
        if msa_data is None or len(msa_data) == 0:
            logger.error("No MSA data found in cache!")
            return None, None, None, {}
            
        logger.info(f"Loaded MSA data with {len(msa_data)} entries")
        logger.info(f"Sample MSA names: {', '.join(msa_data['NAME'].head().tolist())}")
        
        return msa_data, county_data, states_data, county_to_msa
    except Exception as e:
        logger.error(f"Error loading data from cache: {str(e)}")
        logger.error(traceback.format_exc())
        
        logger.info("Falling back to direct data loading...")
        try:
            # Fall back to main module functions as before
            msa_data = main.get_msa_data()
            county_data = main.get_county_data()
            states_data = main.get_states_data()
            county_to_msa, _ = main.get_county_msa_relationships()
            
            # Pre-process and simplify geometries
            logger.info("Pre-processing and simplifying geometries...")
            if 'geometry' not in msa_data.columns:
                logger.error("No geometry column found in MSA data!")
                return None, None, None, {}
                
            # Use different simplification levels based on geometry complexity
            msa_data['geometry'] = msa_data.geometry.simplify(0.01)
            county_data['geometry'] = county_data.geometry.simplify(0.01)
            # Use less simplification for states to preserve coastal boundaries
            states_data['geometry'] = states_data.geometry.simplify(0.001)
            
            return msa_data, county_data, states_data, county_to_msa
        except Exception as nested_e:
            logger.error(f"Error in fallback data loading: {str(nested_e)}")
            return None, None, None, {}

def generate_mock_pgs_hhahs(area_name, target_area_geometry, num_pgs=5, num_hhahs=7):
    """Generate mock PGs and HHAHs for the given statistical area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Generating mock PGs and HHAHs for {area_name}")
    
    # Get the bounds of the area geometry
    minx, miny, maxx, maxy = target_area_geometry.bounds
    
    # PG Groups to be used in mock data
    pg_groups = ["Group A", "Group B", "Group C", "Group D"]
    
    # Mock PGs data
    pgs_data = []
    
    for i in range(num_pgs):
        # Generate random point within the area bounds
        while True:
            # Add some random variation to ensure points are within the area
            lng = random.uniform(minx + (maxx - minx) * 0.1, maxx - (maxx - minx) * 0.1)
            lat = random.uniform(miny + (maxy - miny) * 0.1, maxy - (maxy - miny) * 0.1)
            point = Point(lng, lat)
            
            # Only use points that are within the geometry
            if target_area_geometry.contains(point):
                break
        
        pg_data = {
            "id": i + 1,
            "name": f"PG-{pg_groups[i % len(pg_groups)]}-{area_name[:3]}{i+1}",
            "location": [lat, lng],  # Folium uses [lat, lng] format
            "group": pg_groups[i % len(pg_groups)],
            "physicians": random.randint(3, 15),
            "patients": random.randint(50, 300),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Healthcare Ave, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        pgs_data.append(pg_data)
    
    # Mock HHAHs data
    hhahs_data = []
    
    hhah_name_prefixes = ["HomeHealth", "CaringHands", "ComfortCare", "Elite", "Premier", "Wellness", "Guardian"]
    hhah_name_suffixes = ["Services", "Agency", "Associates", "Partners", "Network", "Group", "Care"]
    
    for i in range(num_hhahs):
        # Generate random point within the area bounds
        while True:
            lng = random.uniform(minx + (maxx - minx) * 0.1, maxx - (maxx - minx) * 0.1)
            lat = random.uniform(miny + (maxy - miny) * 0.1, maxy - (maxy - miny) * 0.1)
            point = Point(lng, lat)
            
            # Only use points that are within the geometry
            if target_area_geometry.contains(point):
                break
        
        prefix = random.choice(hhah_name_prefixes)
        suffix = random.choice(hhah_name_suffixes)
        
        hhah_data = {
            "id": i + 1,
            "name": f"{prefix} {suffix}",
            "location": [lat, lng],  # Folium uses [lat, lng] format
            "services": random.randint(2, 8),
            "patients": random.randint(20, 150),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Medical Blvd, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        hhahs_data.append(hhah_data)
    
    logger.info(f"Generated {len(pgs_data)} mock PGs and {len(hhahs_data)} mock HHAHs")
    return pgs_data, hhahs_data

def add_pgs_hhahs_to_map(m, pgs_data, hhahs_data):
    """Add PGs and HHAHs markers to the map"""
    logger = logging.getLogger(__name__)
    
    # Create a feature group for PGs
    pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
    
    # Add PG markers
    for pg in pgs_data:
        # Create popup with PG details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{pg['name']}</h4>
            <p style="margin: 4px 0;"><strong>Group:</strong> {pg['group']}</p>
            <p style="margin: 4px 0;"><strong>Physicians:</strong> {pg['physicians']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {pg['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {pg['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {pg['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {pg['contact']}</p>
        </div>
        """
        
        # Always use blue for PGs for better distinction
        folium.Marker(
            location=pg['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg['name']}",
            icon=folium.Icon(color='blue', icon="user-md", prefix="fa")
        ).add_to(pg_group)
    
    # Add the PG group to the map
    pg_group.add_to(m)
    
    # Create a feature group for HHAHs
    hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
    
    # Add HHAH markers
    for hhah in hhahs_data:
        # Create popup with HHAH details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{hhah['name']}</h4>
            <p style="margin: 4px 0;"><strong>Services:</strong> {hhah['services']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {hhah['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {hhah['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {hhah['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {hhah['contact']}</p>
        </div>
        """
        
        # Always use green for HHAHs for better distinction
        folium.Marker(
            location=hhah['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"HHAH: {hhah['name']}",
            icon=folium.Icon(color='green', icon="home", prefix="fa")
        ).add_to(hhah_group)
    
    # Add the HHAH group to the map
    hhah_group.add_to(m)
    logger.info("Added PGs and HHAHs to map")
    
    # Add legend for PGs and HHAHs
    legend_colors = {
        "Physician Groups (PGs)": "blue",
        "Home Health At Home (HHAHs)": "green",
        "Metro Area": "#4F46E5"
    }
    
    legend = LegendControl(
        title="Map Legend",
        color_dict=legend_colors,
        position="bottomright"
    )
    m.add_child(legend)

def generate_statistical_area_map(area_name, zoom=9, exact_boundary=True, detailed=True, use_cached=True, force_regen=False, lightweight=False):
    """
    Generate a map zoomed in on a specific statistical area (MSA)
    
    Parameters:
    - area_name: Name of the statistical area/MSA
    - zoom: Initial zoom level (default: 9)
    - exact_boundary: Whether to show exact boundaries (default: True)
    - detailed: Whether to show detailed features (default: True)
    - use_cached: Whether to use cached maps if available (default: True) 
    - force_regen: Whether to force regeneration of the map (default: False)
    - lightweight: Whether to generate a lightweight version for faster loading (default: False)
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info(f"Generating map for statistical area: {area_name} with params: zoom={zoom}, exact_boundary={exact_boundary}, detailed={detailed}, use_cached={use_cached}, force_regen={force_regen}, lightweight={lightweight}")
    start_time = time.time()
    
    # Generate cache filename
    cache_file = os.path.join(CACHE_DIR, f"statistical_area_{area_name.replace(' ', '_').replace(',', '').replace('-', '_')}.html")
    
    # Add suffix for lightweight version
    if lightweight:
        cache_file = cache_file.replace('.html', '_lightweight.html')
    
    logger.info(f"Cache file path: {cache_file}")
    
    # Check cache first if use_cached is True and force_regen is False
    if use_cached and not force_regen and os.path.exists(cache_file):
        file_age = time.time() - os.path.getmtime(cache_file)
        # Use cache if file exists and is less than 24 hours old
        if file_age < 86400:  # 24 hours in seconds
            logger.info(f"Using cached map from {cache_file} (age: {file_age/3600:.1f} hours)")
            elapsed_time = time.time() - start_time
            logger.info(f"Map retrieval completed in {elapsed_time:.2f} seconds (from cache)")
            return cache_file
        else:
            logger.info(f"Cached map is {file_age/3600:.1f} hours old, regenerating...")
    
    # Get pre-processed data
    data_load_start = time.time()
    logger.info("Loading map data...")
    msa_data, county_data, states_data, county_to_msa = get_processed_data()
    data_load_time = time.time() - data_load_start
    logger.info(f"Data loaded in {data_load_time:.2f} seconds")
    
    if msa_data is None or len(msa_data) == 0:
        logger.error("Failed to load MSA data or MSA data is empty")
        return create_fallback_map(area_name, cache_file)
    
    try:
        # Normalize the area name for comparison
        normalized_area_name = area_name.lower().strip()
        logger.info(f"Normalized area name: {normalized_area_name}")
        
        # Create normalized versions of MSA names
        msa_data['normalized_name'] = msa_data['NAME'].str.lower().str.strip()
        
        # Try exact match first
        target_area = None
        exact_matches = msa_data[msa_data['normalized_name'] == normalized_area_name]
        if not exact_matches.empty:
            target_area = exact_matches.iloc[0]
            logger.info(f"Found exact match: {target_area['NAME']}")
        
        # If no exact match, try matching main city name
        if target_area is None:
            city_name = normalized_area_name.split(',')[0].split('-')[0].strip()
            logger.info(f"Trying to match city name: {city_name}")
            
            # Try exact city match first
            city_matches = msa_data[msa_data['normalized_name'].str.startswith(city_name + ',', na=False)]
            if not city_matches.empty:
                target_area = city_matches.iloc[0]
                logger.info(f"Found exact city match: {target_area['NAME']}")
            else:
                # Try fuzzy city match
                city_matches = msa_data[msa_data['normalized_name'].str.contains(f"^{city_name}", regex=True, case=False, na=False)]
                if not city_matches.empty:
                    target_area = city_matches.iloc[0]
                    logger.info(f"Found fuzzy city match: {target_area['NAME']}")
        
        # If still no match, try partial match
        if target_area is None:
            partial_matches = msa_data[msa_data['normalized_name'].str.contains(normalized_area_name, case=False, na=False)]
            if not partial_matches.empty:
                target_area = partial_matches.iloc[0]
                logger.info(f"Found partial match: {target_area['NAME']}")
        
        if target_area is None:
            logger.error(f"Could not find any matching MSA for: {area_name}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Verify geometry
        logger.info(f"Validating geometry...")
        if not hasattr(target_area, 'geometry') or target_area.geometry is None:
            logger.error(f"No geometry data for MSA: {target_area['NAME']}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Validate and fix geometry if needed
        logger.info("Validating geometry...")
        if not target_area.geometry.is_valid:
            try:
                logger.info("Attempting to fix invalid geometry...")
                target_area.geometry = target_area.geometry.buffer(0)
                if not target_area.geometry.is_valid:
                    logger.error("Failed to fix invalid geometry")
                    fallback_file = create_fallback_map(area_name, cache_file)
                    logger.info(f"Created fallback map at: {fallback_file}")
                    return fallback_file
            except Exception as e:
                logger.error(f"Error fixing geometry: {str(e)}")
                fallback_file = create_fallback_map(area_name, cache_file)
                logger.info(f"Created fallback map at: {fallback_file}")
                return fallback_file
        
        # Get centroid and bounds
        try:
            center_lng, center_lat = target_area.geometry.centroid.x, target_area.geometry.centroid.y
            min_x, min_y, max_x, max_y = target_area.geometry.bounds
            
            # Generate mock PGs and HHAHs data for this statistical area
            logger.info(f"Generating mock PGs and HHAHs for {area_name}")
            pgs_data, hhahs_data = generate_mock_pgs_hhahs(area_name, target_area.geometry)
            logger.info(f"Generated {len(pgs_data)} mock PGs and {len(hhahs_data)} mock HHAHs")
            
            logger.info(f"Center: {center_lat}, {center_lng}")
            logger.info(f"Bounds: {min_x}, {min_y}, {max_x}, {max_y}")
        except Exception as e:
            logger.error(f"Error calculating centroid or bounds: {str(e)}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Create base map with error handling
        try:
            m = folium.Map(
                location=[center_lat, center_lng],
                zoom_start=zoom,
                tiles='cartodbpositron',
                prefer_canvas=True,
                control_scale=True
            )
        except Exception as e:
            logger.error(f"Error creating base map: {str(e)}")
            return create_fallback_map(area_name, cache_file)
        
        # Add state boundaries with error handling
        try:
            style_function = lambda x: {
                'fillColor': '#f5f5f5',
                'color': '#6b7280',
                'weight': 1,
                'fillOpacity': 0.1
            }
            
            highlight_function = lambda x: {
                'fillColor': '#f5f5f5',
                'color': '#4b5563', 
                'weight': 2,
                'fillOpacity': 0.2
            }
            
            state_popup = folium.GeoJsonPopup(
                fields=['NAME'],
                aliases=['State:'],
                localize=True,
                labels=True
            )
            
            # Add the state boundaries from GeoPandas directly
            states_layer = folium.GeoJson(
                states_data,
                name='State Boundaries',
                style_function=style_function,
                highlight_function=highlight_function,
                tooltip=folium.GeoJsonTooltip(fields=['NAME'], aliases=['State:'], sticky=False),
                popup=state_popup,
                show=True
            )
            states_layer.add_to(m)
            
        except Exception as e:
            logger.error(f"Error adding state boundaries: {str(e)}")
            # Continue without states
        
        # Add MSA boundary (simpler style for lightweight version)
        style_params = {
            'fillColor': '#4F46E5',
            'color': '#312E81',
            'weight': 3 if not lightweight else 2,
            'fillOpacity': 0.2 if not lightweight else 0.15,
            'opacity': 0.9 if not lightweight else 0.8
        }
        
        folium.GeoJson(
            target_area.geometry.__geo_interface__,
            style_function=lambda x: style_params,
            name=f"{target_area['NAME']} Boundary"
        ).add_to(m)
        
        # Add PGs and HHAHs to the map - use simplified markers for lightweight version
        if lightweight:
            # Simplified markers for lightweight version
            for i, pg in enumerate(pgs_data):
                folium.Marker(
                    location=pg['location'],
                    popup=f"PG: {pg['name']}",
                    tooltip=f"PG: {pg['name']}",
                    icon=folium.Icon(color='blue', icon='hospital', prefix='fa')
                ).add_to(m)
            
            for i, hhah in enumerate(hhahs_data):
                folium.Marker(
                    location=hhah['location'],
                    popup=f"HHAH: {hhah['name']}",
                    tooltip=f"HHAH: {hhah['name']}",
                    icon=folium.Icon(color='green', icon='home', prefix='fa')
                ).add_to(m)
        else:
            # Detailed markers for full version
            add_pgs_hhahs_to_map(m, pgs_data, hhahs_data)
        
        # Add essential controls - minimal for lightweight
        if not lightweight:
            folium.plugins.Fullscreen().add_to(m)
            folium.plugins.MousePosition().add_to(m)
        folium.LayerControl().add_to(m)
        
        # Set bounds
        m.fit_bounds([[min_y, min_x], [max_y, max_x]])
        
        # Add title - simpler version for lightweight
        title_html = f'''
            <div style="position: fixed; 
                        top: 10px; left: 50px; width: 300px; height: auto;
                        background-color: white; border-radius: 8px;
                        border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                        font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                <h4 style="margin-top: 0; color: #1F2937;">Map View of {target_area['NAME']}</h4>
                <p style="font-size: 12px; margin-bottom: 0;">
                    Showing {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs in this area.
                </p>
            </div>
        '''
        m.get_root().html.add_child(folium.Element(title_html))
        
        # Add safe script for cross-origin communication - simplified for lightweight
        safe_script = """
        <script>
        // Safe cross-origin communication
        document.addEventListener('DOMContentLoaded', function() {
            // Notify parent when map is loaded
            setTimeout(function() {
                try {
                    console.log('Map loaded, sending message to parent');
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                    }
                } catch (e) {
                    console.error('Error in cross-origin communication:', e);
                }
            }, 500);
        });
        </script>
        """
        m.get_root().html.add_child(folium.Element(safe_script))
        
        # Ensure the cache directory exists
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        
        # Save the map
        m.save(cache_file)
        logger.info(f"Map saved to {cache_file}")
        
        return cache_file
        
    except Exception as e:
        logger.error(f"Error generating map: {str(e)}")
        fallback_file = create_fallback_map(area_name, cache_file)
        logger.info(f"Created fallback map at: {fallback_file}")
        return fallback_file 