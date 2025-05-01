import { getApiUrl } from '../config';

/**
 * Fetches PG and HHAH data for a specified statistical area from the API
 * 
 * @param {string} statisticalArea - The name of the statistical area to fetch data for
 * @returns {Promise<Object>} - Object containing PG and HHAH counts and data
 */
export const fetchProviderData = async (statisticalArea) => {
  try {
    console.log(`Fetching provider data for area: ${statisticalArea}`);
    
    // Encode the statistical area for use in URL
    const encodedArea = encodeURIComponent(statisticalArea);
    const url = getApiUrl(`/api/fetch-provider-data?area=${encodedArea}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch provider data: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Provider data received for ${statisticalArea}:`, {
      pgCount: data.pg_count,
      hhahCount: data.hhah_count
    });
    
    return {
      pgCount: data.pg_count,
      hhahCount: data.hhah_count,
      pgData: data.pg_data || [],
      hhahData: data.hhah_data || [],
      area: data.area
    };
  } catch (error) {
    console.error('Error fetching provider data:', error);
    // Return default/empty data on error
    return {
      pgCount: 0,
      hhahCount: 0,
      pgData: [],
      hhahData: [],
      area: statisticalArea
    };
  }
};

/**
 * Gets statistics for a statistical area based on provider data
 * 
 * @param {string} statisticalArea - The name of the statistical area
 * @returns {Promise<Object>} - Object containing statistics for the area
 */
export const getAreaStatistics = async (statisticalArea) => {
  try {
    const providerData = await fetchProviderData(statisticalArea);
    
    // Calculate estimated patient numbers based on provider counts
    // This is a placeholder calculation - adjust based on business logic
    const avgPatientsPerPG = 100;
    const avgPatientsPerHHAH = 150;
    const patientCount = (providerData.pgCount * avgPatientsPerPG) + (providerData.hhahCount * avgPatientsPerHHAH);
    
    // Calculate estimated outcomes based on patient count
    const activeOutcomesEstimate = Math.round(patientCount * 0.15);
    
    return {
      patients: patientCount,
      physicianGroups: providerData.pgCount,
      agencies: providerData.hhahCount,
      activeOutcomes: activeOutcomesEstimate
    };
  } catch (error) {
    console.error('Error getting area statistics:', error);
    return {
      patients: 0,
      physicianGroups: 0,
      agencies: 0,
      activeOutcomes: 0
    };
  }
};

/**
 * Updates the map display properties to show provider data
 * 
 * @param {string} statisticalArea - The name of the statistical area
 * @param {string} mapUrl - The current map URL
 * @returns {string} - Updated map URL with provider display parameters
 */
export const getMapUrlWithProviders = async (statisticalArea, mapUrl) => {
  try {
    // Fetch the provider data
    const providerData = await fetchProviderData(statisticalArea);
    
    // Only modify URL if we have provider data
    if (providerData.pgCount > 0 || providerData.hhahCount > 0) {
      // Check if the URL already has query parameters
      const hasParams = mapUrl.includes('?');
      const separator = hasParams ? '&' : '?';
      
      // Add provider counts to ensure the map displays the correct number
      const providerParams = [
        `display_pgs=true`,
        `display_hhahs=true`,
        `pg_count=${providerData.pgCount}`,
        `hhah_count=${providerData.hhahCount}`,
        `provider_source=actual_data`
      ];
      
      // Add additional parameters to ensure markers are properly distributed
      if (statisticalArea.toLowerCase() === 'lubbock') {
        providerParams.push('spread_markers=true');
        providerParams.push('marker_size=large');
      }
      
      // Add timestamp to break cache if needed
      providerParams.push(`timestamp=${Date.now()}`);
      
      // Append parameters to show providers on the map
      return `${mapUrl}${separator}${providerParams.join('&')}`;
    }
    
    return mapUrl;
  } catch (error) {
    console.error('Error updating map URL with provider data:', error);
    return mapUrl;
  }
}; 