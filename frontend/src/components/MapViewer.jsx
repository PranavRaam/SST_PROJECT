import { useState, useEffect, useRef } from 'react';
import { getApiUrl, getMapApiUrl } from '../config';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapDebugInfo, setMapDebugInfo] = useState(null);
  const iframeRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const [mapKey, setMapKey] = useState(`map-${Date.now()}`); // Stable key for iframe
  const [showLayerControls, setShowLayerControls] = useState(true);

  useEffect(() => {
    const checkMap = async () => {
      try {
        // First check API health
        const healthResponse = await fetch(getApiUrl('/api/health'));
        if (!healthResponse.ok) {
          throw new Error('API health check failed');
        }
        const healthData = await healthResponse.json();
        setMapDebugInfo(`API Status: ${JSON.stringify(healthData)}`);
        
        // Then check map status
        const response = await fetch(getApiUrl('/api/map-status'));
        if (!response.ok) {
          throw new Error('Map status check failed');
        }
        
        const data = await response.json();
        setMapDebugInfo(prev => `${prev}\nMap Status: ${JSON.stringify(data)}`);
        
        if (!data.exists) {
          // Try to generate the map
          setMapDebugInfo(prev => `${prev}\nMap not found, attempting to generate...`);
          const genResponse = await fetch(getApiUrl('/api/generate-map'));
          const genData = await genResponse.json();
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

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);
  
  // Function to hide Metropolitan Statistical Areas in the legend
  const hideMSAElements = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        // First approach: Try using iframe's contentDocument directly
        setTimeout(() => {
          // Hide the Metropolitan Statistical Areas section in the legend
          const legendItems = iframe.contentDocument.querySelectorAll('.leaflet-control-layers-overlays label');
          legendItems.forEach(item => {
            if (item.textContent.includes('Metropolitan') || 
                item.textContent.includes('MSA') || 
                item.textContent.includes('Statistical Area')) {
              item.style.display = 'none';
            }
          });
        }, 1500);
        
        // Second approach: Also send a message to the iframe
        iframe.contentWindow.postMessage({
          type: 'HIDE_MSA_ELEMENTS',
          data: { hide: true }
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
            hideMSA: true
          }
        }, '*');
      }
    } catch (e) {
      console.error('[Map Controls] Failed to initialize controls:', e);
    }
  };

  const handleIframeLoad = () => {
    // When iframe loads, inject necessary variables
    console.log('[Map Diagnostic] Iframe onLoad event fired');
    setMapDebugInfo(prev => `${prev}\nIframe onLoad event fired`);
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        console.log('[Map Diagnostic] Sending MAP_INIT message to iframe');
        iframe.contentWindow.postMessage({
          type: 'MAP_INIT',
          data: {
            show_states: true,
            show_counties: true,
            show_msas: false,
            enableControls: true,
            enableSearch: false,
            hideMSA: true
          }
        }, '*');
        setMapDebugInfo(prev => `${prev}\nMAP_INIT message sent to iframe`);
        
        // Also try hiding MSA elements directly after iframe has loaded
        setTimeout(() => {
          hideMSAElements();
          hideSearchControl();
          
          // Inject the hide-msa.js script into the iframe
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const scriptElement = iframeDoc.createElement('script');
            scriptElement.src = '/hide-msa.js';
            scriptElement.type = 'text/javascript';
            scriptElement.async = true;
            iframeDoc.head.appendChild(scriptElement);
            console.log('[Map Diagnostic] Injected hide-msa.js script');
            setMapDebugInfo(prev => `${prev}\nInjected hide-msa.js script into iframe`);
          } catch (e) {
            console.error('[Map Diagnostic] Failed to inject hide-msa.js script:', e);
            setMapDebugInfo(prev => `${prev}\nError injecting script: ${e.message}`);
          }
        }, 2000);
      }
    } catch (e) {
      console.log('[Map Diagnostic] Failed to initialize map:', e);
      setMapDebugInfo(prev => `${prev}\nError initializing map: ${e.message}`);
    }
    
    setIsLoading(false);
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
      // Force regeneration with cache bypass
      const genResponse = await fetch(getApiUrl('/api/generate-map?force=true'));
      const genData = await genResponse.json();
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
  const iframeSrc = `${getApiUrl('/api/map')}?stable=true&r=${mapKey}&showControls=true&alwaysShowControls=true&forceControlPosition=true&hideMSA=true&disableSearch=true`;

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