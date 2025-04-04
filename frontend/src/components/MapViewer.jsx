import { useState, useEffect, useRef } from 'react';
import { getApiUrl, getMapApiUrl } from '../config';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  useEffect(() => {
    const checkMap = async () => {
      try {
        const response = await fetch(getApiUrl('/api/map-status'));
        if (!response.ok) {
          throw new Error('Map could not be loaded');
        }
        
        const data = await response.json();
        if (!data.exists) {
          throw new Error('Map has not been generated yet');
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkMap();
    
    // Add window message event listener for iframe communication
    const handleIframeMessage = (event) => {
      // Check if message comes from our map
      if (event.data && event.data.type === 'mapLoaded') {
        setIsLoading(false);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      }
    };
    
    window.addEventListener('message', handleIframeMessage);

    // Set a timeout to force loading state to false if map takes too long
    loadTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const handleIframeLoad = () => {
    // When iframe loads, inject necessary variables
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'MAP_INIT',
          data: {
            show_states: true,
            show_counties: true,
            show_msas: true
          }
        }, '*');
      }
    } catch (e) {
      console.warn('Failed to initialize map:', e);
    }
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load the map. Please try refreshing the page.');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="map-error">
        <div className="content-card">
          <h2>Error Loading Map</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-banner">
        <h2>US Healthcare Regional Distribution</h2>
      </div>
      
      {isLoading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={`${getMapApiUrl('/api/map')}?t=${Date.now()}`}
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allowFullScreen
        loading="eager"
        importance="high"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
};

export default MapViewer; 