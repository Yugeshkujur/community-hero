import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { DEPARTMENTS } from '../../data/mockData';

export default function AuthorityProfile() {
  const navigate = useNavigate();
  const { setRole, userData } = useRole();
  
  const departmentName = DEPARTMENTS.find(d => d.id === userData?.departmentId)?.name || 'Government Department';

  function handleLogout() {
    setRole(null);
    navigate('/');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header Profile Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-transparent" />
        
        <div className="relative z-10 w-24 h-24 rounded-full border-4 border-surface shadow-md bg-primary/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{userData?.name || 'Authority User'}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-1">Ward Officer</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
            <span className="flex items-center gap-1 bg-surface-container border border-outline-variant px-2.5 py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">badge</span>
              {userData?.employeeId || 'ID Not Set'}
            </span>
            <span className="flex items-center gap-1 bg-surface-container border border-outline-variant px-2.5 py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              {departmentName}
            </span>
            <span className="flex items-center gap-1 bg-surface-container border border-outline-variant px-2.5 py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              City Ward
            </span>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Issues Resolved', value: '1,432', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Avg Resolution', value: '2.4 Days', icon: 'timer', color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Citizen Rating', value: '4.8/5', icon: 'star', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Escalations', value: '3', icon: 'warning', color: 'text-red-600', bg: 'bg-red-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${stat.bg}`}>
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{stat.value}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Recent Activity Logs */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container/30">
          <h3 className="font-label-lg text-label-lg text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Recent Activity
          </h3>
          <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
        </div>
        <div className="divide-y divide-outline-variant/50">
          {[
            { action: 'Resolved Issue', target: 'CH-2024-045 (Broken Streetlight)', time: '2 hours ago', icon: 'check_circle', color: 'text-emerald-500' },
            { action: 'Reassigned Issue', target: 'CH-2024-048 (Water Leak) to Plumbing', time: '5 hours ago', icon: 'forward', color: 'text-blue-500' },
            { action: 'Updated Status', target: 'CH-2024-042 (Pothole) to In Progress', time: '1 day ago', icon: 'update', color: 'text-amber-500' },
          ].map((log, i) => (
            <div key={i} className="px-6 py-4 flex gap-4 hover:bg-surface-container/20 transition-colors">
              <span className={`material-symbols-outlined ${log.color} mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{log.icon}</span>
              <div>
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-semibold">{log.action}</span>: {log.target}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Settings & Logout */}
      <section className="flex flex-col gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <button 
            onClick={() => {
              const el = document.getElementById('settings-panel');
              if (el) {
                el.classList.toggle('hidden');
              }
            }}
            className="w-full px-4 py-4 flex items-center gap-3 text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            <span className="font-label-lg text-label-lg flex-1 text-left">Account Settings</span>
            <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
          </button>
          <div id="settings-panel" className="hidden px-4 pb-4 border-t border-outline-variant pt-4 bg-surface-container/30">
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Manage your authority account preferences. (Demo)
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface">Email Notifications</span>
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface">SMS Alerts (Critical Issues)</span>
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
              </div>
            </div>
            <button className="mt-4 w-full border border-primary text-primary px-4 py-2 rounded-lg font-label-sm text-label-sm hover:bg-primary/5 transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors shadow-sm font-label-lg text-label-lg font-bold"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </section>
    </div>
  );
}
