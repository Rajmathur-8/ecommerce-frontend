// Google Maps Configuration
// Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// Check if API key is properly configured
export const isGoogleMapsConfigured = () => {
  return GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
};

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places'],
  defaultCenter: { lat: 23.2599, lng: 77.4126 }, // Bhopal, Madhya Pradesh, India
  defaultZoom: 12,
};

// Instructions for setting up Google Maps API:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing one
// 3. Enable the following APIs:
//    - Maps JavaScript API
//    - Geocoding API
//    - Places API
// 4. Create credentials (API Key)
// 5. Add the API key to your .env.local file:
//    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
// 6. Restrict the API key to your domain for security
