// Direct injection script for map variables
(() => {
  console.log('[MapInject] Starting direct variable injection');
  
  // Define global variables
  window.show_states = true;
  window.show_counties = true;
  window.show_msas = true;
  window.True = true;
  window.False = false;
  
  // Function to inject variables into iframes
  function injectIntoIframes() {
    try {
      // Find all iframes in the document
      const iframes = document.querySelectorAll('iframe');
      
      iframes.forEach((iframe, index) => {
        try {
          if (iframe.contentWindow) {
            // Directly patch the contentWindow object
            iframe.contentWindow.show_states = true;
            iframe.contentWindow.show_counties = true;
            iframe.contentWindow.show_msas = true;
            iframe.contentWindow.True = true;
            iframe.contentWindow.False = false;
            
            // Also inject our own handler for future errors
            const script = document.createElement('script');
            script.textContent = `
              // Error safety
              window.show_states = true;
              window.show_counties = true;
              window.show_msas = true;
              window.True = true;
              window.False = false;
              
              // Override toggleLayer if it exists
              if (window.toggleLayer && !window.toggleLayer._fixed) {
                const orig = window.toggleLayer;
                window.toggleLayer = function(name, visible) {
                  // Ensure states variables exist
                  if (typeof window.show_states === 'undefined') window.show_states = true;
                  if (typeof window.show_counties === 'undefined') window.show_counties = true;
                  if (typeof window.show_msas === 'undefined') window.show_msas = true;
                  
                  // Safe call
                  try {
                    return orig(name, visible);
                  } catch(e) {
                    console.error('Error in toggleLayer:', e);
                    return false;
                  }
                };
                window.toggleLayer._fixed = true;
              }
            `;
            
            // Try to inject script into iframe
            try {
              if (iframe.contentDocument && iframe.contentDocument.body) {
                iframe.contentDocument.body.appendChild(script);
                console.log(`[MapInject] Script injected into iframe ${index}`);
              }
            } catch (e) {
              console.warn(`[MapInject] Failed to inject script into iframe ${index}:`, e);
            }
            
            console.log(`[MapInject] Variables injected into iframe ${index}`);
          }
        } catch (frameErr) {
          console.warn(`[MapInject] Failed to access iframe ${index}:`, frameErr);
        }
      });
    } catch (err) {
      console.error('[MapInject] Error injecting into iframes:', err);
    }
  }
  
  // Create a MutationObserver to watch for new iframes
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IFRAME' || 
              (node.nodeType === 1 && node.querySelector('iframe'))) {
            shouldInject = true;
          }
        });
      }
    });
    
    if (shouldInject) {
      console.log('[MapInject] New iframe detected, injecting variables');
      setTimeout(injectIntoIframes, 500); // Delay to ensure iframe is loaded
    }
  });
  
  // Observe the entire document
  observer.observe(document.documentElement, { 
    childList: true,
    subtree: true 
  });
  
  // Initial injection and periodic re-injection
  injectIntoIframes();
  
  // Also inject on window load
  window.addEventListener('load', () => {
    console.log('[MapInject] Window loaded, injecting variables');
    injectIntoIframes();
    
    // Additional injection after a delay to catch late iframes
    setTimeout(injectIntoIframes, 2000);
  });
  
  // Set up periodic re-injection every 5 seconds for the first minute
  let intervalCount = 0;
  const intervalId = setInterval(() => {
    console.log('[MapInject] Periodic re-injection');
    injectIntoIframes();
    
    intervalCount++;
    if (intervalCount >= 12) { // After 1 minute (12 * 5s)
      clearInterval(intervalId);
    }
  }, 5000);
  
  console.log('[MapInject] Direct variable injection script initialized');
})();

// Map Injector Script - Will fix empty maps by injecting fallback content
(function() {
  console.log('[MapInject] Script loaded');
  
  // Wait for page to load
  window.addEventListener('load', function() {
    // Give the map a chance to load normally
    setTimeout(checkAndInjectMap, 3000);
  });
  
  // Function to check if map is empty and inject content if needed
  function checkAndInjectMap() {
    console.log('[MapInject] Checking map status');
    
    // Look for Leaflet containers - if none found, map is likely empty
    const leafletContainers = document.querySelectorAll('.leaflet-container');
    
    if (leafletContainers.length === 0) {
      console.log('[MapInject] No Leaflet containers found, map is likely empty');
      injectFallbackMap();
    } else {
      console.log('[MapInject] Map appears to be working with ' + leafletContainers.length + ' containers');
    }
  }
  
  // Function to inject a fallback map
  function injectFallbackMap() {
    console.log('[MapInject] Injecting fallback map');
    
    try {
      // Find the target container
      const mapContainer = document.querySelector('.map-frame').contentDocument.body;
      
      if (!mapContainer) {
        console.error('[MapInject] Cannot find map container');
        return;
      }
      
      // Clear any existing content
      mapContainer.innerHTML = '';
      
      // Create a Leaflet map div
      const mapDiv = document.createElement('div');
      mapDiv.id = 'fallback-map';
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      mapContainer.appendChild(mapDiv);
      
      // Add Leaflet CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      mapContainer.appendChild(leafletCSS);
      
      // Add Leaflet JS
      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      mapContainer.appendChild(leafletJS);
      
      // Add map initialization script
      const mapScript = document.createElement('script');
      mapScript.textContent = `
        // Initialize fallback map when Leaflet is loaded
        let mapInitInterval = setInterval(() => {
          if (typeof L !== 'undefined') {
            clearInterval(mapInitInterval);
            console.log('[MapInject] Leaflet loaded, initializing fallback map');
            
            // Create the map
            const map = L.map('fallback-map').setView([39.8283, -98.5795], 4);
            
            // Add a tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            
            // Add a title
            const titleDiv = document.createElement('div');
            titleDiv.style.position = 'absolute';
            titleDiv.style.top = '10px';
            titleDiv.style.left = '50px';
            titleDiv.style.zIndex = '1000';
            titleDiv.style.backgroundColor = 'white';
            titleDiv.style.padding = '10px';
            titleDiv.style.borderRadius = '5px';
            titleDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            titleDiv.innerHTML = '<h3 style="margin:0; color:#4F46E5;">Map View of Anchorage</h3><p style="margin:5px 0 0; font-size:12px;">Fallback map generated automatically</p>';
            document.getElementById('fallback-map').appendChild(titleDiv);
            
            // Notify parent that map is loaded
            try {
              window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
            } catch (e) {
              console.error('[MapInject] Error sending message to parent:', e);
            }
          }
        }, 100);
      `;
      mapContainer.appendChild(mapScript);
      
      console.log('[MapInject] Fallback map injected');
    } catch (e) {
      console.error('[MapInject] Error injecting fallback map:', e);
    }
  }
})(); 