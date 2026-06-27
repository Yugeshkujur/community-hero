import { useNavigate } from 'react-router-dom';
import { PLATFORM_STATS } from '../data/mockData';

export default function Landing() {
  const navigate = useNavigate();

  function handleCitizen() {
    navigate('/login?role=citizen');
  }

  function handleAuthority() {
    navigate('/login?role=authority');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8ff] via-[#ededf9] to-[#dbe1ff] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_city
          </span>
          <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight">Community Hero</span>
        </div>
        <button
          onClick={handleAuthority}
          className="hidden md:flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg font-label-lg text-label-lg hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          Authority Login
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 text-center pt-8 pb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full font-label-sm text-label-sm mb-6 animate-pulse">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          Powered by Gemini AI Agent
        </div>

        <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold text-on-surface leading-tight tracking-tight mb-4 max-w-3xl">
          From <span className="text-primary">"I saw a problem"</span> to{' '}
          <span className="text-secondary">"It got fixed."</span>
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
          Community Hero is a hyperlocal civic platform where citizens report issues in seconds —
          and an autonomous AI agent triages, routes, and tracks every report to resolution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:justify-center">
          <button
            onClick={handleCitizen}
            className="flex items-center justify-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-label-lg text-label-lg shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            I'm a Citizen
          </button>
          <button
            onClick={handleAuthority}
            className="flex items-center justify-center gap-3 bg-surface border-2 border-primary/40 text-primary px-8 py-4 rounded-xl font-label-lg text-label-lg shadow-sm hover:bg-primary/5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            I'm an Authority Officer
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 w-full max-w-2xl">
          {[
            { label: 'Issues Resolved', value: PLATFORM_STATS.totalResolved, icon: 'check_circle', color: 'text-emerald-600' },
            { label: 'AI Accuracy', value: `${PLATFORM_STATS.aiAccuracy}%`, icon: 'smart_toy', color: 'text-primary' },
            { label: 'Avg Response', value: `${PLATFORM_STATS.avgResolutionHours}h`, icon: 'schedule', color: 'text-amber-600' },
            { label: 'Active Wards', value: PLATFORM_STATS.wardsActive, icon: 'map', color: 'text-secondary' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface/80 backdrop-blur-sm border border-outline-variant rounded-xl p-4 text-center shadow-sm">
              <span className={`material-symbols-outlined text-[24px] ${stat.color} mb-1 block`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 w-full max-w-3xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-8 text-center">How the AI Agent Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { step: '1', icon: 'visibility', label: 'Perceive', desc: 'Gemini reads your photo & location' },
              { step: '2', icon: 'category', label: 'Classify', desc: 'Assigns category, severity & confidence' },
              { step: '3', icon: 'content_copy', label: 'Deduplicate', desc: 'Checks for nearby existing reports' },
              { step: '4', icon: 'alt_route', label: 'Route', desc: 'Auto-assigns to right department' },
              { step: '5', icon: 'notifications', label: 'Notify', desc: 'Updates citizen & authority instantly' },
            ].map((s, i) => (
              <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-1">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {s.icon}
                  </span>
                </div>
                {i < 4 && <div className="hidden sm:block w-full h-0.5 bg-primary/30 -mx-2 flex-1" />}
                <div>
                  <p className="font-label-lg text-label-lg text-on-surface">{s.label}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 font-label-sm text-label-sm text-on-surface-variant border-t border-outline-variant">
        Community Hero · Built on Google AI Studio & Gemini · PRD v1.0
      </footer>
    </div>
  );
}
