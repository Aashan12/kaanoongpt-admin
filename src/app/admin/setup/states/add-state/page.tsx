'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, ChevronLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './add-state.css';

interface Country {
  id?: string;
  _id?: string;
  name: string;
  code: string;
}

// Default location: Herald College Kathmandu
const DEFAULT_LOCATION = {
  lat: 27.7172,
  lng: 85.3240,
  name: 'Herald College Kathmandu, Kathmandu, Nepal'
};

export default function AddStatePage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    country_name: '',
    description: '',
    is_active: true,
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lng,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  useEffect(() => {
    fetchCountries();
    initializeMap();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/system-setup/countries/`);
      if (response.ok) {
        const data = await response.json();
        // Normalize countries to ensure they have an 'id'
        const normalizedData = data.map((c: any) => ({
          ...c,
          id: c.id || c._id
        }));
        setCountries(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const initializeMap = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
      });

      // Add default marker
      markerRef.current = new (window as any).google.maps.Marker({
        position: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
        map: map,
        title: DEFAULT_LOCATION.name,
      });

      map.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new (window as any).google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Selected Location',
        });
      });

      // Initialize Places services
      autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
      placesServiceRef.current = new (window as any).google.maps.places.PlacesService(map);

      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);
  };

  const handleCitySearch = async (value: string) => {
    setCitySearch(value);

    if (value.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      if (autocompleteServiceRef.current) {
        const predictions = await autocompleteServiceRef.current.getPlacePredictions({
          input: value,
          componentRestrictions: { country: 'np' }, // Restrict to Nepal
        });

        console.log('Predictions:', predictions.predictions); // Debug log
        setCitySuggestions(predictions.predictions || []);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  const handleCitySelect = (placeId: string, description: string) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: placeId },
        (place: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            setCitySearch(description);
            setCitySuggestions([]);

            // Update map
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng });
              mapInstanceRef.current.setZoom(15);

              if (markerRef.current) {
                markerRef.current.setMap(null);
              }

              markerRef.current = new (window as any).google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                title: description,
              });
            }
          }
        }
      );
    }
  };

  const handleCountryChange = (countryId: string) => {
    const selected = countries.find(c => c.id === countryId);
    console.log('Selected country:', selected, 'ID:', countryId);
    setFormData({
      ...formData,
      country_id: countryId,
      country_name: selected?.name || '',
      name: '',
    });
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.country_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        country_id: formData.country_id,
        country_name: formData.country_name,
        description: formData.description,
        is_active: formData.is_active,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      console.log('Sending payload:', payload);

      const response = await fetch(`${API_URL}/system-setup/states/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('State added successfully!');
        setTimeout(() => {
          router.push('/admin/setup/states');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error saving state');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving state');
    }
  };

  return (
    <div className="add-state-container">
      <div className="add-state-header">
        <button className="btn-back" onClick={() => router.back()}>
          <ChevronLeft size={24} />
          <span>Back</span>
        </button>
        <div className="header-title">
          <MapPin size={32} color="#000000" />
          <div>
            <h1>Add New State/Region</h1>
            <p>Create a new state with location on map</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">{error}</div>
          <button className="alert-close" onClick={() => setError('')}>
            <X size={18} />
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <div className="alert-content">{success}</div>
        </div>
      )}

      <div className="add-state-content">
        <div className="form-panel">
          <form onSubmit={handleAddState}>
            <div className="form-group">
              <label>Country * <span className="required-badge">Required</span></label>
              <select
                value={formData.country_id}
                onChange={(e) => handleCountryChange(e.target.value)}
                required
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>State Name * <span className="required-badge">Required</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter state name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes about this state..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  placeholder="Click on map"
                  readOnly
                />
                <small>Click on map to set</small>
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  placeholder="Click on map"
                  readOnly
                />
                <small>Click on map to set</small>
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <div className="status-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="toggle-text">
                    {formData.is_active ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Create State
              </button>
              <button type="button" className="btn-cancel" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="map-panel">
          <div className="map-header">
            <h3>Click on map to set location</h3>
            <p>Latitude: <strong>{formData.latitude.toFixed(6)}</strong> | Longitude: <strong>{formData.longitude.toFixed(6)}</strong></p>
          </div>

          <div className="city-search-section">
            <div className="search-input-wrapper">
              <Search size={18} color="#666" />
              <input
                type="text"
                placeholder="Search for a city or location..."
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                className="city-search-input"
              />
              {citySearch && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setCitySearch('');
                    setCitySuggestions([]);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {citySuggestions.length > 0 && (
              <div className="city-suggestions">
                {citySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="suggestion-item"
                    onClick={() => handleCitySelect(suggestion.place_id, suggestion.description)}
                  >
                    <MapPin size={14} color="#666" />
                    <div className="suggestion-text">
                      <div className="suggestion-main">{suggestion.main_text || suggestion.description}</div>
                      <div className="suggestion-secondary">{suggestion.secondary_text || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={mapRef} className="map-container"></div>
        </div>
      </div>
    </div>
  );
}
