import { useState, useEffect, useRef } from 'react';
import { getApiUrl, getMapApiUrl, fetchWithCORSHandling } from '../config';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapDebugInfo, setMapDebugInfo] = useState(null);
  const iframeRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [mapKey, setMapKey] = useState(`map-${Date.now()}`); // Stable key for iframe
  const [showLayerControls, setShowLayerControls] = useState(true);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkMap = async () => {
      try {
        // First check API health
        let healthData;
        try {
          healthData = await fetchWithCORSHandling(getApiUrl('/api/health'));
        } catch (healthError) {
          console.warn('Health check failed, proceeding anyway:', healthError);
          healthData = { status: 'unknown', fallback: true };
        }
        setMapDebugInfo(`API Status: ${JSON.stringify(healthData)}`);
        
        // Then check map status with CORS error handling
        let data;
        try {
          // First try with regular fetch
          const response = await fetch(getApiUrl('/api/map-status'), {
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Map status check failed: ${response.status}`);
          }
          
          data = await response.json();
        } catch (corsError) {
          console.warn('CORS error in map status check, trying alternative approach:', corsError);
          
          // Fallback: try no-cors mode and assume map doesn't exist
          try {
            await fetch(getApiUrl('/api/map-status'), { mode: 'no-cors' });
            // If we get here, the endpoint exists but we can't read the response
            data = { exists: false, fallback: true };
          } catch (fallbackError) {
            console.error('Even no-cors failed:', fallbackError);
            data = { exists: false, error: fallbackError.message };
          }
        }
        
        setMapDebugInfo(prev => `${prev}\nMap Status: ${JSON.stringify(data)}`);
        
        if (!data.exists) {
          // Try to generate the map with CORS error handling
          setMapDebugInfo(prev => `${prev}\nMap not found, attempting to generate...`);
          let genData;
          try {
            genData = await fetchWithCORSHandling(getApiUrl('/api/generate-map'));
          } catch (genError) {
            console.error('Map generation request failed:', genError);
            genData = { success: false, error: genError.message };
          }
          
          setMapDebugInfo(prev => `${prev}\nGeneration Result: ${JSON.stringify(genData)}`);
          
          if (!genData.success) {
            throw new Error('Map generation failed');
          }
        }
      } catch (err) {
        setError(`Map Error: ${err.message}`);
        setIsLoading(false);
      }
    };

    checkMap();
    
    // Add window message event listener for iframe communication
    const handleIframeMessage = (event) => {
      // Check origin for security
      console.log('[Map Diagnostic] Received message from iframe:', event.data);
      setMapDebugInfo(prev => `${prev}\nMessage from map: ${JSON.stringify(event.data)}`);
      
      // Check if message comes from our map
      if (event.data && event.data.type === 'mapLoaded') {
        setIsLoading(false);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        
        // Initialize map filters when map is loaded
        initializeMapControls();
        
        // Hide the MSA elements after the map loads
        hideMSAElements();
      }
    };
    
    window.addEventListener('message', handleIframeMessage);

    // Set a timeout to force loading state to false if map takes too long
    loadTimeoutRef.current = setTimeout(() => {
      console.log('[Map Diagnostic] Map load timeout reached. Forcing loading to false.');
      setIsLoading(false);
      setMapDebugInfo(prev => `${prev}\nMap load timeout reached`);
    }, 10000); // 10 second timeout

    // Set up resize observer to track container size changes
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerDimensions({ width, height });
          
          // If iframe is loaded, send resize message
          if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage({
                type: 'MAP_RESIZE',
                data: { width, height }
              }, '*');
            } catch (e) {
              console.error('[Map Resize] Failed to notify iframe of resize:', e);
            }
          }
        }
      });
      
      // Start observing the container
      const container = document.querySelector('.map-container');
      if (container) {
        resizeObserverRef.current.observe(container);
      }
    }

    // Create a MutationObserver to watch for DOM changes in the iframe
    let observer = null;
    const watchForExportButton = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentDocument) {
          // Set up the observer
          observer = new MutationObserver((mutations) => {
            hideExportButton();
          });
          
          // Start observing
          observer.observe(iframeRef.current.contentDocument.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
          
          console.log('[Map Diagnostic] Export button observer installed');
        }
      } catch (e) {
        console.error('[Map Diagnostic] Failed to set up export button observer:', e);
      }
    };
    
    // Try to set up the observer after a delay to ensure iframe is loaded
    const observerTimeout = setTimeout(watchForExportButton, 3000);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(observerTimeout);
    };
  }, []);
  
  // Function to hide Metropolitan Statistical Areas in the legend
  const hideMSAElements = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        // Wait for the map to fully load
        setTimeout(() => {
          try {
            // Direct approach: find and hide the checkbox with exact "Metropolitan Statistical Areas" text
            const doc = iframe.contentDocument;
            
            // Approach 1: Using general selector
            const labels = doc.querySelectorAll('.leaflet-control-layers-overlays label');
            labels.forEach(label => {
              const text = label.textContent.trim();
              // Only hide exact "Metropolitan Statistical Areas"
              if (text === "Metropolitan Statistical Areas" || 
                 (text.includes("Metropolitan Statistical Areas") && !text.includes("Virgin"))) {
                label.style.display = 'none';
                console.log('[Map] Hidden MSA label via exact match');
              }
            });
            
            // Approach 2: Using span content
            doc.querySelectorAll('.leaflet-control-layers-overlays span').forEach(span => {
              if (span.textContent.trim() === "Metropolitan Statistical Areas") {
                const parent = span.closest('label');
                if (parent) {
                  parent.style.display = 'none';
                  console.log('[Map] Hidden MSA label via span content');
                }
              }
            });
            
            // Approach 3: Using checkbox directly
            doc.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
              const nextSibling = checkbox.nextElementSibling;
              if (nextSibling && 
                  nextSibling.textContent && 
                  nextSibling.textContent.trim() === "Metropolitan Statistical Areas") {
                const parent = checkbox.closest('label');
                if (parent) {
                  parent.style.display = 'none';
                  console.log('[Map] Hidden MSA checkbox via nextSibling text');
                }
              }
            });
            
            // Create a style element to ensure CSS-based hiding
            const style = doc.createElement('style');
            style.textContent = `
              .leaflet-control-layers-overlays label:has(span:contains("Metropolitan Statistical Areas"):not(:contains("Virgin"))) {
                display: none !important;
              }
            `;
            doc.head.appendChild(style);
            
          } catch (innerError) {
            console.error('[Map] Error in direct DOM manipulation:', innerError);
          }
        }, 2000); // Longer timeout for complete loading
        
        // Send a message to the iframe
        iframe.contentWindow.postMessage({
          type: 'HIDE_MSA_ELEMENTS',
          data: { 
            hide: true,
            exactMatch: "Metropolitan Statistical Areas" 
          }
        }, '*');
      }
    } catch (e) {
      console.error('[Map] Error hiding MSA elements:', e);
    }
  };
  
  const initializeMapControls = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'MAP_CONTROLS_INIT',
          data: {
            enableControls: true,
            enableSearch: false,
            showLayerControl: true,
            hideMSA: true,
            disableExport: true
          }
        }, '*');
        
        // Try to directly disable export via DOM manipulation
        setTimeout(() => {
          hideExportButton();
        }, 500);
      }
    } catch (e) {
      console.error('[Map Controls] Failed to initialize controls:', e);
    }
  };

  // Function to hide the search control
  const hideSearchControl = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const searchControl = iframe.contentDocument.querySelector('.leaflet-control-search');
        if (searchControl) {
          searchControl.style.display = 'none';
          console.log('[Map Diagnostic] Hidden search control');
          setMapDebugInfo(prev => `${prev}\nHidden search control`);
        }
      }
    } catch (e) {
      console.error('[Map Diagnostic] Failed to hide search control:', e);
    }
  };

  // Function to hide the export button
  const hideExportButton = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        // Try multiple selectors to find the export button
        const exportSelectors = [
          '.export-button',
          '.leaflet-control-export',
          'button:contains("Export")',
          'div:contains("Export")',
          '[class*="export"]',
          '.leaflet-top.leaflet-right button',
          '.leaflet-top.leaflet-right div'
        ];
        
        let found = false;
        
        for (const selector of exportSelectors) {
          try {
            const elements = iframe.contentDocument.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.innerText && el.innerText.includes('Export') || 
                  el.className && el.className.includes('export')) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                found = true;
                console.log('[Map Diagnostic] Hidden export element via selector:', selector);
              }
            });
          } catch (selectorError) {
            console.warn('[Map Diagnostic] Error with selector', selector, selectorError);
          }
        }
        
        // Inject a style tag to ensure export is hidden
        const styleTag = iframe.contentDocument.createElement('style');
        styleTag.textContent = `
          .export-button, 
          [class*="export"], 
          button:contains("Export"), 
          div:contains("Export"),
          .leaflet-top.leaflet-right .export-button,
          .leaflet-control-export {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        iframe.contentDocument.head.appendChild(styleTag);
        
        // Inject a script to find and hide the export button
        const scriptTag = iframe.contentDocument.createElement('script');
        scriptTag.textContent = `
          (function() {
            function hideExportElements() {
              // Find by text content
              document.querySelectorAll('button, div').forEach(el => {
                if (el.innerText && el.innerText.includes('Export')) {
                  el.style.display = 'none';
                  el.style.visibility = 'hidden';
                }
              });
              
              // Find by class name
              document.querySelectorAll('[class*="export"]').forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
              });
              
              // Find specific button in leaflet controls
              var topRightControls = document.querySelector('.leaflet-top.leaflet-right');
              if (topRightControls) {
                topRightControls.querySelectorAll('button, div').forEach(el => {
                  if (el.innerText && el.innerText.includes('Export')) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                  }
                });
              }
            }
            
            // Run immediately
            hideExportElements();
            
            // Also run on any DOM changes
            var observer = new MutationObserver(hideExportElements);
            observer.observe(document.body, { 
              childList: true, 
              subtree: true,
              attributes: true
            });
            
            // Also run on any window messages about map controls
            window.addEventListener('message', function(event) {
              if (event.data && (event.data.type === 'MAP_INIT' || event.data.type === 'MAP_CONTROLS_INIT')) {
                setTimeout(hideExportElements, 100);
              }
            });
          })();
        `;
        iframe.contentDocument.head.appendChild(scriptTag);
        
        if (found) {
          setMapDebugInfo(prev => `${prev}\nHidden export elements`);
        }
      }
    } catch (e) {
      console.error('[Map Diagnostic] Failed to hide export button:', e);
    }
  };

  const handleIframeLoad = () => {
    console.log('[Map Diagnostic] Iframe loaded');
    setMapDebugInfo(prev => `${prev}\nIframe loaded`);
    
    // Try to access iframe content
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Try to hide export button
        hideExportButton();
        
        // Try to hide search control
        hideSearchControl();
        
        // Try to hide MSA elements
        hideMSAElements();
        
        // Notify the iframe about its container size
        const container = iframeRef.current.parentElement;
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          iframeRef.current.contentWindow.postMessage({
            type: 'MAP_RESIZE',
            data: { width, height }
          }, '*');
        }
        
        // Force iframe to refresh layout
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.style.height = iframeRef.current.offsetHeight + 'px';
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.style.height = '100%';
              }
            }, 10);
          }
        }, 500);
      }
    } catch (e) {
      console.error('[Map Diagnostic] Error accessing iframe content:', e);
      setMapDebugInfo(prev => `${prev}\nError accessing iframe: ${e.message}`);
    }
    
    // Set loading to false only if not already set by message handler
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Short delay to ensure controls initialize
  };

  const handleIframeError = (e) => {
    setError(`Failed to load the map: ${e.message}`);
    setMapDebugInfo(prev => `${prev}\nIframe error event: ${e.message}`);
    setIsLoading(false);
  };

  const regenerateMap = async () => {
    setIsLoading(true);
    setError(null);
    setMapDebugInfo('Forcing map regeneration...');
    
    try {
      // Force regeneration with cache bypass using CORS handling
      let genData;
      try {
        genData = await fetchWithCORSHandling(getApiUrl('/api/generate-map?force=true'));
      } catch (genError) {
        console.error('Map regeneration request failed:', genError);
        genData = { success: false, error: genError.message };
      }
      
      setMapDebugInfo(prev => `${prev}\nRegeneration Result: ${JSON.stringify(genData)}`);
      
      if (genData.success) {
        // Generate a new key to force iframe to completely reload
        setMapKey(`map-${Date.now()}`);
      } else {
        throw new Error('Map regeneration failed');
      }
    } catch (e) {
      setError(`Regeneration failed: ${e.message}`);
      setIsLoading(false);
    }
  };
  
  const toggleLayerControls = () => {
    setShowLayerControls(!showLayerControls);
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'TOGGLE_CONTROLS',
          data: {
            visible: !showLayerControls
          }
        }, '*');
      }
    } catch (e) {
      console.error('Failed to toggle controls:', e);
    }
  };

  if (error) {
    return (
      <div className="map-error">
        <div className="content-card">
          <h2>Error Loading Map</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={regenerateMap}>
            Regenerate Map
          </button>
          <button className="secondary-button" onClick={() => window.location.reload()}>
            Reload Page
          </button>
          {mapDebugInfo && (
            <pre className="debug-info">{mapDebugInfo}</pre>
          )}
        </div>
      </div>
    );
  }

  // Prepare iframe src with cache-busting strategy that won't cause flickering
  const iframeSrc = `${getApiUrl('/api/map')}?stable=true&r=${mapKey}&showControls=true&alwaysShowControls=true&forceControlPosition=true&hideMSA=true&disableSearch=true&disableExport=true&hideExport=true&noExport=true&exportButton=false&responsive=true&containerWidth=${containerDimensions.width}&containerHeight=${containerDimensions.height}`;

  return (
    <div className="map-container">
      {isLoading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        key={mapKey}
        src={iframeSrc}
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allowFullScreen
        loading="eager"
        importance="high"
        sandbox="allow-scripts allow-same-origin"
      />
      
      {mapDebugInfo && (
        <div className="map-debug">
          <details>
            <summary>Debug Info</summary>
            <pre>{mapDebugInfo}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default MapViewer; 