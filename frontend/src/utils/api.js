const getApiUrl = () => {
  // In development, use the proxy setup
  if (process.env.NODE_ENV === 'development') {
    return '';  // Empty string will use the proxy in package.json
  }
  // In production, use the Railway URL
  return 'https://skillsupply-production.up.railway.app';
};

export const API_URL = getApiUrl();