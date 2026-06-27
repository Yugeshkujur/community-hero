import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type PermissionState = 'prompt' | 'always' | 'once' | 'never';

interface LocationContextType {
  permission: PermissionState;
  coordinates: [number, number] | null;
  requestPermission: (type: 'always' | 'once' | 'never') => void;
  fetchLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ch_location_permission') as PermissionState | null;
    if (saved === 'always') {
      setPermission('always');
      fetchLocation();
    } else if (saved === 'never') {
      setPermission('never');
    }
  }, []);

  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Error getting location:", error.message);
          // Silently fail to fallback coordinates instead of showing disruptive native alerts
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported by browser");
      alert("Geolocation is not supported by your browser.");
    }
  };

  const requestPermission = (type: 'always' | 'once' | 'never') => {
    setPermission(type);
    if (type === 'always') {
      localStorage.setItem('ch_location_permission', 'always');
      fetchLocation();
    } else if (type === 'once') {
      // Don't save to localStorage, just fetch this session
      fetchLocation();
    } else if (type === 'never') {
      localStorage.setItem('ch_location_permission', 'never');
    }
  };

  return (
    <LocationContext.Provider value={{ permission, coordinates, requestPermission, fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
