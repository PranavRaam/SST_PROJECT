from flask import Flask, jsonify, send_file, request, Response
from flask_cors import CORS
import os
import main
import threading
import time
import urllib.parse
import logging
import sys
from statistical_area_zoom import generate_statistical_area_map
import re
import data_preloader
import gzip
import functools
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = Flask(__name__)

# Get CORS settings from environment
cors_origins = os.environ.get('CORS_ORIGINS', 'https://sst-frontend-swart.vercel.app,http://localhost:3000,https://sst-project.onrender.com,https://sst-project-kappa.vercel.app,https://sst-project-kappa.vercel.app').split(',')
cors_origins.extend(['https://sst-project-kappa.vercel.app', 'https://sst-project-git-main-vivnovation.vercel.app', 'https://sst-project-kappa-git-main-vivnovation.vercel.app', 'https://sst-project.vercel.app'])
logger_level = os.environ.get('LOGGER_LEVEL', 'INFO')

# Enable CORS with specific options for production
CORS(app, 
    resources={r"/api/*": {
        "origins": cors_origins,  # Use the specific origins from environment variable
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "expose_headers": ["Content-Type", "Content-Length", "Content-Disposition", "X-Frame-Options"],
        "max_age": 86400  # Cache preflight requests for 24 hours
    }}
)

# Set up logging to console and file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

MAP_FILE = "us_20regions_map.html"
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
map_generation_lock = threading.Lock()
map_generation_in_progress = False
map_data = None

# Memory cache for API responses
response_cache = {}
CACHE_TIMEOUT = int(os.environ.get('CACHE_TIMEOUT', 3600))  # Cache timeout in seconds (default: 1 hour)

# Initialize performance monitoring variables
request_count = 0
request_times = {}
memory_usage = {}

# Memory optimization for map generation
def optimize_map_generation():
    """Apply memory optimization techniques to the map generation process"""
    import gc
    import os
    
    # Force garbage collection to free memory
    gc.collect()
    
    try:
        import psutil
        # Get current process memory info
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024  # Convert to MB
        logger.info(f"Memory usage before optimization: {memory_before:.2f} MB")
        return memory_before
    except ImportError:
        # If psutil is not available, just log and continue
        logger.warning("psutil package not available, skipping memory optimization")
        return 0

# Simple in-memory cache decorator
def cache_response(timeout=CACHE_TIMEOUT):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            cache_key = f.__name__ + str(args) + str(kwargs)
            current_time = time.time()
            
            # Check if result is in cache and not expired
            if cache_key in response_cache:
                result, timestamp = response_cache[cache_key]
                if current_time - timestamp < timeout:
                    return result
            
            # Calculate new result and store in cache
            result = f(*args, **kwargs)
            response_cache[cache_key] = (result, current_time)
            return result
        return wrapper
    return decorator

# Ensure cache directory exists
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
    logger.info(f"Created cache directory: {CACHE_DIR}")

# Function to determine if a response should be compressed
def should_compress(response):
    content_type = response.headers.get('Content-Type', '')
    content_length = response.headers.get('Content-Length', 0)
    try:
        content_length = int(content_length)
    except (ValueError, TypeError):
        content_length = 0
    
    # Only compress text-based responses over a certain size
    return (
        content_length > 1024 and  # Only compress responses larger than 1KB
        ('text/' in content_type or 
         'application/json' in content_type or 
         'application/javascript' in content_type)
    )

# Compression middleware
@app.after_request
def compress_response(response):
    # Check if client accepts gzip
    accept_encoding = request.headers.get('Accept-Encoding', '')
    
    # Skip compression for several conditions that can cause problems
    if any([
        'gzip' not in accept_encoding,                  # Client doesn't support gzip
        response.direct_passthrough,                    # Response is in direct passthrough mode
        response.status_code >= 400,                    # Error responses
        'Content-Encoding' in response.headers,         # Already encoded
        'Content-Disposition' in response.headers,      # File downloads
        response.mimetype.startswith(('image/', 'video/', 'audio/')), # Binary content
    ]):
        return response
        
    try:
        # Only compress if the response is compressible
        if should_compress(response):
            response_data = response.get_data()
            
            if response_data:
                # Compress the response
                gzip_buffer = BytesIO()
                gzip_file = gzip.GzipFile(mode='wb', fileobj=gzip_buffer)
                gzip_file.write(response_data)
                gzip_file.close()
                
                # Get compressed data
                compressed_data = gzip_buffer.getvalue()
                
                # Only use compression if it actually reduces size
                if len(compressed_data) < len(response_data):
                    # Replace the response with compressed data
                    response.set_data(compressed_data)
                    response.headers['Content-Encoding'] = 'gzip'
                    # Make sure to update Content-Length AFTER compression
                    response.headers['Content-Length'] = str(len(compressed_data))
                    response.headers['Vary'] = 'Accept-Encoding'
    except Exception as e:
        # Log the error but continue without compression
        logger.warning(f"Compression failed: {str(e)}")
            
    # Add cache headers for appropriate routes
    if request.path.startswith('/api/map') or request.path.startswith('/api/regions'):
        response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
    
    return response

