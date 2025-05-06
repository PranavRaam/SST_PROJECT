import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../config'; // Import the API URL helper
import './StatisticalAreaDetailView.css';
import { getAreaStatistics, getMapUrlWithProviders, countPGsFromRawData, countHHAHsFromRawData } from '../utils/providerDataService';

// Import components from local sa_view_components
import MapPlaceholder from './sa_view_components/MapPlaceholder';
import NavigationButtons from './sa_view_components/NavigationButtons';
import Listings from './sa_view_components/Listings';
import ChartsSection from './sa_view_components/ChartsSection';
import VivIntegratedServicesStatusMatrix from './sa_view_components/VivIntegratedServicesStatusMatrix';
import { FunnelDataProvider } from './sa_view_components/FunnelDataContext';
import ProviderCountOverlay from './sa_view_components/ProviderCountOverlay';

// Import CSS files
import './sa_view_css/MapPlaceholder.css';
import './sa_view_css/NavigationButtons.css';
import './sa_view_css/Listings.css';
import './sa_view_css/PGListingTable.css';
import './sa_view_css/HHAHListingTable.css';
import './sa_view_css/ChartsSection.css';
import './sa_view_css/PieChart.css';
import './sa_view_css/PGFunnel.css';
import './sa_view_css/HHAHFunnel.css';

