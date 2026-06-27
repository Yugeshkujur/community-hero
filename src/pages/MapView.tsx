import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useIssues } from '../hooks/useIssues';
import StatusChip from '../components/StatusChip';
import SeverityBadge from '../components/SeverityBadge';
import { useLocationContext } from '../context/LocationContext';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-400',
  Low: 'bg-emerald-500',
};

const ICONS_MAP: Record<string, string> = {
  Water: 'water_drop',
  Electricity: 'bolt',
  Sanitation: 'delete',
};

// Create a custom div icon function
function createCustomIcon(issue: any, isActive: boolean) {
  const colorClass = isActive ? 'bg-primary' : STATUS_COLORS[issue.severity] || 'bg-gray-500';
  const iconName = issue.status === 'Resolved' ? 'check_circle' : ICONS_MAP[issue.category] || 'warning';
  
  const html = `
    <div class="relative flex flex-col items-center group ${isActive ? 'scale-125 z-30' : 'hover:scale-110'} transition-transform">
      <div class="p-1 bg-white rounded-full shadow-lg border-2 ${isActive ? 'border-primary shadow-[0_4px_16px_rgba(0,74,198,0.3)]' : 'border-gray-300'}">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white ${colorClass}">
          <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">
            ${iconName}
          </span>
        </div>
      </div>
      <div class="w-2.5 h-2.5 transform rotate-45 -mt-1.5 shadow-sm ${colorClass}"></div>
      ${isActive ? '<div class="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/20 rounded-full animate-ping -z-10"></div>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
}

function FlyToMarker({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function MapEventsHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

export default function MapView() {
  const { coordinates, requestPermission } = useLocationContext();
  const { issues: allIssues } = useIssues();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All Issues');

  const FILTERS = ['All Issues', 'Roads', 'Water', 'Electricity', 'Sanitation', 'Parks & Rec'];

  // Filter issues by selected category
  const mockIssues = activeFilter === 'All Issues'
    ? allIssues
    : allIssues.filter(i => i.category === activeFilter);

  const selectedIssue = selected ? allIssues.find(i => i.id === selected) : null;
  const [isLocating, setIsLocating] = useState(false);
  const mapCenter: [number, number] = coordinates || [18.520, 73.856]; // Fallback to Pune

  function handleMyLocation() {
    setIsLocating(true);
    if (!coordinates && requestPermission) {
      requestPermission('once');
    }
    // We can force map to fly if coordinates exist by setting selected to null
    // or by triggering a map reference. To do this cleanly, we'll let the user 
    // click and if coordinates are there, we just clear selected to center.
    setSelected(null);
    setTimeout(() => setIsLocating(false), 800);
  }

  return (
    <main className="fixed inset-0 top-14 bottom-16 md:bottom-0">
      {/* Search + Filters overlay */}
      <div className="absolute top-4 left-0 w-full px-margin-mobile z-[400] flex flex-col gap-3 pointer-events-none">
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant flex items-center px-4 h-12 pointer-events-auto">
          <Link to="/home" className="flex items-center justify-center mr-3">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">arrow_back</span>
          </Link>
          <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-lg text-on-surface placeholder:text-on-surface-variant/70 p-0 outline-none" placeholder="Search address or issue…" />
          <button className="ml-2 p-1 rounded-full text-primary hover:bg-surface-variant/50 transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 pointer-events-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                setSelected(null);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-lg text-label-lg border shadow-sm transition-all ${
                activeFilter === f
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-variant/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="w-full h-full z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <MapEventsHandler onClick={() => setSelected(null)} />
          <ZoomControl position="bottomleft" />
          <FlyToMarker center={selectedIssue ? [selectedIssue.lat, selectedIssue.lng] : mapCenter} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {mockIssues.map(issue => (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={createCustomIcon(issue, selected === issue.id)}
              eventHandlers={{
                click: () => setSelected(issue.id === selected ? null : issue.id),
              }}
            />
          ))}
        </MapContainer>
        
        {/* Floating action button to center on user location */}
        <button 
          onClick={handleMyLocation}
          disabled={isLocating}
          className={`absolute bottom-32 md:bottom-8 right-margin-mobile w-14 h-14 bg-surface-container-lowest text-primary rounded-full shadow-lg hover:bg-surface-variant/30 active:scale-95 transition-all z-[1000] flex items-center justify-center border border-outline-variant ${isLocating ? 'opacity-75' : ''}`}
        >
          <span className={`material-symbols-outlined text-[24px] ${isLocating ? 'animate-spin' : ''}`}>
            {isLocating ? 'refresh' : 'my_location'}
          </span>
        </button>
      </div>

      {/* Status Legend */}
      <div className="absolute top-32 right-margin-mobile z-[400] bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant rounded-xl p-3 shadow-md hidden md:block">
        <p className="font-label-sm text-label-sm text-on-surface-variant mb-2 font-semibold uppercase tracking-wide">Severity</p>
        {[
          { color: 'bg-red-500', label: 'Critical' },
          { color: 'bg-orange-500', label: 'High' },
          { color: 'bg-amber-400', label: 'Medium' },
          { color: 'bg-emerald-500', label: 'Low / Resolved' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="font-label-sm text-label-sm text-on-surface">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Sheet */}
      {selectedIssue && (
        <div className="absolute bottom-0 left-0 w-full px-margin-mobile pb-20 md:pb-6 pt-4 bg-surface-container-lowest rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.1)] z-[500] border-t border-outline-variant">
          <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-3" />
          <div className="flex gap-4 items-center mb-3">
            <img src={selectedIssue.image} alt={selectedIssue.title} className="w-16 h-16 rounded-lg object-cover shrink-0 shadow-sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-headline-md text-headline-md text-on-surface truncate pr-2">{selectedIssue.title}</h2>
                <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-primary transition-colors p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate mb-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>{selectedIssue.location}
              </p>
              <div className="flex items-center gap-2">
                <StatusChip status={selectedIssue.status} />
                <SeverityBadge severity={selectedIssue.severity} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={`/issue/${selectedIssue.id}`} className="flex-1 bg-primary text-on-primary font-label-lg text-label-lg h-11 rounded-lg flex items-center justify-center hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm">
              View Details
            </Link>
            <button className="w-11 h-11 border border-outline-variant text-primary rounded-lg flex items-center justify-center hover:bg-surface-variant/30 transition-all bg-surface-container-lowest">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