# Custom middleware to handle CORS for ALL responses
@app.after_request
def add_cors_headers(response):
    # Add CORS headers to all responses
    origin = request.headers.get('Origin', '')
    
    # Log the incoming origin for debugging
    logger.info(f"Request from origin: {origin}")
    
    # Check if the origin is in our allowed list
    if origin in cors_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    elif origin and 'vercel.app' in origin:
        # Allow all Vercel domains
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        logger.info(f"Allowed Vercel origin: {origin}")
    elif '*' in cors_origins:
        # Only use wildcard when explicitly configured and no credentials are needed
        response.headers['Access-Control-Allow-Origin'] = '*'
    else:
        # Fallback to allow the origin for API endpoints
        if request.path.startswith('/api/'):
            response.headers['Access-Control-Allow-Origin'] = origin if origin else '*'
            logger.info(f"Fallback: Allowed origin for API endpoint: {origin if origin else '*'}")
    
    # Always set these headers for OPTIONS requests (preflight)
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With, Accept, Origin'
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours in seconds
    else:
        # For non-preflight requests, still set basic CORS headers
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours in seconds
    
    # For iframe embedding
    if response.mimetype == 'text/html':
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        
    return response

# Specific route for handling preflight CORS OPTIONS requests
@app.route('/api/statistical-area-map/<area_name>', methods=['OPTIONS'])
def options_statistical_area_map(area_name):
    response = Response()
    origin = request.headers.get('Origin', '')
    
    # Allow specific origins when credentials are involved
    if origin in cors_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    else:
        # When not a trusted origin, don't support credentials
        response.headers['Access-Control-Allow-Origin'] = '*'
        
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
    return response

@app.route('/api/generate-map', methods=['GET'])
def generate_map():
    global map_generation_in_progress, request_count
    
    # Increment request counter
    request_count += 1
    request_id = f"req_{request_count}"
    request_times[request_id] = {"start": time.time()}
    
    # Check if map already exists
    if os.path.exists(MAP_FILE):
        logger.info(f"Map already exists at {MAP_FILE}")
        request_times[request_id]["end"] = time.time()
        return jsonify({
            "success": True,
            "mapPath": "/api/map",
            "message": "Map already exists"
        })
    
    # Apply memory optimization to make map generation more efficient
    mem_usage = optimize_map_generation()
    memory_usage[request_id] = {"before": mem_usage}
    
    # Start map generation in background thread if not already in progress
    if not map_generation_in_progress:
        with map_generation_lock:
            map_generation_in_progress = True
        
        def generate_map_task():
            global map_generation_in_progress
            try:
                # Generate the map using the main.py functions
                start_time = time.time()
                logger.info("Starting map generation")
                
                # Apply memory optimization before generation
                optimize_map_generation()
                
                main.main()
                
                elapsed_time = time.time() - start_time
                logger.info(f"Map generation completed in {elapsed_time:.2f} seconds")
                
                # Post-generation memory optimization
                post_mem = optimize_map_generation()
                memory_usage[request_id]["after"] = post_mem
                
            except Exception as e:
                logger.error(f"Error during map generation: {e}")
            finally:
                with map_generation_lock:
                    map_generation_in_progress = False
                
                # Final GC collection to clean up
                import gc
                gc.collect()
        
        thread = threading.Thread(target=generate_map_task)
        thread.daemon = True
        thread.start()
        logger.info("Map generation thread started")
    
    request_times[request_id]["end"] = time.time()
    return jsonify({
        "success": True,
        "mapPath": "/api/map",
        "status": "Map generation started in background",
        "generationInProgress": True
    })

# Explicitly handle OPTIONS for map-status endpoint to fix CORS issues
@app.route('/api/map-status', methods=['OPTIONS'])
def options_map_status():
    response = jsonify({'success': True})
    # CORS headers will be added by the after_request handler
    return response

