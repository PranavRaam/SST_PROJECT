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
import copy
import math

# Try to import customer_data_processor for virgin/non-virgin MSA information
try:
    import customer_data_processor
    has_customer_data = True
except ImportError:
    has_customer_data = False
    print("Warning: customer_data_processor module not available, virgin/non-virgin MSA detection disabled")

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
    
    # Check if we have real data for this area in the app's storage
    try:
        from app import real_map_data
        if area_name in real_map_data:
            logger.info(f"Using real data for {area_name} instead of generating mock data")
            area_data = real_map_data[area_name]
            
            # Get area geometry bounds once
            minx, miny, maxx, maxy = target_area_geometry.bounds
            
            # Calculate bounds padding (10% of dimensions)
            pad_x = (maxx - minx) * 0.1
            pad_y = (maxy - miny) * 0.1
            
            # Adjust bounds with padding
            minx += pad_x
            miny += pad_y
            maxx -= pad_x
            maxy -= pad_y
            
            # Pre-generate a set of valid points within the geometry
            # If we have very few markers, position them in a clear pattern around the center
            center_lng, center_lat = target_area_geometry.centroid.x, target_area_geometry.centroid.y
            valid_points = []
            
            total_markers = len(area_data.get('pgs', [])) + len(area_data.get('hhahs', []))
            
            if total_markers <= 5:
                # For very few markers, use a simple pattern around the center
                # Calculations for positions at regular intervals around a small circle
                radius = 0.02  # About 2km in lng/lat units
                markers_count = max(total_markers, 1)  # Ensure at least 1 marker
                for i in range(markers_count):
                    angle = (i / markers_count) * 2 * 3.14159  # Evenly spaced angles in radians
                    # Calculate position on the circle
                    lng = center_lng + radius * np.cos(angle)
                    lat = center_lat + radius * np.sin(angle)
                    
                    # Verify point is within geometry (adjust if needed)
                    point = Point(lng, lat)
                    if target_area_geometry.contains(point):
                        valid_points.append((lat, lng))
                    else:
                        # If point is outside, place at center with small offset
                        valid_points.append((center_lat + 0.005 * np.sin(angle), 
                                            center_lng + 0.005 * np.cos(angle)))
                
                logger.info(f"Created {len(valid_points)} evenly spaced points for marker placement")
            else:
                # For more markers, use random distribution
                attempts = 0
                # Generate up to 50 valid points or until we've tried 200 times
                while len(valid_points) < 50 and attempts < 200:
                    lng = random.uniform(minx, maxx)
                    lat = random.uniform(miny, maxy)
                    point = Point(lng, lat)
                    if target_area_geometry.contains(point):
                        valid_points.append((lat, lng))
                    attempts += 1
                
                logger.info(f"Generated {len(valid_points)} random valid points for marker placement")
            
            logger.info(f"Generated {len(valid_points)} valid points for marker placement")
            
            # Convert real PG data to the expected format - limit to 20 max for performance
            real_pgs = []
            pg_limit = min(len(area_data.get('pgs', [])), 20)
            
            for i, pg in enumerate(area_data.get('pgs', [])[:pg_limit]):
                # Use a pre-generated point if available, otherwise fallback
                if valid_points and i < len(valid_points):
                    lat, lng = valid_points[i]
                else:
                    # Fallback to a simpler approach - just use center with small random offset
                    center_lng, center_lat = target_area_geometry.centroid.x, target_area_geometry.centroid.y
                    lng = center_lng + random.uniform(-0.01, 0.01)
                    lat = center_lat + random.uniform(-0.01, 0.01)
                
                # Create PG data with actual name
                real_pg = {
                    "id": i + 1,
                    "name": pg.get('name', f"PG-{i+1}"),
                    "location": [lat, lng],  # Folium uses [lat, lng] format
                    "group": pg.get('group', "Group A"),
                    "physicians": pg.get('physicians', random.randint(3, 15)),
                    "patients": pg.get('patients', random.randint(50, 300)),
                    "status": pg.get('status', "Active"),
                    "address": pg.get('address', f"{random.randint(100, 999)} Healthcare Ave, {area_name.split(',')[0]}"),
                    "contact": pg.get('contact', f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}")
                }
                real_pgs.append(real_pg)
            
            # Convert real HHAH data to the expected format - limit to 30 max for performance
            real_hhahs = []
            hhah_limit = min(len(area_data.get('hhahs', [])), 30)
            
            for i, hhah in enumerate(area_data.get('hhahs', [])[:hhah_limit]):
                # Use remaining pre-generated points for HHAHs if available
                point_index = i + pg_limit
                if valid_points and point_index < len(valid_points):
                    lat, lng = valid_points[point_index]
                else:
                    # Fallback to a simpler approach - just use center with small random offset
                    center_lng, center_lat = target_area_geometry.centroid.x, target_area_geometry.centroid.y
                    lng = center_lng + random.uniform(-0.01, 0.01)
                    lat = center_lat + random.uniform(-0.01, 0.01)
                
                # Create HHAH data with actual name
                real_hhah = {
                    "id": i + 1,
                    "name": hhah.get('Agency Name', f"HHAH-{i+1}"),
                    "location": [lat, lng],  # Folium uses [lat, lng] format
                    "services": hhah.get('services', random.randint(2, 8)),
                    "patients": hhah.get('patients', random.randint(20, 150)),
                    "status": hhah.get('Agency Type', "Active"),
                    "address": hhah.get('Address', f"{random.randint(100, 999)} Medical Blvd, {area_name.split(',')[0]}"),
                    "contact": hhah.get('Telephone', f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}")
                }
                real_hhahs.append(real_hhah)
            
            logger.info(f"Using real data: {len(real_pgs)} PGs and {len(real_hhahs)} HHAHs")
            return real_pgs, real_hhahs
    except Exception as e:
        logger.error(f"Error using real data, falling back to mock data: {str(e)}")
        # Continue with mock data generation if there's an error
    
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

