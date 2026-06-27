import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRole } from '../context/RoleContext';
import { useLocationContext } from '../context/LocationContext';
import { useIssues } from '../hooks/useIssues';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CITIZEN_NAV = [
  { label: 'Home',    icon: 'home',       path: '/home' },
  { label: 'Report',  icon: 'add_circle', path: '/report' },
  { label: 'Map',     icon: 'map',        path: '/map' },
  { label: 'Profile', icon: 'person',     path: '/profile' },
];

const AUTHORITY_NAV = [
  { label: 'Queue',      icon: 'inbox',           path: '/authority' },
  { label: 'Dashboard',  icon: 'bar_chart',       path: '/authority/dashboard' },
  { label: 'Profile',    icon: 'person',          path: '/authority/profile' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthority, setRole, userData } = useRole();
  const { issues } = useIssues();

  function handleSwitchRole() {
    setRole(null);
    navigate('/');
  }

  const { permission, requestPermission } = useLocationContext();

  const PermissionOverlay = () => {
    if (permission !== 'prompt') return null;
    return (
      <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-2">Enable Location Services</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">
            Community Hero uses your real-time location to automatically tag reports and show issues near you.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => requestPermission('always')}
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg hover:bg-primary/90 transition-colors"
            >
              Allow All The Time
            </button>
            <button 
              onClick={() => requestPermission('once')}
              className="w-full h-12 bg-surface-container-high text-on-surface rounded-xl font-label-lg text-label-lg hover:bg-surface-variant transition-colors"
            >
              Allow Once
            </button>
            <button 
              onClick={() => requestPermission('never')}
              className="w-full h-12 text-on-surface-variant rounded-xl font-label-lg text-label-lg hover:bg-surface-container transition-colors"
            >
              Never
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Authority layout: sidebar on desktop, bottom bar on mobile
  if (isAuthority) {
    const criticalCount = issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

    return (
      <div className="min-h-screen bg-surface-container flex">
        <PermissionOverlay />
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 bg-surface-container-lowest border-r border-outline-variant shrink-0 min-h-screen sticky top-0">
          <Link to="/" className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
            <div>
              <p className="font-label-lg text-label-lg text-primary font-bold leading-tight">Community Hero</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Authority Console</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {AUTHORITY_NAV.map(item => {
              const isActive = item.path === '/authority' 
                ? location.pathname === '/authority' 
                : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-lg text-label-lg transition-all',
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              );
            })}

            {/* Escalations */}
            <NavLink
              to="/authority?filter=critical"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
              Escalations
              {criticalCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{criticalCount}</span>
              )}
            </NavLink>
          </nav>

          {/* User + Switch */}
          <div className="p-3 border-t border-outline-variant space-y-2">
            <Link to="/authority/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              </div>
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">{userData?.name || 'Authority User'}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Ward Officer</p>
              </div>
            </Link>
            <button
              onClick={handleSwitchRole}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Switch to Citizen
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-20 md:pb-0">
          {/* Top bar */}
          <header className="sticky top-0 z-[1000] bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 h-14 shadow-sm">
            <Link to="/" className="flex items-center gap-2 md:hidden">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
              <span className="font-label-lg text-label-lg text-primary font-bold">Authority Console</span>
            </Link>
            <div className="hidden md:block" />
            <div className="flex items-center gap-3">
              {criticalCount > 0 && (
                <Link to="/authority?filter=critical" className="flex items-center gap-1.5 bg-red-500/10 border border-red-400/20 text-red-600 px-3 py-1 rounded-full font-label-sm text-label-sm hover:bg-red-500/20 transition-colors">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                  {criticalCount} Critical
                </Link>
              )}
              <button onClick={handleSwitchRole} className="hidden md:flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Citizen View
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full rounded-t-xl bg-surface-container-lowest border-t border-outline-variant shadow-lg z-[1000] flex justify-around items-center px-4 pt-2 pb-safe">
          {[...AUTHORITY_NAV, { label: 'Alerts', icon: 'report_problem', path: '/authority?filter=critical' }].map(item => {
            const isActive = item.path === '/authority' ? location.pathname === '/authority' && !location.search.includes('filter=critical') : location.pathname.startsWith(item.path) || (item.path.includes('filter=critical') && location.search.includes('filter=critical'));
            return (
              <NavLink key={item.path} to={item.path} className="flex flex-col items-center justify-center min-w-[touch-target-min] min-h-[touch-target-min] group">
                <div className={cn('flex flex-col items-center justify-center px-4 py-1 mb-1 rounded-full transition-colors', isActive ? 'bg-secondary-container text-on-secondary-container' : 'group-hover:bg-surface-variant/30 text-on-surface-variant')}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                </div>
                <span className={cn('font-label-sm text-label-sm-mobile', isActive ? 'text-primary font-bold' : 'text-on-surface-variant')}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  }

  // Citizen layout
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 pt-14 selection:bg-primary-container selection:text-on-primary-container">
      <PermissionOverlay />
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full bg-surface shadow-sm z-[1000] flex items-center justify-between px-margin-mobile h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
          <h1 className="font-headline-md text-headline-md-mobile text-primary font-bold">Community Hero</h1>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleSwitchRole} className="hidden md:flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            Authority
          </button>
        </div>
      </header>

      {/* Desktop Nav */}
      <nav className="hidden md:flex fixed top-0 right-36 h-14 z-[1000] items-center gap-6">
        {CITIZEN_NAV.map(item => {
          const isActive = item.path === '/home' ? location.pathname === '/home' || location.pathname === '/' : location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path} className={cn('font-label-lg text-label-lg transition-colors h-full flex items-center border-b-2', isActive ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary')}>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="w-full h-full">
        <Outlet />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full rounded-t-xl bg-surface-container shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-[1000] flex justify-around items-center px-4 pb-safe pt-2">
        {CITIZEN_NAV.map(item => {
          const isActive = item.path === '/home' ? location.pathname === '/home' : location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path} className="flex flex-col items-center justify-center hover:bg-surface-variant/50 transition-all active:scale-90 duration-200 min-w-[touch-target-min] min-h-[touch-target-min] group">
              <div className={cn('flex flex-col items-center justify-center px-4 py-1 mb-1 rounded-full transition-colors', isActive ? 'bg-secondary-container text-on-secondary-container' : 'group-hover:bg-surface-variant/30 text-on-surface-variant')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              </div>
              <span className={cn('font-label-sm text-label-sm-mobile', isActive ? 'text-primary font-bold' : 'text-on-surface-variant')}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