@app.route('/api/map-status', methods=['GET'])
@cache_response(timeout=5)  # Short cache time as status changes frequently
def map_status():
    return jsonify({
        "exists": os.path.exists(MAP_FILE),
        "generationInProgress": map_generation_in_progress
    })

@app.route('/api/map', methods=['GET'])
@cache_response(timeout=900)  # Cache for 15 minutes to improve stability
def get_map():
    # Check for 'stable' parameter to determine if we should use caching
    stable_view = request.args.get('stable', 'false').lower() == 'true'
    show_controls = request.args.get('showControls', 'false').lower() == 'true'
    
    # Serve the generated HTML file
    if os.path.exists(MAP_FILE):
        with open(MAP_FILE, 'r') as f:
            html_content = f.read()
            
        # Add script to handle cross-origin communication and map initialization
        init_script = """
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize map variables
            window.show_states = true;
            window.show_counties = true;
            window.show_msas = true;
            window.True = true;
            window.False = false;
            window.showControls = %s;
            
            // Add custom CSS for controls in both normal and fullscreen mode
            var styleElement = document.createElement('style');
            styleElement.textContent = `
                .leaflet-control-layers {
                    display: block !important;
                    position: absolute;
                    top: 70px;
                    right: 10px;
                    z-index: 1000;
                    background: white;
                    padding: 6px;
                    border-radius: 4px;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.4);
                }
                .leaflet-control-search {
                    display: block !important;
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                }
                .leaflet-control-search .search-input {
                    height: 30px;
                    padding: 0 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    width: 200px;
                }
                .leaflet-control-search .search-tooltip {
                    max-height: 200px;
                    overflow-y: auto;
                }
                .leaflet-touch .leaflet-control-layers {
                    border: 2px solid rgba(0,0,0,0.2);
                }
            `;
            document.head.appendChild(styleElement);
            
            // Add map controls if enabled
            if (window.showControls) {
                try {
                    // Add a short delay to ensure the map is fully initialized
                    setTimeout(function() {
                        // Handle layer control visibility and ensure it's moved to the correct position
                        var layerControl = document.querySelector('.leaflet-control-layers');
                        if (layerControl) {
                            layerControl.style.display = 'block';
                            
                            // Move the control to the right side for consistency
                            var mapContainer = document.querySelector('.leaflet-container');
                            if (mapContainer && !layerControl.parentNode.classList.contains('control-container')) {
                                // Create a container for controls if needed
                                var controlContainer = document.querySelector('.control-container') || document.createElement('div');
                                controlContainer.className = 'control-container';
                                controlContainer.style.position = 'absolute';
                                controlContainer.style.top = '70px';
                                controlContainer.style.right = '10px';
                                controlContainer.style.zIndex = '1000';
                                
                                if (!document.querySelector('.control-container')) {
                                    mapContainer.appendChild(controlContainer);
                                }
                                
                                // Move layer control to our custom container
                                controlContainer.appendChild(layerControl);
                            }
                        }
                        
                        // Handle search control visibility
                        var searchControl = document.querySelector('.leaflet-control-search');
                        if (searchControl) {
                            searchControl.style.display = 'block';
                        }
                    }, 500);
                } catch (e) {
                    console.error('Error initializing controls:', e);
                }
            }
            
            // Safe post message function that handles cross-origin communication
            function safePostMessage(message) {
                try {
                    window.parent.postMessage(message, '*');
                } catch (err) {
                    console.error('[Map] Error sending message to parent:', err);
                }
            }
            
            // Prevent flickering by handling resize events efficiently
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    try {
                        // Find all map containers
                        var maps = document.querySelectorAll('.leaflet-container');
                        
                        // Use Leaflet's methods if available
                        if (window.L && window.L.map) {
                            Object.keys(window.L.map._layers || {}).forEach(function(key) {
                                var layer = window.L.map._layers[key];
                                if (layer && layer.invalidateSize) {
                                    layer.invalidateSize(false);
                                }
                            });
                        }
                    } catch (e) {
                        console.error('[Map] Error handling resize:', e);
                    }
                }, 250);
            });
            
            // Handle messages from parent frame safely
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'MAP_INIT') {
                    // Update map variables
                    const data = event.data.data || {};
                    window.show_states = data.show_states ?? true;
                    window.show_counties = data.show_counties ?? true;
                    window.show_msas = data.show_msas ?? true;
                    
                    // Notify parent that map is ready
                    safePostMessage({
                        type: 'mapLoaded',
                        status: 'success'
                    });
                }
                
                // Handle control initialization
                if (event.data && event.data.type === 'MAP_CONTROLS_INIT') {
                    try {
                        // Show layer control if Leaflet is available
                        if (window.L && window.L.control) {
                            var layerControl = document.querySelector('.leaflet-control-layers');
                            if (layerControl) {
                                layerControl.style.display = 'block';
                                
                                // Ensure control is in the right position
                                var mapContainer = document.querySelector('.leaflet-container');
                                if (mapContainer && !layerControl.parentNode.classList.contains('control-container')) {
                                    // Create a container for controls if needed
                                    var controlContainer = document.querySelector('.control-container') || document.createElement('div');
                                    controlContainer.className = 'control-container';
                                    controlContainer.style.position = 'absolute';
                                    controlContainer.style.top = '70px';
                                    controlContainer.style.right = '10px';
                                    controlContainer.style.zIndex = '1000';
                                    
                                    if (!document.querySelector('.control-container')) {
                                        mapContainer.appendChild(controlContainer);
                                    }
                                    
                                    // Move layer control to our custom container
                                    controlContainer.appendChild(layerControl);
                                }
                            }
                            
                            var searchBox = document.querySelector('.leaflet-control-search');
                            if (searchBox) {
                                searchBox.style.display = 'block';
                                // Ensure search box is in a good position
                                searchBox.style.position = 'absolute';
                                searchBox.style.top = '10px';
                                searchBox.style.right = '10px';
                                searchBox.style.zIndex = '1000';
                            }
                        }
                    } catch (e) {
                        console.error('Error initializing map controls:', e);
                    }
                }
                
                // Handle toggling controls visibility
                if (event.data && event.data.type === 'TOGGLE_CONTROLS') {
                    try {
                        const visible = event.data.data?.visible;
                        const display = visible ? 'block' : 'none';
                        
                        // Get the control container or individual controls
                        var controlContainer = document.querySelector('.control-container');
                        if (controlContainer) {
                            controlContainer.style.display = display;
                        } else {
                            // Fall back to individual controls
                            var controls = document.querySelectorAll('.leaflet-control-layers, .leaflet-control-search');
                            controls.forEach(function(control) {
                                control.style.display = display;
                            });
                        }
                    } catch (e) {
                        console.error('Error toggling controls:', e);
                    }
                }
            });
            
            // Initial map loaded notification
            setTimeout(function() {
                safePostMessage({
                    type: 'mapLoaded',
                    status: 'success'
                });
            }, 1000);
        });
        </script>
        """ % ('true' if show_controls else 'false')
        
        # Add the initialization script just before the closing body tag
        html_content = html_content.replace('</body>', init_script + '</body>')
        
        # Set appropriate headers for cross-origin iframe embedding
        response = Response(html_content, mimetype='text/html')
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['X-Frame-Options'] = "ALLOWALL"
        
        # Add cache control headers to prevent flickering on stable views
        if stable_view:
            # Use a long cache for stable views
            response.headers['Cache-Control'] = 'public, max-age=900'  # 15 minutes
            response.headers['ETag'] = str(os.path.getmtime(MAP_FILE))
        else:
            # No caching for forced refreshes
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
        
        return response
    else:
        return "Map not found", 404

