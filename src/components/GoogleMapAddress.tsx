'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '@/lib/googleMapsConfig';

interface GoogleMapAddressProps {
  onAddressSelect: (addressData: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialAddress?: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface GoogleMap {
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, callback: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
}

interface GoogleMarker {
  addListener(arg0: string, arg1: (event: { latLng: { lat: () => number; lng: () => number; }; }) => void): unknown;
  setPosition: (position: { lat: number; lng: number }) => void;
  setMap: (map: GoogleMap | null) => void;
  getPosition: () => { lat: () => number; lng: () => number };
}

interface GoogleGeocoder {
  geocode: (request: { location?: { lat: number; lng: number }; address?: string }, callback: (results: GoogleGeocoderResult[], status: string) => void) => void;
}

interface GoogleGeocoderResult {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: { lat: () => number; lng: () => number };
  };
}

declare global {
  interface Window {
    google: {
      maps: {
        Animation: { DROP: string };
        Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
        Marker: new (options: Record<string, unknown>) => GoogleMarker;
        Geocoder: new () => GoogleGeocoder;
        LatLng: new (lat: number, lng: number) => { lat: () => number; lng: () => number };
        MapTypeId: { ROADMAP: string };
        places?: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: { country: string | string[] };
              fields?: string[];
            }
          ) => {
            getPlace: () => {
              formatted_address?: string;
              geometry?: {
                location: { lat: () => number; lng: () => number } | { lat: number; lng: number };
              };
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
            addListener: (event: string, callback: () => void) => void;
          };
        };
      };
    };
    initMap: () => void;
  }
}

