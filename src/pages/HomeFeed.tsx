import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import IssueCard from '../components/IssueCard';
import { useIssues } from '../hooks/useIssues';

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Roads', value: 'Roads' },
  { label: 'Water', value: 'Water' },
  { label: 'Electricity', value: 'Electricity' },
  { label: 'Sanitation', value: 'Sanitation' },
  { label: 'Parks & Rec', value: 'Parks & Rec' },
];

export default function HomeFeed() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { issues: mockIssues } = useIssues();

  const filtered = mockIssues.filter(i =>
    activeFilter === 'All' || i.category === activeFilter
  );

  const openCount = mockIssues.filter(i => i.status !== 'Resolved').length;
  const resolvedCount = mockIssues.filter(i => i.status === 'Resolved').length;

  return (
    <main className="px-margin-mobile pt-stack-gap flex flex-col gap-section-gap max-w-3xl mx-auto">
      {/* Stats Banner */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Issues', value: openCount, icon: 'pending', color: 'text-orange-500' },
          { label: 'Resolved', value: resolvedCount, icon: 'check_circle', color: 'text-emerald-600' },
          { label: 'AI Accuracy', value: '94%', icon: 'smart_toy', color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-center shadow-sm">
            <span className={`material-symbols-outlined text-[20px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {s.icon}
            </span>
            <p className="text-lg font-bold text-on-surface leading-tight">{s.value}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Primary Action */}
      <section>
        <Link
          to="/report"
          className="w-full bg-primary text-on-primary rounded-xl h-[56px] flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
          Report an Issue
        </Link>
      </section>

      {/* Map Preview */}
      <section className="rounded-xl overflow-hidden border border-outline-variant shadow-sm h-44 relative group">
        <Link to="/map" className="block w-full h-full relative">
          <div className="absolute inset-0 pointer-events-none z-0">
            <MapContainer 
              center={[18.520, 73.856]} 
              zoom={13} 
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            </MapContainer>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant shadow-sm">
            <span className="font-label-sm text-label-sm text-on-surface">{openCount} Open Issues Nearby</span>
          </div>
          <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[16px]">fullscreen</span>
            <span className="font-label-sm text-label-sm text-primary">View Map</span>
          </div>
        </Link>
      </section>

      {/* Feed Section */}
      <section className="flex flex-col gap-stack-gap pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface font-semibold">Community Feed</h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{filtered.length} reports</span>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-lg text-label-lg border transition-all shrink-0 ${
                activeFilter === f.value
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-variant/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] block mb-2 opacity-40">search_off</span>
            <p className="font-body-lg text-body-lg">No {activeFilter} issues found.</p>
          </div>
        ) : (
          filtered.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </section>
    </main>
  );
}
