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

app = Flask(__name__)
# Enable CORS with specific options for production
CORS(app, 
    resources={r"/api/*": {
        "origins": [
            "https://sst-frontend-swart.vercel.app", 
            "http://localhost:3000",
            "https://sst-project.onrender.com",
            "*.onrender.com"
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "expose_headers": ["Content-Type", "Content-Length", "Content-Disposition", "X-Frame-Options"],
        "max_age": 86400  # Cache preflight requests for 24 hours
    }},
    send_wildcard=False  # Changed to False to prevent CORS issues
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
CACHE_TIMEOUT = 3600  # Cache timeout in seconds (1 hour)

# Initialize performance monitoring variables
request_count = 0
request_times = {}
memory_usage = {}

# Memory optimization for map generation
def optimize_map_generation():
    """Apply memory optimization techniques to the map generation process"""
    import gc
    import os
    import psutil
    
    # Force garbage collection to free memory
    gc.collect()
    
    # Get current process memory info
    process = psutil.Process(os.getpid())
    memory_before = process.memory_info().rss / 1024 / 1024  # Convert to MB
    
    logger.info(f"Memory usage before optimization: {memory_before:.2f} MB")
    
    # Return the current memory usage for tracking
    return memory_before

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
    
    if 'gzip' in accept_encoding and should_compress(response):
        response_data = response.get_data()
        
        if response_data:
            # Compress the response
            gzip_buffer = BytesIO()
            gzip_file = gzip.GzipFile(mode='wb', fileobj=gzip_buffer)
            gzip_file.write(response_data)
            gzip_file.close()
            
            # Replace the response with compressed data
            response.set_data(gzip_buffer.getvalue())
            response.headers['Content-Encoding'] = 'gzip'
            response.headers['Content-Length'] = len(response.get_data())
            
    # Add cache headers for appropriate routes
    if request.path.startswith('/api/map') or request.path.startswith('/api/regions'):
        response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
    
    return response

# Custom middleware to handle CORS for HTML responses
@app.after_request
def add_cors_headers(response):
    # Add CORS headers to all responses
    origin = request.headers.get('Origin', '')
    
    # List of allowed origins
    allowed_origins = [
        'https://sst-frontend-swart.vercel.app', 
        'http://localhost:3000',
        'https://sst-project.onrender.com',
        'https://your-frontend-domain.vercel.app'
    ]
    
    # Allow specific origins only when credentials are involved
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    elif not response.headers.get('Access-Control-Allow-Credentials'):
        # If credentials aren't being used, we can use wildcard
        response.headers['Access-Control-Allow-Origin'] = '*'
        
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours in seconds
    
    # For iframe embedding
    if response.mimetype == 'text/html':
        response.headers['X-Frame-Options'] = 'ALLOW-FROM http://localhost:3000'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['Access-Control-Allow-Origin'] = origin if origin in allowed_origins else '*'
    
    return response

# Specific route for handling preflight CORS OPTIONS requests
@app.route('/api/statistical-area-map/<area_name>', methods=['OPTIONS'])
def options_statistical_area_map(area_name):
    response = Response()
    origin = request.headers.get('Origin', '')
    
    # List of allowed origins
    allowed_origins = [
        'https://sst-frontend-swart.vercel.app', 
        'http://localhost:3000',
        'https://sst-project.onrender.com',
        'https://your-frontend-domain.vercel.app'
    ]
    
    # Allow specific origins when credentials are involved
    if origin in allowed_origins:
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

@app.route('/api/map-status', methods=['GET'])
@cache_response(timeout=5)  # Short cache time as status changes frequently
def map_status():
    return jsonify({
        "exists": os.path.exists(MAP_FILE),
        "generationInProgress": map_generation_in_progress
    })

@app.route('/api/map', methods=['GET'])
def get_map():
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
            
            // Safe post message function that handles cross-origin communication
            function safePostMessage(message) {
                try {
                    window.parent.postMessage(message, '*');
                    console.log('[Map Diagnostic] Message sent to parent:', message);
                } catch (err) {
                    console.log('[Map Diagnostic] Error sending message to parent:', err);
                }
            }
            
            // Log diagnostics
            console.log('[Map Diagnostic] Map iframe loaded and ready for messages');
            
            // Handle messages from parent frame safely
            window.addEventListener('message', function(event) {
                console.log('[Map Diagnostic] Received message from parent:', event.data);
                
                if (event.data && event.data.type === 'MAP_INIT') {
                    // Update map variables
                    const data = event.data.data || {};
                    window.show_states = data.show_states ?? true;
                    window.show_counties = data.show_counties ?? true;
                    window.show_msas = data.show_msas ?? true;
                    
                    // Force map refresh - safely without direct property access
                    try {
                        // Find all map containers
                        var maps = document.querySelectorAll('.leaflet-container');
                        console.log('[Map Diagnostic] Found', maps.length, 'map containers');
                        
                        // Force a resize event on the window to trigger map recalculation
                        var evt = document.createEvent('UIEvents');
                        evt.initUIEvent('resize', true, false, window, 0);
                        window.dispatchEvent(evt);
                        console.log('[Map Diagnostic] Dispatched resize event to window');
                        
                        // Use Leaflet's global map collection instead of accessing _leaflet_id directly
                        // This avoids the cross-origin issue
                        if (window.L && window.L.map && typeof window.L.map.invalidateSize === 'function') {
                            // If we can access the map instance from a global variable
                            window.L.map.invalidateSize(true);
                            console.log('[Map Diagnostic] Invalidated map size using global L.map');
                        } else {
                            // Otherwise, we'll rely on the resize event we dispatched
                            console.log('[Map Diagnostic] Using resize event for map refresh');
                        }
                        
                        // Notify parent that map is ready
                        safePostMessage({
                            type: 'mapLoaded',
                            status: 'success'
                        });
                    } catch (e) {
                        console.log('[Map Diagnostic] Map refresh failed:', e);
                        // Still try to notify parent even if refresh failed
                        safePostMessage({
                            type: 'mapLoaded',
                            status: 'error',
                            error: e.toString()
                        });
                    }
                }
            });
            
            // Initial map loaded notification
            setTimeout(function() {
                console.log('[Map Diagnostic] Map loaded, sending message to parent');
                safePostMessage({
                    type: 'mapLoaded',
                    status: 'success'
                });
            }, 1000);
        });
        </script>
        """
        
        # Add the initialization script just before the closing body tag
        html_content = html_content.replace('</body>', init_script + '</body>')
        
        # Set appropriate headers for cross-origin iframe embedding
        response = Response(html_content, mimetype='text/html')
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['X-Frame-Options'] = "ALLOWALL"
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
            "cache_dir_exists": os.path.exists(CACHE_DIR),
            "cached_maps": len([f for f in os.listdir(CACHE_DIR) if f.endswith('.html')]) if os.path.exists(CACHE_DIR) else 0,
            "data_cache_exists": data_cache_exists,
            "cached_data_files": cached_files
        })
    
    # Set CORS headers
    origin = request.headers.get('Origin', '')
    allowed_origins = [
        'https://sst-frontend-swart.vercel.app', 
        'http://localhost:3000',
        'https://sst-project.onrender.com',
        'https://your-frontend-domain.vercel.app'
    ]
    
    if origin in allowed_origins:
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