export default function GoogleMapAddress({ onAddressSelect }: GoogleMapAddressProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [marker, setMarker] = useState<GoogleMarker | null>(null);
  const [geocoder, setGeocoder] = useState<GoogleGeocoder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  // Check if Google Maps API key is configured
  useEffect(() => {
    setIsConfigured(!!isGoogleMapsConfigured() ? true : false);
  }, []);

  // Helper function to extract address from Google Places components
  const extractAddressFromComponents = useCallback((components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>, formattedAddress: string) => {
    const addressData = {
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      latitude: 0,
      longitude: 0
    };

    // Extract all address components
    let streetNumber = '';
    let route = '';
    let sublocality = '';
    let sublocalityLevel2 = '';
    let neighborhood = '';
    let premise = '';
    
    components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        sublocality = component.long_name;
      }
      if (types.includes('sublocality_level_2')) {
        sublocalityLevel2 = component.long_name;
      }
      if (types.includes('neighborhood')) {
        neighborhood = component.long_name;
      }
      if (types.includes('premise')) {
        premise = component.long_name;
      }
      if (types.includes('locality')) {
        addressData.city = component.long_name;
      }
      // Fallback to administrative_area_level_2 if locality is not available
      if (!addressData.city && types.includes('administrative_area_level_2')) {
        addressData.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressData.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        addressData.pincode = component.long_name;
      }
    });

    // Build addressLine1 with full address details
    // Combine all address parts before city: street number, route, premise, neighborhood, sublocality
    const addressParts = [
      streetNumber,
      route,
      premise,
      neighborhood,
      sublocalityLevel2,
      sublocality
    ].filter(Boolean);
    
    addressData.addressLine1 = addressParts.join(', ').trim();
    
    // If addressLine1 is still empty, use formatted address but remove city, state, pincode, country
    if (!addressData.addressLine1 && formattedAddress) {
      // Remove city, state, pincode, and country from formatted address
      let cleanAddress = formattedAddress;
      if (addressData.city) {
        cleanAddress = cleanAddress.replace(new RegExp(`,\\s*${addressData.city}`, 'gi'), '');
      }
      if (addressData.state) {
        cleanAddress = cleanAddress.replace(new RegExp(`,\\s*${addressData.state}`, 'gi'), '');
      }
      if (addressData.pincode) {
        cleanAddress = cleanAddress.replace(new RegExp(`\\s*${addressData.pincode}`, 'gi'), '');
      }
      cleanAddress = cleanAddress.replace(/,\s*India$/gi, '').trim();
      
      // Remove trailing commas
      cleanAddress = cleanAddress.replace(/,\s*$/, '').trim();
      
      addressData.addressLine1 = cleanAddress || formattedAddress.split(',')[0]?.trim() || '';
    }

    return addressData;
  }, []);

  // Reverse geocode function - converts coordinates to address
  // Using useRef to store the callback to prevent re-renders
  const onAddressSelectRef = useRef(onAddressSelect);
  
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  const reverseGeocode = useCallback((position: { lat: () => number; lng: () => number }) => {
    if (!geocoder) return;

    setIsLoading(true);
    geocoder.geocode(
      { location: { lat: position.lat(), lng: position.lng() } },
      (results: GoogleGeocoderResult[], status: string) => {
        setIsLoading(false);
        if (status === 'OK' && results[0]) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;
        
          setSelectedAddress(formattedAddress);

          // Use the same extraction function for consistency
          if (addressComponents && addressComponents.length > 0) {
            const addressData = extractAddressFromComponents(addressComponents, formattedAddress);
            addressData.latitude = position.lat();
            addressData.longitude = position.lng();
            
            console.log('✅ Address extracted from reverse geocode:', addressData);
            
            // Automatically fill the form fields
            onAddressSelectRef.current(addressData);
          }
        }
      }
    );
  }, [geocoder, extractAddressFromComponents]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          if (map) {
            map.setCenter(pos);
            if (marker) {
              marker.setPosition(pos);
            }
            reverseGeocode({ lat: () => pos.lat, lng: () => pos.lng });
          }
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
        }
      );
    }
  };

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = GOOGLE_MAPS_CONFIG.defaultCenter;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const markerInstance = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    const geocoderInstance = new window.google.maps.Geocoder();

    setMap(mapInstance);
    setMarker(markerInstance);
    setGeocoder(geocoderInstance);

    // Note: Places Autocomplete will be initialized in a separate useEffect
    // after the map is fully loaded to ensure proper timing

    // Add click listener to map - only update marker position, don't trigger API call
    mapInstance.addListener('click', (event: { latLng?: { lat: () => number; lng: () => number } }) => {
      if (event.latLng) {
        const position = event.latLng;
        markerInstance.setPosition({ lat: position.lat(), lng: position.lng() });
        // Don't call reverseGeocode automatically - user must click search button
      }
    });

    // Add drag listener to marker - only update position, don't trigger API call
    markerInstance.addListener('dragend', (event: { latLng: { lat: () => number; lng: () => number } }) => {
      // Don't call reverseGeocode automatically - user must click search button
    });

    // Don't get current location automatically - let user click the button
  }, []);

  // Initialize Autocomplete separately after map is initialized - only once
  // Store stable references to prevent re-initialization
  const mapRefStable = useRef<GoogleMap | null>(null);
  const markerRefStable = useRef<GoogleMarker | null>(null);
  
  useEffect(() => {
    if (map) mapRefStable.current = map;
    if (marker) markerRefStable.current = marker;
  }, [map, marker]);

  useEffect(() => {
    if (!mapRefStable.current || !searchInputRef.current || !window.google?.maps?.places) return;
    
    // Prevent multiple initializations
    if (autocompleteRef.current) {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
      });

      autocompleteRef.current = autocomplete;

      // Add place changed listener - only fires when user selects from autocomplete
      // Only move marker and map - DON'T automatically fill form (user must click green button)
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        // Only proceed if place has valid data
        if (!place || !place.geometry || !place.geometry.location) {
          return;
        }

        const position = place.geometry.location;
        const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
        const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
        
        // Update map and marker position only
        if (mapRefStable.current) {
          const location = { lat, lng };
          mapRefStable.current.setCenter(location);
          mapRefStable.current.setZoom(15);
        }
        
        if (markerRefStable.current) {
          markerRefStable.current.setPosition({ lat, lng });
        }

        // Update search query with formatted address for display
        if (place.formatted_address) {
          setSelectedAddress(place.formatted_address);
          setSearchQuery(place.formatted_address);
        }
        
        // DON'T automatically call onAddressSelect - user must click green button to fill form
        console.log('✅ Location selected from autocomplete - marker moved. Click green button to fill form.');
      });
      
      console.log('✅ Places Autocomplete initialized successfully');
    } catch (error) {
    }
    
    // Cleanup function - clear autocomplete on unmount
    return () => {
      if (autocompleteRef.current) {
        autocompleteRef.current = null;
      }
    };
  }, [extractAddressFromComponents]);


  // Load Google Maps script (only once globally)
  // Use a flag to prevent multiple initializations
  const mapInitializedRef = useRef(false);
  
  useEffect(() => {
    if (mapInitializedRef.current) return;
    
    let checkInterval: NodeJS.Timeout | null = null;
    
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        if (!mapInitializedRef.current) {
          mapInitializedRef.current = true;
          initializeMap();
        }
        return;
      }

      // Check if script tag already exists in the document
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        // Script is already being loaded or loaded, wait for it
        checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            if (checkInterval) {
              clearInterval(checkInterval);
              checkInterval = null;
            }
            if (!mapInitializedRef.current) {
              mapInitializedRef.current = true;
              initializeMap();
            }
          }
        }, 100);
        
        // Cleanup interval after 10 seconds
        setTimeout(() => {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }, 10000);
        return;
      }

      // Create and add script tag only if it doesn't exist
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script'; // Add ID to identify the script
      
      // Set up callback
      window.initMap = () => {
        if (!mapInitializedRef.current) {
          mapInitializedRef.current = true;
          initializeMap();
        }
      };

      // Handle script load error
      script.onerror = () => {
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
    
    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [initializeMap]);

  const handleSearch = () => {
    if (!searchQuery.trim() || !geocoder) return;

    setIsLoading(true);
    geocoder.geocode({ address: searchQuery }, (results: GoogleGeocoderResult[], status: string) => {
      setIsLoading(false);
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        const pos = { lat: position.lat(), lng: position.lng() };
        map?.setCenter(pos);
        marker?.setPosition(pos);
        // Don't call reverseGeocode automatically - user must click green button
        // Only move the marker to the searched location
      }
    });
  };

  const goToCurrentLocation = () => {
    if (currentLocation && map && marker) {
      map.setCenter(currentLocation);
      marker.setPosition(currentLocation);
      // Trigger reverse geocode when green button is clicked
      reverseGeocode({ lat: () => currentLocation.lat, lng: () => currentLocation.lng });
    } else {
      getCurrentLocation();
    }
  };

  // Handle green button click - trigger reverse geocode for current marker position
  const handleGreenButtonClick = () => {
    if (!map || !marker || !geocoder) return;
    
    // Get current marker position
    const position = marker.getPosition();
    if (position) {
      reverseGeocode(position);
    }
  };



  return (
    <div className="space-y-4">
      {/* Search Bar with Autocomplete */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location or address..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            onKeyPress={(e) => e.key === 'Enter' && !autocompleteRef.current && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
        <button
          onClick={handleGreenButtonClick}
          disabled={isLoading || !map || !marker}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Get address for selected location"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-gray-300"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Selected Address:</h4>
              <p className="text-sm text-gray-600">{selectedAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <p className="font-medium text-blue-900 mb-1">How to use:</p>
        <p>• Start typing in the search box - Google will suggest addresses automatically</p>
        <p>• Select an address from the suggestions to auto-fill the form</p>
        <p>• Click on the map to select a location</p>
        <p>• Drag the marker to adjust the position</p>
        <p>• Click the location button (📍) to use your current location</p>
      </div>
    </div>
  );

  // Show configuration message if not configured
  if (isConfigured === false) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Google Maps Not Configured</h3>
          <p className="text-gray-600 mb-4">
            To use the map feature, you need to configure a Google Maps API key.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable these APIs: Maps JavaScript API, Geocoding API, Places API</li>
              <li>Create credentials (API Key)</li>
              <li>Add the API key to your .env.local file: <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Alternative:</strong> You can still add your address manually using the form fields below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking configuration
  if (isConfigured === null) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }
}
