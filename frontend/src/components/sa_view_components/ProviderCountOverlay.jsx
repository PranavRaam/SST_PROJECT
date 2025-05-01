import React, { useState, useEffect } from 'react';
import { fetchProviderData } from '../../utils/providerDataService';
import '../sa_view_css/ProviderCountOverlay.css';

/**
 * Component to display provider counts as an overlay on the map
 * @param {Object} props - Component props
 * @param {string} props.statisticalArea - The name of the statistical area
 */
const ProviderCountOverlay = ({ statisticalArea }) => {
  const [providerData, setProviderData] = useState({
    pgCount: 0,
    hhahCount: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadProviderData = async () => {
      try {
        const data = await fetchProviderData(statisticalArea);
        setProviderData({
          pgCount: data.pgCount,
          hhahCount: data.hhahCount,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading provider data for overlay:', error);
        setProviderData({
          pgCount: 0,
          hhahCount: 0,
          isLoading: false,
          error: 'Failed to load provider data'
        });
      }
    };

    loadProviderData();
  }, [statisticalArea]);

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
        <div className="provider-count-error">Unable to load provider data</div>
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
      </div>
    </div>
  );
};

export default ProviderCountOverlay; 