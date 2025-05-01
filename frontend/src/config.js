export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (path) => {
  // For development
  if (import.meta.env.MODE === 'development') {
    return `http://localhost:5000${path}`;
  }
  
  // For production - use the environment variable or fallback to the Render domain
  // This needs to be set in your hosting environment to point to your Render backend URL
  const baseUrl = import.meta.env.VITE_API_URL || 'https://sst-project.onrender.com';
  return `${baseUrl}${path}`;
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

// Add a fetch wrapper with error handling for CORS issues
export const fetchWithCORSHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'include', // Include credentials in the request
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('CORS or Fetch Error:', error);
    
    // For CORS errors, try again without credentials
    if (error.message && error.message.includes('CORS')) {
      console.log('Trying again without credentials...');
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
          },
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (fallbackError) {
        console.error('Fallback request failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}; 