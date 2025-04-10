/**
 * This file contains mappings and utilities to handle mismatches between 
 * statistical area names in the application and in the CSV data
 */

// Mapping of application statistical area names to CSV statistical area names
const areaNameMapping = {
  // West region mappings based on the CSV data
  'El Paso': 'El Paso',
  'Denver': 'Denver–Aurora–Lakewood',
  'Denver-Aurora-Lakewood': 'Denver–Aurora–Lakewood',
  'Colorado Springs': 'Colorado Springs',
  'Pueblo': 'Pueblo',
  'Boulder': 'Boulder',
  'Fort Collins': 'Fort Collins–Loveland',
  'Fort Collins-Loveland': 'Fort Collins–Loveland',
  'Lubbock': 'Lubbock',
  'Amarillo': 'Amarillo',
  'Phoenix': 'Phoenix–Mesa–Scottsdale',
  'Phoenix-Mesa-Scottsdale': 'Phoenix–Mesa–Scottsdale',
  'Las Vegas': 'Las Vegas–Henderson–Paradise',
  'Las Vegas-Henderson-Paradise': 'Las Vegas–Henderson–Paradise',
  'Los Angeles': 'Los Angeles–Long Beach–Anaheim',
  'Los Angeles-Long Beach-Anaheim': 'Los Angeles–Long Beach–Anaheim',
  'Santa Barbara': 'Santa Barbara',
  'McAllen': 'McAllen–Edinburg–Mission',
  'McAllen-Edinburg-Mission': 'McAllen–Edinburg–Mission',
  'Pampa': 'Pampa Micropolitan Statistical Area',
  'Fort Morgan': 'Fort Morgan Micropolitan Statistical Area',
  'Clovis': 'Clovis Micropolitan Statistical Area',
  'Cleveland': 'Cleveland–Elyria',
  'Cleveland-Elyria': 'Cleveland–Elyria',
  'Sterling': 'Sterling Micropolitan Statistical Area',
  'Broomfield': 'Broomfield',
  'Greeley': 'Greeley',
  'Levelland': 'Levelland Micropolitan Statistical Area',
  'Dallas': 'Dallas–Fort Worth–Arlington',
  'Dallas-Fort Worth-Arlington': 'Dallas–Fort Worth–Arlington',
  'New York': 'New York–Newark–Jersey City',
  'New York-Newark-Jersey City': 'New York–Newark–Jersey City',
  'Chicago': 'Chicago–Naperville–Elgin',
  'Chicago-Naperville-Elgin': 'Chicago–Naperville–Elgin',
  
  // General mappings for common variations
  'Denver Metro': 'Denver–Aurora–Lakewood',
  'Denver Metro Area': 'Denver–Aurora–Lakewood',
  'Denver Metropolitan Area': 'Denver–Aurora–Lakewood',
  'Fort Collins-Loveland Metro': 'Fort Collins–Loveland',
  'Los Angeles Metro': 'Los Angeles–Long Beach–Anaheim',
  'LA Metro': 'Los Angeles–Long Beach–Anaheim'
};

/**
 * Maps a statistical area name used in the application to the corresponding name in the CSV data
 * @param {string} appAreaName - The statistical area name used in the application
 * @returns {string} - The corresponding name in the CSV data, or the original name if no mapping exists
 */
export const mapAreaName = (appAreaName) => {
  if (!appAreaName) return '';
  return areaNameMapping[appAreaName] || appAreaName;
};

/**
 * Gets all possible variations of an area name to try matching
 * @param {string} areaName - The area name to get variations for
 * @returns {string[]} - Array of possible area name variations to try
 */
export const getAreaNameVariations = (areaName) => {
  if (!areaName) return [];
  
  const variations = [areaName];
  
  // Add the mapped version if it exists
  const mappedName = mapAreaName(areaName);
  if (mappedName !== areaName) {
    variations.push(mappedName);
  }
  
  // Add variations with different dash types
  if (areaName.includes('-')) {
    variations.push(areaName.replace(/-/g, '–')); // en dash
    variations.push(areaName.replace(/-/g, '—')); // em dash
  }
  
  // Add variations with spaces instead of dashes
  if (areaName.includes('-')) {
    variations.push(areaName.replace(/-/g, ' '));
  }
  
  // Add variations without the Micropolitan/Metropolitan Statistical Area suffix
  if (areaName.includes('Micropolitan Statistical Area')) {
    variations.push(areaName.replace(' Micropolitan Statistical Area', ''));
  }
  if (areaName.includes('Metropolitan Statistical Area')) {
    variations.push(areaName.replace(' Metropolitan Statistical Area', ''));
  }
  
  return variations;
};

export default {
  mapAreaName,
  getAreaNameVariations
}; 