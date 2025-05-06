import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import westPGData from '../../assets/data/west_pg_data.json';
import centralPGData from '../../assets/data/central_pg_data.json';
import eastCentralPGData from '../../assets/data/east_central_pg_data.json';
import combinedData from '../../assets/data/combined_data.json';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/ProviderCountOverlay.css';

/**
 * Component to display provider counts as an overlay on the map
 * @param {Object} props - Component props
 * @param {string} props.statisticalArea - The name of the statistical area
 */
const ProviderCountOverlay = ({ statisticalArea }) => {
  const { 
    pgAssignments,
    hhahAssignments 
  } = useContext(FunnelDataContext);
  
  const [providerData, setProviderData] = useState({
    pgCount: 0,
    hhahCount: 0,
    isLoading: true,
    error: null,
    lastUpdated: null
  });
  
  // Reference to keep track of whether the component is mounted
  const isMounted = useRef(true);
  
  // Count PGs from the raw data sources to match listing
  const countPGsFromRawData = useCallback((area) => {
    if (!area) return 0;
    
    // Get PGs from JSON files - same logic as in PGListingTable
    const westPGs = westPGData.West[area] || [];
    const centralPGs = centralPGData.Central[area] || [];
    const eastCentralPGs = eastCentralPGData.East_Central[area] || [];
    
    // Combine PGs from all regions
    const allPGs = [...westPGs, ...centralPGs, ...eastCentralPGs];
    
    // Also add any PGs from the funnel data (newly added PGs)
    const assignedPGs = Object.values(pgAssignments || {}).flat();
    const totalCount = allPGs.length + (assignedPGs.length > 0 ? assignedPGs.length - allPGs.length : 0);
    
    // Make sure we never return a negative number
    return Math.max(0, totalCount);
  }, [pgAssignments]);
  
  // Count HHAHs from the raw data to match listing
  const countHHAHsFromRawData = useCallback((area) => {
    if (!area) return 0;
    
    // Extract all HHAH data from the nested structure - same logic as in HHAHListingTable
    const allHHAHData = [
      ...(combinedData.West_Details || []),
      ...(combinedData.East_Central_Details || []),
      ...(combinedData.Central_Details || [])
    ];
    
    // Filter the data based on Metropolitan (or Micropolitan) Area
    const filtered = allHHAHData.filter(item => {
      const itemArea = item['Metropolitan (or Micropolitan) Area']?.toLowerCase() || '';
      const selectedArea = area.toLowerCase();
      return itemArea === selectedArea;
    });
    
    // Also add any HHAHs from the funnel data (newly added HHAHs)
    const assignedHHAHs = Object.values(hhahAssignments || {}).flat();
    const totalCount = filtered.length + (assignedHHAHs.length > 0 ? assignedHHAHs.length - filtered.length : 0);
    
    // Make sure we never return a negative number
    return Math.max(0, totalCount);
  }, [hhahAssignments]);
  
  // Force refresh of data
  const refreshData = async () => {
    if (!statisticalArea || !isMounted.current) return;
    
    setProviderData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get counts from the same sources as the listing tables
      const pgCount = countPGsFromRawData(statisticalArea);
      const hhahCount = countHHAHsFromRawData(statisticalArea);
      
      if (isMounted.current) {
        setProviderData({
          pgCount,
          hhahCount,
          isLoading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error refreshing provider data for overlay:', error);
      if (isMounted.current) {
        setProviderData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to refresh provider data'
        }));
      }
    }
  };

  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    const loadProviderData = async () => {
      if (!statisticalArea) return;
      
      try {
        // Get counts from the same sources as the listing tables
        const pgCount = countPGsFromRawData(statisticalArea);
        const hhahCount = countHHAHsFromRawData(statisticalArea);
        
        if (isMounted.current) {
          setProviderData({
            pgCount,
            hhahCount,
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading provider data for overlay:', error);
        if (isMounted.current) {
          setProviderData({
            pgCount: 0,
            hhahCount: 0,
            isLoading: false,
            error: 'Failed to load provider data',
            lastUpdated: null
          });
        }
      }
    };

    loadProviderData();
    
    // Set up a periodic refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      loadProviderData();
    }, 60000); // 60 seconds
    
    // Clean up the interval and set isMounted to false when component unmounts
    return () => {
      clearInterval(refreshInterval);
      isMounted.current = false;
    };
  }, [statisticalArea, countPGsFromRawData, countHHAHsFromRawData, pgAssignments, hhahAssignments]);

  if (providerData.isLoading) {
    return (
      <div className="provider-count-overlay loading">
        <div className="provider-count-spinner"></div>
      </div>
    );
  }

  if (providerData.error) {
    return (
      <div className="provider-count-overlay error">
        <div className="provider-count-error">
          Unable to load provider data
          <button className="retry-button" onClick={refreshData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-count-overlay">
      <div className="provider-count-container">
        <div className="provider-count pg-count">
          <div className="provider-count-icon pg-icon"></div>
          <div className="provider-count-text">
            <span className="provider-count-number">{providerData.pgCount}</span>
            <span className="provider-count-label">Physician Groups</span>
          </div>
        </div>
        <div className="provider-count hhah-count">
          <div className="provider-count-icon hhah-icon"></div>
          <div className="provider-count-text">
            <span className="provider-count-number">{providerData.hhahCount}</span>
            <span className="provider-count-label">Home Health Agencies</span>
          </div>
        </div>
        <div className="refresh-container">
          <button 
            className="refresh-button" 
            onClick={refreshData} 
            title="Refresh provider data"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCountOverlay; 