def spread_markers(markers_data, min_distance=0.004):
    """
    Adjust marker positions to ensure they're not stacked on top of each other
    
    Parameters:
    - markers_data: List of marker data with 'location' field
    - min_distance: Minimum distance between markers in degrees
    
    Returns:
    - Updated markers_data with adjusted locations
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Spreading out {len(markers_data)} markers to avoid overlapping")
    
    if len(markers_data) <= 1:
        return markers_data
    
    # Create a deep copy to avoid modifying the original data
    spread_markers_data = copy.deepcopy(markers_data)
    
    # First, group markers by their locations to identify duplicates
    locations = {}
    for i, marker in enumerate(spread_markers_data):
        # Round location to 5 decimal places for grouping
        key = (round(marker['location'][0], 5), round(marker['location'][1], 5))
        if key not in locations:
            locations[key] = []
        locations[key].append(i)
    
    # Identify locations with multiple markers
    for key, indices in locations.items():
        if len(indices) > 1:
            logger.info(f"Found {len(indices)} markers at location {key}")
            
            # Calculate radius and angle step for spreading
            radius = min_distance
            angle_step = 2 * math.pi / len(indices)
            
            # Place markers in a circle around the original point
            for i, idx in enumerate(indices):
                angle = i * angle_step
                # Apply small offset in a circle around the original point
                orig_lat, orig_lng = key
                new_lat = orig_lat + radius * math.sin(angle)
                new_lng = orig_lng + radius * math.cos(angle)
                
                # Update the marker location
                spread_markers_data[idx]['location'] = [new_lat, new_lng]
    
    logger.info(f"Completed spreading {len(markers_data)} markers")
    return spread_markers_data

def add_pgs_hhahs_to_map(m, pgs_data, hhahs_data, lightweight=False, ultra_lightweight=False, spread_markers_flag=False):
    """Add PGs and HHAHs markers to the map"""
    logger = logging.getLogger(__name__)
    
    # Apply marker spreading if requested
    if spread_markers_flag:
        logger.info("Applying marker spreading to avoid overlapping")
        pgs_data = spread_markers(pgs_data)
        hhahs_data = spread_markers(hhahs_data)
    
    # For ultra_lightweight mode, use extremely simplified markers
    if ultra_lightweight:
        logger.info("Using ultra-lightweight marker rendering for optimized performance")
        
        # Create a feature group for all markers
        all_markers = folium.FeatureGroup(name="All Markers")
        
        # Add all PGs as blue circles
        for pg in pgs_data:
            folium.Circle(
                location=pg['location'],
                radius=300,  # 300 meters
                color='blue',
                fill=True,
                fill_color='blue',
                fill_opacity=0.7,
                popup=pg['name'],
                tooltip=pg['name']
            ).add_to(all_markers)
        
        # Add all HHAHs as green circles
        for hhah in hhahs_data:
            folium.Circle(
                location=hhah['location'],
                radius=300,  # 300 meters
                color='green',
                fill=True,
                fill_color='green',
                fill_opacity=0.7,
                popup=hhah['name'],
                tooltip=hhah['name']
            ).add_to(all_markers)
        
        # Add the feature group to the map
        all_markers.add_to(m)
        
        # Add minimal legend
        legend_colors = {
            "Physician Groups (PGs)": "blue",
            "Home Health At Home (HHAHs)": "green",
            "Statistical Area": "#4F46E5"
        }
        
        legend = LegendControl(
            title="Map Legend",
            color_dict=legend_colors,
            position="bottomright"
        )
        m.add_child(legend)
        
        logger.info(f"Added {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs to map (ultra lightweight mode)")
        return

    # Determine if we should use clustering based on number of markers
    use_clustering = len(pgs_data) + len(hhahs_data) > 15 and not ultra_lightweight
    
    if use_clustering:
        # Use MarkerCluster for better performance with many markers
        from folium.plugins import MarkerCluster
        pg_cluster = MarkerCluster(name="Physician Groups (PGs)")
        hhah_cluster = MarkerCluster(name="Home Health At Home (HHAHs)")
    else:
        # Use regular feature groups for fewer markers
        pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
        hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
    
    # Add PG markers with simplified popups for lightweight mode
    for pg in pgs_data:
        # Create popup with PG details - simpler for lightweight mode
        if lightweight:
            popup_html = f"""
            <div style="min-width: 120px; max-width: 200px;">
                <h4 style="margin: 4px 0; color: #1F2937;">{pg['name']}</h4>
                <p style="margin: 2px 0;"><strong>Status:</strong> {pg['status']}</p>
            </div>
            """
        else:
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
        marker = folium.Marker(
            location=pg['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg['name']}",
            icon=folium.Icon(color='blue', icon="user-md" if not lightweight else "h-square", prefix="fa")
        )
        
        # Add to appropriate group
        if use_clustering:
            marker.add_to(pg_cluster)
        else:
            marker.add_to(pg_group)
    
    # Add HHAH markers with simplified popups for lightweight mode
    for hhah in hhahs_data:
        # Create popup with HHAH details - simpler for lightweight mode
        if lightweight:
            popup_html = f"""
            <div style="min-width: 120px; max-width: 200px;">
                <h4 style="margin: 4px 0; color: #1F2937;">{hhah['name']}</h4>
                <p style="margin: 2px 0;"><strong>Status:</strong> {hhah['status']}</p>
            </div>
            """
        else:
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
        marker = folium.Marker(
            location=hhah['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"HHAH: {hhah['name']}",
            icon=folium.Icon(color='green', icon="home" if not lightweight else "plus-square", prefix="fa")
        )
        
        # Add to appropriate group
        if use_clustering:
            marker.add_to(hhah_cluster)
        else:
            marker.add_to(hhah_group)
    
    # Add the groups to the map
    if use_clustering:
        pg_cluster.add_to(m)
        hhah_cluster.add_to(m)
    else:
        pg_group.add_to(m)
        hhah_group.add_to(m)
        
    logger.info(f"Added {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs to map{' using clustering' if use_clustering else ''}")
    
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

def generate_exact_markers(area_name, geometry, marker_type, count, spread=True):
    """Generate exactly count markers of given type with precise positioning
    
    Args:
        area_name: Name of the statistical area 
        geometry: The geometry of the area (shapely object)
        marker_type: Type of marker ('pg' or 'hhah')
        count: Number of markers to generate
        spread: Whether to spread markers around the centroid
        
    Returns:
        List of marker data objects positioned within the area
    """
    markers = []
    logger = logging.getLogger(__name__)
    logger.info(f"Generating exactly {count} {marker_type.upper()} markers for {area_name}")
    
    # Get area centroid for consistent positioning
    center = geometry.centroid
    
    # For a single marker, place it exactly at the center
    if count == 1:
        return [{
            "id": 1,
            "name": f"{marker_type.upper()}-1",
            "location": [center.y, center.x],  # [lat, lng]
            "group": "Group A" if marker_type == 'pg' else "Agency",
            "physicians": random.randint(3, 15) if marker_type == 'pg' else None,
            "patients": random.randint(50, 300),
            "status": "Active",
            "address": f"{random.randint(100, 999)} {'Healthcare Ave' if marker_type == 'pg' else 'Medical Blvd'}, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }]
    
    # For multiple markers, place them in a pattern around center
    radius = 0.01  # approx 1km in lng/lat units
    for i in range(count):
        angle = (i / count) * 2 * math.pi
        lng = center.x + radius * math.cos(angle)
        lat = center.y + radius * math.sin(angle)
        
        # Ensure the point is within the geometry
        point = Point(lng, lat)
        if not geometry.contains(point):
            # Move point closer to center if outside the geometry
            lng = center.x + (radius * 0.5) * math.cos(angle)
            lat = center.y + (radius * 0.5) * math.sin(angle)
        
        markers.append({
            "id": i + 1,
            "name": f"{marker_type.upper()}-{i+1}",
            "location": [lat, lng],
            "group": f"Group {chr(65 + (i % 4))}" if marker_type == 'pg' else "Agency",
            "physicians": random.randint(3, 15) if marker_type == 'pg' else None,
            "services": random.randint(2, 8) if marker_type == 'hhah' else None,
            "patients": random.randint(50, 300),
            "status": "Active",
            "address": f"{random.randint(100, 999)} {'Healthcare Ave' if marker_type == 'pg' else 'Medical Blvd'}, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        })
    
    return markers

def generate_statistical_area_map(area_name, zoom=9, exact_boundary=True, detailed=True, use_cached=True, force_regen=False, lightweight=False, ultra_lightweight=False, spread_markers=False, clear_mock_markers=False, use_exact_count=False, display_pgs=True, display_hhahs=True, pg_count=0, hhah_count=0, marker_source=None, spread_distance=None):
    """Generate a map for a statistical area with PG and HHAH markers"""
    logger = logging.getLogger(__name__)
    logger.info(f"Generating map for {area_name} with pg_count={pg_count}, hhah_count={hhah_count}")
    
    # Ensure cache directory exists
    cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
    os.makedirs(cache_dir, exist_ok=True)
    
    # Create cache filename based on parameters
    cache_params = f"{area_name}_{'lightweight' if lightweight else 'detailed'}"
    if marker_source:
        cache_params += f"_{marker_source}"
    cache_params += f"_pg{pg_count}_hhah{hhah_count}"
    
    cache_path = os.path.join(cache_dir, f"statistical_area_{cache_params.replace(' ', '_').replace(',', '').replace('-', '_')}.html")
    
    # Check cache unless force regeneration is requested
    if use_cached and not force_regen and os.path.exists(cache_path):
        logger.info(f"Using cached map from {cache_path}")
        return cache_path
    
    # Load necessary data
    try:
        data_load_start = time.time()
        logger.info("Loading map data...")
        msa_data, county_data, states_data, county_to_msa = get_processed_data()
        data_load_time = time.time() - data_load_start
        logger.info(f"Data loaded in {data_load_time:.2f} seconds")
        
        if msa_data is None or len(msa_data) == 0:
            logger.error("Failed to load MSA data or MSA data is empty")
            return create_fallback_map(area_name, cache_path)
        
        # Find target area
        target_area = find_target_area(area_name, msa_data)
        if target_area is None:
            logger.error(f"Could not find any matching MSA for: {area_name}")
            return create_fallback_map(area_name, cache_path)
        
        # Verify geometry
        if not hasattr(target_area, 'geometry') or target_area.geometry is None:
            logger.error(f"No geometry data for MSA: {target_area['NAME']}")
            return create_fallback_map(area_name, cache_path)
        
        # Get centroid and bounds
        center_lng, center_lat = target_area.geometry.centroid.x, target_area.geometry.centroid.y
        
        # Initialize marker data
        pgs_data = []
        hhahs_data = []
        
        # Try to use real data first
        from app import real_map_data
        real_data_available = False
        
        if real_map_data and area_name in real_map_data:
            logger.info(f"Using real data for {area_name}")
            area_data = real_map_data[area_name]
            
            # Use exact counts if provided, otherwise use real data counts
            pg_limit = pg_count if use_exact_count and pg_count > 0 else len(area_data.get('pgs', []))
            hhah_limit = hhah_count if use_exact_count and hhah_count > 0 else len(area_data.get('hhahs', []))
            
            # Generate valid points for markers
            valid_points = generate_valid_points(target_area.geometry, max(pg_limit, hhah_limit))
            
            # Add PG markers
            if display_pgs:
                for i, pg in enumerate(area_data.get('pgs', [])[:pg_limit]):
                    if valid_points and i < len(valid_points):
                        lat, lng = valid_points[i]
                    else:
                        lat, lng = generate_random_point_in_area(target_area.geometry)
                    
                    pg_data = {
                        "id": i + 1,
                        "name": pg.get('name', f"PG-{i+1}"),
                        "location": [lat, lng],
                        "group": pg.get('group', 'Primary Provider'),
                        "physicians": pg.get('physicians', 5),
                        "patients": pg.get('patients', 75),
                        "status": pg.get('status', 'Active'),
                        "address": pg.get('address', f"Address unavailable"),
                        "contact": pg.get('contact', "Contact unavailable")
                    }
                    pgs_data.append(pg_data)
            
            # Add HHAH markers
            if display_hhahs:
                for i, hhah in enumerate(area_data.get('hhahs', [])[:hhah_limit]):
                    point_index = i + pg_limit if display_pgs else i
                    if valid_points and point_index < len(valid_points):
                        lat, lng = valid_points[point_index]
                    else:
                        lat, lng = generate_random_point_in_area(target_area.geometry)
                    
                    hhah_data = {
                        "id": i + 1,
                        "name": hhah.get('name', f"HHAH-{i+1}"),
                        "location": [lat, lng],
                        "services": hhah.get('services', 3),
                        "patients": hhah.get('patients', 50),
                        "status": hhah.get('status', 'Active'),
                        "address": hhah.get('address', f"Address unavailable"),
                        "contact": hhah.get('contact', "Contact unavailable")
                    }
                    hhahs_data.append(hhah_data)
            
            real_data_available = True
            logger.info(f"Added {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs from real data")
        
        # If no real data or not enough markers, generate mock data
        if not real_data_available or (display_pgs and pg_count > 0 and len(pgs_data) < pg_count):
            remaining_pgs = pg_count - len(pgs_data)
            if remaining_pgs > 0:
                logger.info(f"Generating {remaining_pgs} mock PG markers for {area_name}")
                mock_pgs = generate_exact_markers(area_name, target_area.geometry, 'pg', remaining_pgs, spread=spread_markers)
                pgs_data.extend(mock_pgs)
        
        if not real_data_available or (display_hhahs and hhah_count > 0 and len(hhahs_data) < hhah_count):
            remaining_hhahs = hhah_count - len(hhahs_data)
            if remaining_hhahs > 0:
                logger.info(f"Generating {remaining_hhahs} mock HHAH markers for {area_name}")
                mock_hhahs = generate_exact_markers(area_name, target_area.geometry, 'hhah', remaining_hhahs, spread=spread_markers)
                hhahs_data.extend(mock_hhahs)
        
        # Create the map
        figure = Figure(width=800, height=600)
        m = folium.Map(
            location=[center_lat, center_lng],
            zoom_start=zoom,
            tiles='cartodbpositron',
            control_scale=True,
            prefer_canvas=True
        )
        figure.add_child(m)
        
        # Add MSA boundary
        folium.GeoJson(
            target_area.geometry.__geo_interface__,
            name='Statistical Area',
            style_function=lambda x: {
                'fillColor': '#4F46E5',
                'color': '#312E81',
                'weight': 2,
                'fillOpacity': 0.1
            },
            tooltip=f"<div style='font-weight:bold;'>{area_name}</div>"
        ).add_to(m)
        
        # Add markers to the map
        add_pgs_hhahs_to_map(m, pgs_data, hhahs_data, lightweight=lightweight, ultra_lightweight=ultra_lightweight)
        
        # Add fullscreen control
        Fullscreen(
            position='topleft',
            title='View Fullscreen',
            title_cancel='Exit Fullscreen',
            force_separate_button=True
        ).add_to(m)
        
        # Add scale
        folium.plugins.MeasureControl(
            position='bottomleft',
            primary_length_unit='meters',
            secondary_length_unit='kilometers'
        ).add_to(m)
        
        # Add title box
        title_html = f'''
            <div style="position: fixed; 
                        top: 10px; left: 50px; width: 300px; height: auto;
                        background-color: white; border-radius: 8px;
                        border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                        font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                <h4 style="margin-top: 0; color: #1F2937;">{area_name}</h4>
                <p style="font-size: 12px; margin-bottom: 0;">
                    PGs: {len(pgs_data)} | HHAHs: {len(hhahs_data)}
                </p>
                <p style="font-size: 12px; margin-bottom: 0;">
                    <i>Click markers to view details</i>
                </p>
            </div>
        '''
        m.get_root().html.add_child(folium.Element(title_html))
        
        # Save map to cache
        m.save(cache_path)
        logger.info(f"Saved map to cache: {cache_path}")
        
        return cache_path
        
    except Exception as e:
        logger.error(f"Error generating map: {str(e)}")
        logger.error(traceback.format_exc())
        return create_fallback_map(area_name, cache_path)

def generate_random_point_in_area(geometry):
    """Generate a random point within the given geometry"""
    minx, miny, maxx, maxy = geometry.bounds
    while True:
        lng = random.uniform(minx + (maxx - minx) * 0.1, maxx - (maxx - minx) * 0.1)
        lat = random.uniform(miny + (maxy - miny) * 0.1, maxy - (maxy - miny) * 0.1)
        point = Point(lng, lat)
        if geometry.contains(point):
            return lat, lng

def generate_valid_points(geometry, count):
    """Generate a list of valid points within the geometry"""
    points = []
    max_attempts = count * 10
    attempts = 0
    
    while len(points) < count and attempts < max_attempts:
        lat, lng = generate_random_point_in_area(geometry)
        # Ensure minimum distance between points
        if not points or all(haversine((lat, lng), (p[0], p[1])) > 0.005 for p in points):
            points.append((lat, lng))
        attempts += 1
    
    return points

def find_target_area(area_name, msa_data):
    """Find the target area in the MSA data"""
    normalized_area_name = area_name.lower().strip()
    msa_data['normalized_name'] = msa_data['NAME'].str.lower().str.strip()
    
    # Try exact match
    exact_matches = msa_data[msa_data['normalized_name'] == normalized_area_name]
    if not exact_matches.empty:
        return exact_matches.iloc[0]
    
    # Try matching main city name
    city_name = normalized_area_name.split(',')[0].split('-')[0].strip()
    city_matches = msa_data[msa_data['normalized_name'].str.startswith(city_name + ',', na=False)]
    if not city_matches.empty:
        return city_matches.iloc[0]
    
    # Try fuzzy match
    city_matches = msa_data[msa_data['normalized_name'].str.contains(f"^{city_name}", regex=True, case=False, na=False)]
    if not city_matches.empty:
        return city_matches.iloc[0]
    
    # Try partial match
    partial_matches = msa_data[msa_data['normalized_name'].str.contains(normalized_area_name, case=False, na=False)]
    if not partial_matches.empty:
        return partial_matches.iloc[0]
    
    return None 