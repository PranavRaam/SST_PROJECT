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

// Add map parameters to prevent caching and improve stability`
export const getMapApiUrl = (path, options = {}) => {
  const baseUrl = getApiUrl(path);
  const timestamp = new Date().getTime();
  const params = new URLSearchParams({
    t: timestamp,
    noCache: 'true',
    stableView: 'true',
    ...options
  });
  
  return `${baseUrl}?${params.toString()}`;
}; 