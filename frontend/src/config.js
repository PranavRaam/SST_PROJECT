export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (path) => {
  // For development
  if (import.meta.env.MODE === 'development') {
    return `http://localhost:5000${path}`;
  }
  
  // For production - use the environment variable
  // This needs to be set in your hosting environment to point to your Render backend URL
  return `https://sst-project.onrender.com${path}`;
};

// Modified to provide a more stable URL that won't cause flickering
export const getMapApiUrl = (path, options = {}) => {
  const baseUrl = getApiUrl(path);
  
  // Only add stable parameters that won't cause the iframe to reload unnecessarily
  const params = new URLSearchParams({
    stable: 'true',
    stableView: 'true',
    ...options
  });
  
  // Only add a timestamp if explicitly requested via options
  if (options.forceRefresh) {
    params.set('t', new Date().getTime());
  }
  
  return `${baseUrl}?${params.toString()}`;
}; 