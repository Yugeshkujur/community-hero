import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { DEPARTMENTS } from '../../data/mockData';
import AvatarCustomizer from '../../components/AvatarCustomizer';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useIssues } from '../../hooks/useIssues';

export default function AuthorityProfile() {
  const navigate = useNavigate();
  const { setRole, currentUser, userData } = useRole();
  const uid = currentUser?.uid;
  const { issues } = useIssues();
  
  const departmentName = DEPARTMENTS.find(d => d.id === userData?.departmentId)?.name || 'Government Department';

  const myIssues = useMemo(() => {
    return issues.filter(i => !userData?.departmentId || i.departmentId === userData.departmentId);
  }, [issues, userData?.departmentId]);

  const resolvedIssues = myIssues.filter(i => i.status === 'Resolved');
  const issuesResolvedCount = resolvedIssues.length;

  const avgResolution = useMemo(() => {
    if (resolvedIssues.length === 0) return '—';
    const totalHours = resolvedIssues.reduce((sum, i) => {
      if (!i.resolvedAt) return sum; // fallback
      return sum + (new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60);
    }, 0);
    const avgH = totalHours / resolvedIssues.length;
    return avgH > 24 ? (avgH / 24).toFixed(1) + ' Days' : Math.round(avgH) + ' Hours';
  }, [resolvedIssues]);

  const totalUpvotes = myIssues.reduce((sum, i) => sum + (i.upvotes || 0), 0);
  const escalations = myIssues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  const recentActivity = useMemo(() => {
    return [...myIssues]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(i => {
        let action = 'Updated Status';
        let icon = 'update';
        let color = 'text-amber-500';

        if (i.status === 'Resolved') {
          action = 'Resolved Issue';
          icon = 'check_circle';
          color = 'text-emerald-500';
        } else if (i.status === 'Triaged') {
          action = 'Triaged Issue';
          icon = 'fact_check';
          color = 'text-blue-500';
        } else if (i.status === 'Reported') {
          action = 'New Report';
          icon = 'add_circle';
          color = 'text-primary';
        }

        const diffMs = Date.now() - new Date(i.updatedAt).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let time = 'just now';
        if (diffDays > 0) time = `${diffDays} days ago`;
        else if (diffHours > 0) time = `${diffHours} hours ago`;
        else if (diffMins > 0) time = `${diffMins} mins ago`;

        return {
          id: i.id,
          action,
          target: `${i.trackingId} (${i.category})`,
          time,
          icon,
          color
        };
      });
  }, [myIssues]);

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'Authority'}`;
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatar || defaultAvatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const handleSaveAvatar = async (newUrl: string) => {
    if (!uid) return;
    setIsUploadingAvatar(true);
    setIsCustomizerOpen(false);
    
    try {
      await updateDoc(doc(db, 'users', uid), {
        avatar: newUrl
      });
      setAvatarUrl(newUrl);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("Failed to save avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  function handleLogout() {
    setRole(null);
    navigate('/');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header Profile Card */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-transparent" />
        
        <div 
          className="relative z-10 w-24 h-24 rounded-full border-4 border-surface shadow-md bg-surface flex items-center justify-center shrink-0 cursor-pointer group"
          onClick={() => setIsCustomizerOpen(true)}
        >
          <img 
            src={avatarUrl} 
            alt={userData?.name || 'Authority'} 
            className={`w-full h-full object-cover rounded-full transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'}`} 
          />
          {isUploadingAvatar ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-[28px]">progress_activity</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
              <span className="material-symbols-outlined text-white text-[24px]">edit</span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-primary text-on-primary border-2 border-surface rounded-full w-8 h-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          </div>
        </div>
        
        <AvatarCustomizer 
          isOpen={isCustomizerOpen} 
          onClose={() => setIsCustomizerOpen(false)} 
          onSave={handleSaveAvatar} 
          initialSeed={userData?.name || 'Authority'} 
        />
        
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
          { label: 'Issues Resolved', value: issuesResolvedCount, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Avg Resolution', value: avgResolution, icon: 'timer', color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Citizen Upvotes', value: totalUpvotes, icon: 'thumb_up', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Escalations', value: escalations, icon: 'warning', color: 'text-red-600', bg: 'bg-red-500/10' },
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
          <Link to="/authority" className="text-primary font-label-sm text-label-sm hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-outline-variant/50">
          {recentActivity.map((log) => (
            <div key={log.id} className="px-6 py-4 flex gap-4 hover:bg-surface-container/20 transition-colors">
              <span className={`material-symbols-outlined ${log.color} mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{log.icon}</span>
              <div>
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-semibold">{log.action}</span>: {log.target}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="p-6 text-center text-on-surface-variant font-body-sm text-body-sm">
               No recent activity found.
            </div>
          )}
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
