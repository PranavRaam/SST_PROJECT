import { getApiUrl } from '../config';
import westPGData from '../assets/data/west_pg_data.json';
import centralPGData from '../assets/data/central_pg_data.json';
import eastCentralPGData from '../assets/data/east_central_pg_data.json';
import combinedData from '../assets/data/combined_data.json';

// Cache for provider data to avoid unnecessary API calls
const providerDataCache = {};

// Count PGs from the raw data sources to match listing
export const countPGsFromRawData = (area) => {
  if (!area) return 0;
  
  // Get PGs from JSON files - same logic as in PGListingTable
  const westPGs = westPGData.West[area] || [];
  const centralPGs = centralPGData.Central[area] || [];
  const eastCentralPGs = eastCentralPGData.East_Central[area] || [];
  
  // Combine PGs from all regions
  const allPGs = [...westPGs, ...centralPGs, ...eastCentralPGs];
  
  return allPGs.length;
};

// Count HHAHs from the raw data to match listing
export const countHHAHsFromRawData = (area) => {
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
  
  return filtered.length;
};

/**
 * Fetches PG and HHAH data for a specified statistical area from the API
 * 
 * @param {string} statisticalArea - The name of the statistical area to fetch data for
 * @returns {Promise<Object>} - Object containing PG and HHAH counts and data
 */
export const fetchProviderData = async (statisticalArea) => {
  try {
    // Return cached data if available (and not older than 5 minutes)
    const cacheKey = statisticalArea.toLowerCase();
    const cachedData = providerDataCache[cacheKey];
    const cacheExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (cachedData && (Date.now() - cachedData.timestamp < cacheExpiryTime)) {
      console.log(`Using cached provider data for area: ${statisticalArea}`);
      return cachedData.data;
    }
    
    console.log(`Fetching provider data for area: ${statisticalArea}`);
    
    // Get counts directly from the raw data sources
    const pgCount = countPGsFromRawData(statisticalArea);
    const hhahCount = countHHAHsFromRawData(statisticalArea);
    
    // Create validated data object
    const validatedData = {
      pgCount: pgCount,
      hhahCount: hhahCount,
      pgData: [], // We don't need the detailed data here
      hhahData: [], // We don't need the detailed data here
      area: statisticalArea
    };
    
    console.log(`Provider data collected for ${statisticalArea}:`, {
      pgCount: validatedData.pgCount,
      hhahCount: validatedData.hhahCount
    });
    
    // Cache the data
    providerDataCache[cacheKey] = {
      data: validatedData,
      timestamp: Date.now()
    };
    
    return validatedData;
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
    // Get counts directly from the raw data sources
    const pgCount = countPGsFromRawData(statisticalArea);
    const hhahCount = countHHAHsFromRawData(statisticalArea);
    
    // Calculate estimated patient numbers based on provider counts
    // This is a placeholder calculation - adjust based on business logic
    const avgPatientsPerPG = 100;
    const avgPatientsPerHHAH = 150;
    const patientCount = (pgCount * avgPatientsPerPG) + (hhahCount * avgPatientsPerHHAH);
    
    // Calculate estimated outcomes based on patient count
    const activeOutcomesEstimate = Math.round(patientCount * 0.15);
    
    const stats = {
      patients: patientCount,
      physicianGroups: pgCount,
      agencies: hhahCount,
      activeOutcomes: activeOutcomesEstimate
    };
    
    console.log(`Statistics for ${statisticalArea}:`, stats);
    return stats;
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
    // Get counts directly from the raw data sources
    const pgCount = countPGsFromRawData(statisticalArea);
    const hhahCount = countHHAHsFromRawData(statisticalArea);
    
    // Check if the URL already has query parameters
    const hasParams = mapUrl.includes('?');
    const separator = hasParams ? '&' : '?';
    
    // Add provider counts to ensure the map displays the correct number
    const providerParams = [
      `display_pgs=${pgCount > 0 ? 'true' : 'false'}`,
      `display_hhahs=${hhahCount > 0 ? 'true' : 'false'}`,
      `pg_count=${pgCount}`,
      `hhah_count=${hhahCount}`,
      `marker_source=listing`,
      `clear_mock_markers=true`,
      `use_exact_count=true`
    ];
    
    // Special handling for areas with known issues
    if (statisticalArea.toLowerCase().includes('new york') || 
        statisticalArea.toLowerCase().includes('boston') ||
        statisticalArea.toLowerCase().includes('lubbock')) {
      providerParams.push('spread_markers=true');
      providerParams.push('marker_size=large');
      providerParams.push('force_accurate_markers=true');
      providerParams.push('no_mock_data=true');
    }
    
    // Add timestamp to break cache if needed
    providerParams.push(`timestamp=${Date.now()}`);
    
    // Append parameters to show providers on the map
    return `${mapUrl}${separator}${providerParams.join('&')}`;
  } catch (error) {
    console.error('Error updating map URL with provider data:', error);
    return mapUrl;
  }
}; 