@app.route('/api/regions', methods=['GET'])
@cache_response(timeout=3600)  # Cache for 1 hour since regions rarely change
def get_regions():
    # Fetch region data
    _, _, _, regions = main.define_regions()
    
    # Convert region data to a format suitable for frontend
    region_data = {
        region: {
            "states": data["states"],
            "color": data["color"]
        } for region, data in regions.items()
    }
    
    return jsonify(region_data)

@app.route('/api/static-fallback-map/<area_name>', methods=['GET'])
def get_static_fallback_map(area_name):
    """Serve a static fallback map for areas that can't be generated with the interactive map"""
    try:
        logger.info(f"Serving static fallback map for: {area_name}")
        from statistical_area_zoom import create_fallback_map, get_coordinates_for_area
        
        # Special case for Anchorage - provide a customized fallback with specific coordinates
        if 'anchorage' in area_name.lower():
            logger.info("Using special fallback for Anchorage")
            # Anchorage coordinates
            coords = [61.2181, -149.9003]
            
            # Create simple HTML for Anchorage
            html_content = f"""
            <html>
            <head>
                <title>Map of {area_name}</title>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                    body {{ margin: 0; padding: 0; }}
                    #map {{ width: 100%; height: 100vh; }}
                    .map-title {{ 
                        position: absolute; 
                        top: 10px; 
                        left: 50px; 
                        z-index: 1000; 
                        background-color: white; 
                        padding: 10px; 
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        font-family: Arial, sans-serif;
                    }}
                    .map-title h3 {{ margin: 0; color: #4F46E5; }}
                    .map-title p {{ margin: 5px 0 0; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div id="map"></div>
                <div class="map-title">
                    <h3>Map View of {area_name}</h3>
                    <p>Static fallback map</p>
                </div>
                
                <script>
                    // Initialize map
                    const map = L.map('map').setView([{coords[0]}, {coords[1]}], 9);
                    
                    // Add base layer
                    L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                        attribution: '&copy; OpenStreetMap contributors'
                    }}).addTo(map);
                    
                    // Add marker for Anchorage
                    L.marker([{coords[0]}, {coords[1]}])
                        .addTo(map)
                        .bindPopup("<b>{area_name}</b>")
                        .openPopup();
                    
                    // Add circle to represent the area
                    L.circle([{coords[0]}, {coords[1]}], {{
                        color: '#4F46E5',
                        fillColor: '#4F46E5',
                        fillOpacity: 0.2,
                        radius: 25000
                    }}).addTo(map);
                    
                    // Notify parent when loaded
                    window.addEventListener('load', function() {{
                        try {{
                            if (window.parent) {{
                                window.parent.postMessage({{type: 'mapLoaded', status: 'success'}}, '*');
                            }}
                        }} catch (e) {{
                            console.error('Error sending loaded message:', e);
                        }}
                    }});
                </script>
            </body>
            </html>
            """
            
            response = Response(html_content, mimetype='text/html')
            response.headers['Content-Security-Policy'] = "frame-ancestors *"
            response.headers['X-Frame-Options'] = "ALLOWALL"
            return response
        
        # Create a static fallback map
        html_content = create_fallback_map(area_name, None)
        
        if html_content:
            response = Response(html_content, mimetype='text/html')
            response.headers['Content-Security-Policy'] = "frame-ancestors *"
            response.headers['X-Frame-Options'] = "ALLOWALL"
            return response
        else:
            # If fallback creation failed, return a very basic HTML response
            basic_html = f"""
            <html>
            <head><title>Map of {area_name}</title></head>
            <body style="margin:0; padding:20px; font-family:Arial; text-align:center; background:#f5f5f5;">
                <div style="max-width:600px; margin:100px auto; padding:20px; background:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                    <h2>Map of {area_name}</h2>
                    <p>This is a simplified view of the {area_name} area.</p>
                    <p>The interactive map could not be loaded at this time.</p>
                </div>
            </body>
            </html>
            """
            return Response(basic_html, mimetype='text/html')
    except Exception as e:
        logger.exception(f"Error generating static fallback map: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500

@app.route('/api/statistical-area-map/<area_name>', methods=['GET'])
@cache_response(timeout=3600)  # Cache for 1 hour
def get_statistical_area_map(area_name):
    """Get a map for a specific statistical area"""
    try:
        # Log request details
        logger.info(f"Map request for area: {area_name}")
        logger.info(f"Query parameters: {request.args}")
        start_time = time.time()
        
        # Parse parameters
        force_regen = request.args.get('force_regen', 'false').lower() == 'true'
        use_cached = request.args.get('use_cached', 'true').lower() == 'true'
        detailed = request.args.get('detailed', 'false').lower() == 'true'
        zoom = int(request.args.get('zoom', 9))
        exact_boundary = request.args.get('exact_boundary', 'true').lower() == 'true'
        lightweight = request.args.get('lightweight', 'true').lower() == 'true'
        
        logger.info(f"Processing parameters: force_regen={force_regen}, use_cached={use_cached}, "
                   f"detailed={detailed}, zoom={zoom}, exact_boundary={exact_boundary}, lightweight={lightweight}")
        
        # Generate the map
        map_file = generate_statistical_area_map(
            area_name, 
            zoom=zoom,
            exact_boundary=exact_boundary,
            detailed=detailed,
            use_cached=use_cached,
            force_regen=force_regen,
            lightweight=lightweight
        )
        
        if map_file and os.path.exists(map_file):
            logger.info(f"Map generated successfully at {map_file}")
            elapsed_time = time.time() - start_time
            logger.info(f"Request completed in {elapsed_time:.2f} seconds")
            
            # File exists, now read it into memory and create a Response
            # This prevents the direct_passthrough mode issues
            try:
                with open(map_file, 'rb') as f:
                    html_content = f.read()
                
                # Create a response with the correct Content-Length
                response = Response(html_content, mimetype='text/html')
                response.headers['Content-Length'] = str(len(html_content))
                response.headers['Content-Security-Policy'] = "frame-ancestors *"
                response.headers['X-Frame-Options'] = "ALLOWALL"
                return response
            except Exception as file_error:
                logger.error(f"Error reading map file: {file_error}")
                # Fallback to direct send_file if reading fails
                return send_file(map_file, mimetype='text/html')
        else:
            logger.error(f"Failed to generate map for {area_name}")
            return jsonify({
                "success": False,
                "message": f"Could not generate map for {area_name}. Try with different parameters."
            }), 500
    except Exception as e:
        logger.exception(f"Error generating map for {area_name}: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500

@app.route('/api/clear-cache', methods=['GET'])
def clear_cache():
    """Clear the cache directory to force regeneration of maps with improved state boundaries"""
    try:
        # Get the cache directory
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
        
        # Count files before deletion
        files_before = len([f for f in os.listdir(cache_dir) if os.path.isfile(os.path.join(cache_dir, f))])
        
        # Delete all HTML files in the cache directory
        for filename in os.listdir(cache_dir):
            if filename.endswith(".html"):
                file_path = os.path.join(cache_dir, filename)
                try:
                    os.remove(file_path)
                    logger.info(f"Deleted cached map: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {e}")
        
        # Count files after deletion
        files_after = len([f for f in os.listdir(cache_dir) if os.path.isfile(os.path.join(cache_dir, f))])
        
        return jsonify({
            "success": True,
            "message": f"Cache cleared. Removed {files_before - files_after} files.",
            "filesRemoved": files_before - files_after
        })
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return jsonify({
            "success": False,
            "message": f"Error clearing cache: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """A simple health check endpoint to test CORS and server status"""
    if request.method == 'OPTIONS':
        response = Response()
    else:
        # Check if the data cache exists
        data_cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")
        data_cache_exists = os.path.exists(data_cache_dir)
        cached_files = len([f for f in os.listdir(data_cache_dir)]) if data_cache_exists else 0
        
        response = jsonify({
            "status": "healthy",
            "message": "Backend server is operational",
            "timestamp": time.time(),
            "cors_enabled": True,
            "cors_origins": cors_origins,
            "cache_dir_exists": os.path.exists(CACHE_DIR),
            "cached_maps": len([f for f in os.listdir(CACHE_DIR) if f.endswith('.html')]) if os.path.exists(CACHE_DIR) else 0,
            "data_cache_exists": data_cache_exists,
            "cached_data_files": cached_files
        })
    
    # Set CORS headers
    origin = request.headers.get('Origin', '')
    
    if origin in cors_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
        
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

@app.route('/api/preload-data', methods=['GET'])
def preload_data():
    """Endpoint to pre-download and cache all census data"""
    try:
        # Start preloading in a background thread
        def preload_task():
            try:
                data_preloader.download_and_cache_all_data()
            except Exception as e:
                logger.error(f"Error in preload task: {str(e)}")
        
        thread = threading.Thread(target=preload_task)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "success": True,
            "message": "Data preloading started in background"
        })
        
    except Exception as e:
        logger.error(f"Error starting preload task: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error starting preload: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Try to preload data at startup
    try:
        logger.info("Checking for cached data at startup")
        if not os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")):
            logger.info("No data cache found, creating data cache directory")
            os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache"), exist_ok=True)
            
        # Check if we have the cached data files
        required_files = ["msa_data.pkl", "county_data.pkl", "states_data.pkl", "county_msa_relationships.pkl"]
        data_cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_cache")
        missing_files = [f for f in required_files if not os.path.exists(os.path.join(data_cache_dir, f))]
        
        if missing_files:
            logger.info(f"Missing data cache files: {missing_files}. Starting preload in background")
            # Start preloading in a background thread
            def preload_task():
                try:
                    data_preloader.download_and_cache_all_data()
                except Exception as e:
                    logger.error(f"Error in startup preload task: {str(e)}")
            
            thread = threading.Thread(target=preload_task)
            thread.daemon = True
            thread.start()
    except Exception as e:
        logger.error(f"Error checking data cache at startup: {str(e)}")
        
    app.run(debug=True, host='0.0.0.0', port=5000)