const StatisticalAreaDetailView = ({ statisticalArea, divisionalGroup, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mapUrl, setMapUrl] = useState('');
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [dataStatus, setDataStatus] = useState('unknown'); // 'unknown', 'loading', 'cached', 'downloading'
  const [stats, setStats] = useState({
    patients: 0,
    physicianGroups: 0,
    agencies: 0,
    activeOutcomes: 0
  });
  const [agencies, setAgencies] = useState([]);
  const iframeRef = useRef(null);

  // Debug log when component mounts or updates
  useEffect(() => {
    console.log('StatisticalAreaDetailView rendered with:', {
      statisticalArea,
      divisionalGroup
    });
  }, [statisticalArea, divisionalGroup]);

  // Load the area statistics data
  useEffect(() => {
    const loadAreaStatistics = async () => {
      try {
        console.log(`Loading statistics for area: ${statisticalArea}`);
        
        // Calculate statistics for this area using our new service
        const areaStats = await getAreaStatistics(statisticalArea);
        console.log(`Statistics for ${statisticalArea}:`, areaStats);
        setStats(areaStats);
      } catch (error) {
        console.error('Error loading area statistics:', error);
      }
    };
    
    loadAreaStatistics();
  }, [statisticalArea]);

  useEffect(() => {
    // Check data cache status first
    const checkDataCache = async () => {
      try {
        const healthCheckUrl = getApiUrl('/api/health');
        console.log(`Checking server health and data cache status: ${healthCheckUrl}`);
        
        const healthResponse = await fetch(healthCheckUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {'Accept': 'application/json'},
          timeout: 5000
        });
        
        if (healthResponse.ok) {
          const health = await healthResponse.json();
          console.log('Server health check passed:', health);
          
          if (health.data_cache_exists && health.cached_data_files > 0) {
            // Data is already cached
            setDataStatus('cached');
          } else {
            // Need to start data preloading
            setDataStatus('downloading');
            console.log('Starting data preloading...');
            await fetch(getApiUrl('/api/preload-data'), {
              method: 'GET',
              mode: 'cors',
              headers: {'Accept': 'application/json'}
            });
          }
        }
      } catch (err) {
        console.warn('Health check error:', err);
        // Continue anyway
      }
    };

    // Check if the API for the zoomed map is accessible
    const checkMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setUseFallbackMap(false);
        
        // First check server health and data cache status
        await checkDataCache();
        
        // Encode the statistical area name for URL
        const encodedArea = encodeURIComponent(statisticalArea);
        console.log(`Requesting map for ${encodedArea}`);
        
        // Special handling for specific areas with known issues
        const isAnchorage = statisticalArea.toLowerCase().includes('anchorage');
        const isBoston = statisticalArea.toLowerCase().includes('boston');
        const isNewYork = statisticalArea.toLowerCase().includes('new york');
        
        // For areas with zero providers, use a simplified map to avoid confusing markers
        const pgCount = countPGsFromRawData(statisticalArea);
        const hhahCount = countHHAHsFromRawData(statisticalArea);
        const hasNoProviders = pgCount === 0 && hhahCount === 0;
        
        // Optimize map loading: prefer cached maps, reduce quality for faster loading
        const timestamp = new Date().getTime();
        // Use a lighter weight map with less detail for faster loading
        const isLubbock = statisticalArea.toLowerCase().includes('lubbock');
        
        // Base URL with standard parameters
        let apiUrl = getApiUrl(`/api/statistical-area-map/${encodedArea}`);
        
        // Add query parameters
        const queryParams = [
          // Force regeneration for specific areas for better marker placement
          `force_regen=${isAnchorage || isLubbock || isBoston || isNewYork ? 'true' : 'false'}`,
          `use_cached=true`,
          `detailed=false`,
          `zoom=${isAnchorage ? '7' : '10'}`,
          `exact_boundary=true`,
          `display_pgs=${pgCount > 0 ? 'true' : 'false'}`,
          `display_hhahs=${hhahCount > 0 ? 'true' : 'false'}`,
          `pg_count=${pgCount}`,
          `hhah_count=${hhahCount}`,
          `lightweight=true`,
          `spread_markers=${isLubbock || isNewYork ? 'true' : 'false'}`,
          `clear_mock_markers=true`,
          `use_exact_count=true`,
          `provider_source=actual_data`,
          `t=${timestamp}`
        ];
        
        // If New York or similar areas with display issues, add extra parameters
        if (isNewYork) {
          queryParams.push('force_accurate_markers=true');
          queryParams.push('no_mock_data=true');
          queryParams.push('marker_size=large');
        }
        
        // Combine URL with parameters
        apiUrl = `${apiUrl}?${queryParams.join('&')}`;
        
        try {
          // Attempt to fetch the map with a timeout
          console.log(`Initial request URL: ${apiUrl}`);
          
          // Update the URL to include provider data
          apiUrl = await getMapUrlWithProviders(statisticalArea, apiUrl);
          console.log(`Updated URL with provider data: ${apiUrl}`);
          
          // Set up fetch with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for map generation
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {'Accept': 'text/html'},
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Map request failed with status: ${response.status}`);
          }
          
          // Set the URL directly
          setMapUrl(apiUrl);
          setIsLoading(false);
          
        } catch (initialError) {
          console.warn(`Initial fetch attempt failed: ${initialError.message}`);
          
          // For Anchorage, try direct fallback right away
          if (isAnchorage) {
            console.log("Area is Anchorage, using static fallback immediately");
            const fallbackUrl = getApiUrl(`/api/static-fallback-map/${encodedArea}`);
            setMapUrl(fallbackUrl);
            setUseFallbackMap(true);
            setIsLoading(false);
            return;
          }
          
          // First try direct embedding
          console.log("Falling back to direct iframe embedding");
          setMapUrl(apiUrl);
          
          // Set a timer to check if the iframe load fails and switch to fallback
          const fallbackTimer = setTimeout(() => {
            if (isLoading) {
              console.log("Direct embedding timeout reached, switching to static fallback map");
              const fallbackUrl = getApiUrl(`/api/static-fallback-map/${encodedArea}`);
              setMapUrl(fallbackUrl);
              setUseFallbackMap(true);
            }
          }, 8000); // Wait 8 seconds before switching to fallback
          
          return () => clearTimeout(fallbackTimer);
        }
      } catch (err) {
        console.error(`Error loading map: ${err.message}`);
        setError(err.message);
        setIsLoading(false);
        
        // Try to load the fallback static map as last resort
        const encodedArea = encodeURIComponent(statisticalArea);
        const fallbackUrl = getApiUrl(`/api/static-fallback-map/${encodedArea}`);
        setMapUrl(fallbackUrl);
        setUseFallbackMap(true);
      }
    };

    // Start loading map with a short delay to prioritize UI rendering
    const timer = setTimeout(() => {
      checkMap();
    }, 100);
    
    // Setup event listener for cross-origin messaging from the map iframe
    const handleMapMessage = (event) => {
      // Check for mapLoaded message from iframe
      if (event.data && event.data.type === 'mapLoaded') {
        console.log('Received map loaded message from iframe:', event.data);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMapMessage);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMapMessage);
    };
  }, [statisticalArea, retryCount]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('Map iframe loaded successfully');
  };

  const handleIframeError = (e) => {
    console.error('Map iframe failed to load', e);
    setError('The map could not be loaded. Please try again.');
    setIsLoading(false);
    
    // Log detailed info about the error
    console.error('Map loading error details:', {
      area: statisticalArea,
      url: mapUrl,
      errorType: e.type,
      errorMessage: e.message
    });
  };

  // Add retry functionality for Content-Length mismatch errors
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Monitor for loading errors that might not trigger onError
      const checkIframeStatus = () => {
        try {
          // Try to access the content document - will throw CORS error if load failed
          if (iframe.contentDocument) {
            // Successfully accessed document, no need for retry
            return;
          }
        } catch (e) {
          // Likely CORS error or other loading issue
          console.log("Unable to access iframe content, might need retry", e);
        }
        
        // Add timestamp to URL to prevent caching
        if (mapUrl) {
          const hasTimestamp = mapUrl.includes('t=');
          const separator = mapUrl.includes('?') ? '&' : '?';
          const newUrl = hasTimestamp 
            ? mapUrl.replace(/t=\d+/, `t=${Date.now()}`) 
            : `${mapUrl}${separator}t=${Date.now()}`;
          
          console.log("Refreshing map iframe with new URL", newUrl);
          iframe.src = newUrl;
        }
      };
      
      // Check status after a reasonable loading time
      const timeoutId = setTimeout(checkIframeStatus, 10000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mapUrl, iframeRef]);

  const handleRetry = () => {
    // Force regeneration by incrementing retry count
    setRetryCount(retryCount + 1);
    
    // Also clear any cached URL by forcing a new timestamp
    if (mapUrl) {
      const timestamp = Date.now();
      const newUrl = mapUrl.includes('t=') 
        ? mapUrl.replace(/t=\d+/, `t=${timestamp}`) 
        : `${mapUrl}${mapUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
      
      // Force regeneration parameter 
      const forceRegenUrl = newUrl.includes('force_regen=') 
        ? newUrl.replace(/force_regen=(true|false)/, 'force_regen=true')
        : `${newUrl}&force_regen=true`;
        
      setMapUrl(forceRegenUrl);
    }
  };

  // Get color for metric cards
  const getMetricColor = (metric) => {
    const colors = {
      patients: '#4F46E5',
      physicianGroups: '#0EA5E9',
      agencies: '#10B981',
      activeOutcomes: '#F59E0B'
    };
    return colors[metric] || '#6B7280';
  };

  // Labels for the metrics
  const metricLabels = {
    patients: 'Patients',
    physicianGroups: 'Physician Groups',
    agencies: 'Agencies',
    activeOutcomes: 'Active Outcomes'
  };

  // Render the appropriate map loading state message
  const renderLoadingMessage = () => {
    if (dataStatus === 'downloading') {
      return (
        <>
          <p>Downloading map data for {statisticalArea}...</p>
          <p className="map-loading-info">This is a one-time download and may take a minute. Future maps will load faster.</p>
        </>
      );
    } else if (useFallbackMap) {
      return (
        <>
          <p>Loading simplified map of {statisticalArea}...</p>
          <p className="map-loading-info">Using simplified view for faster loading</p>
        </>
      );
    } else {
      return (
        <>
          <p>Loading map of {statisticalArea}...</p>
          <p className="map-loading-info">This may take a few seconds</p>
        </>
      );
    }
  };

  if (error) {
    return (
      <div className="statistical-area-view">
        <div className="detail-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Region View
          </button>
          <h2>{statisticalArea}</h2>
          <div className="area-divisional-group">
            <span>Part of {divisionalGroup} Division</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="metric-cards">
          {Object.entries(stats).map(([key, value]) => (
            <div 
              key={key} 
              className="metric-card"
              style={{ borderColor: getMetricColor(key) }}
            >
              <div className="metric-icon" style={{ backgroundColor: getMetricColor(key) }}>
                {key === 'patients' && '👥'}
                {key === 'physicianGroups' && '👨‍⚕️'}
                {key === 'agencies' && '🏢'}
                {key === 'activeOutcomes' && '📈'}
              </div>
              <div className="metric-content">
                <h3>{metricLabels[key]}</h3>
                <p className="metric-value">{formatNumber(value)}</p>
                <p className="metric-subtext">Total in {statisticalArea}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map container with MapPlaceholder for error state */}
        <div className="area-map-container">
          <h3>Map View of {statisticalArea}</h3>
          <div className="area-map-wrapper" style={{ position: 'relative' }}>
            <MapPlaceholder statisticalArea={statisticalArea} />
            <div className="map-error-overlay">
              <button className="retry-button" onClick={handleRetry}>
                Retry Loading Map
              </button>
            </div>
          </div>
          <div className="area-map-info">
            <p>The highlighted area shows the boundaries of {statisticalArea}. Use the zoom controls to explore further.</p>
          </div>
        </div>
        
        {/* Wrap the integration content with the FunnelDataProvider */}
        <FunnelDataProvider initialArea={statisticalArea}>
          <div className="sa-view-integration">
            {/* Navigation buttons for PG and HHAH services */}
            <NavigationButtons />
            
            {/* Viv Integrated Services Statistics table */}
            <VivIntegratedServicesStatusMatrix />
            
            {/* Listings section with tables */}
            <Listings />
            
            {/* Charts section with PieChart, PGFunnel, and HHAHFunnel */}
            <ChartsSection />
          </div>
        </FunnelDataProvider>
      </div>
    );
  }

  return (
    <div className="statistical-area-view">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Region View
        </button>
        <h2>{statisticalArea}</h2>
        <div className="area-divisional-group">
          <span>Part of {divisionalGroup} Division</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="metric-cards">
        {Object.entries(stats).map(([key, value]) => (
          <div 
            key={key} 
            className="metric-card"
            style={{ borderColor: getMetricColor(key) }}
          >
            <div className="metric-icon" style={{ backgroundColor: getMetricColor(key) }}>
              {key === 'patients' && '👥'}
              {key === 'physicianGroups' && '👨‍⚕️'}
              {key === 'agencies' && '🏢'}
              {key === 'activeOutcomes' && '📈'}
            </div>
            <div className="metric-content">
              <h3>{metricLabels[key]}</h3>
              <p className="metric-value">{formatNumber(value)}</p>
              <p className="metric-subtext">Total in {statisticalArea}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div className="map-container">
        {isLoading ? (
          renderLoadingMessage()
        ) : error ? (
          <div className="map-error">
            <p>{error}</p>
            <button onClick={handleRetry}>Retry Loading Map</button>
          </div>
        ) : mapUrl ? (
          <div className="responsive-iframe-container">
            <iframe 
              ref={iframeRef}
              src={mapUrl}
              title={`Map of ${statisticalArea}`}
              className="map-iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
              loading="lazy"
            />
            {/* Add provider count overlay on top of the iframe - ensure it uses the same data source as listings */}
            <FunnelDataProvider initialArea={statisticalArea}>
              <ProviderCountOverlay statisticalArea={statisticalArea} />
            </FunnelDataProvider>
          </div>
        ) : (
          // Fallback to a placeholder if no map URL is available - ensure it uses the same data source as listings
          <FunnelDataProvider initialArea={statisticalArea}>
            <MapPlaceholder statisticalArea={statisticalArea} />
          </FunnelDataProvider>
        )}
      </div>

      {/* Main content area */}
      <div className="main-content-area">
        {/* Integrated services section will go here */}
        <FunnelDataProvider initialArea={statisticalArea}>
          <div className="sa-view-integration">
            {/* Navigation buttons for PG and HHAH services */}
            <NavigationButtons />
            
            {/* Viv Integrated Services Statistics table */}
            <VivIntegratedServicesStatusMatrix />
            
            {/* Listings section with tables */}
            <Listings />
            
            {/* Charts section with PieChart, PGFunnel, and HHAHFunnel */}
            <ChartsSection />
          </div>
        </FunnelDataProvider>
      </div>
    </div>
  );
};

export default StatisticalAreaDetailView; 