import { useMemo } from 'react';
import { DEPARTMENTS } from '../../data/mockData';
import { useIssues } from '../../hooks/useIssues';

const CATEGORY_COLORS: Record<string, string> = {
  'Roads': '#F59E0B',
  'Water': '#3B82F6',
  'Sanitation': '#10B981',
  'Electricity': '#EAB308',
  'Parks & Rec': '#22C55E',
  'Other': '#94A3B8',
};

export default function AuthorityDashboard() {
  const { issues, loading } = useIssues();

  const openCount = issues.filter(i => i.status !== 'Resolved').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const criticalOpen = issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const resolutionRate = issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0;

  // Compute AI accuracy as the average aiConfidence across all issues
  const aiAccuracy = useMemo(() => {
    if (issues.length === 0) return 0;
    const total = issues.reduce((sum, i) => sum + (i.aiConfidence || 0), 0);
    return Math.round(total / issues.length);
  }, [issues]);

  // Live category breakdown: count open (non-resolved) issues per category
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    issues.filter(i => i.status !== 'Resolved').forEach(i => {
      const cat = i.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count, color: CATEGORY_COLORS[category] || '#94A3B8' }))
      .sort((a, b) => b.count - a.count);
  }, [issues]);

  const categoryTotal = categoryBreakdown.reduce((s, c) => s + c.count, 0);

  // Live department stats computed from real issues
  const deptStats = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptIssues = issues.filter(i => i.departmentId === dept.id);
      const open = deptIssues.filter(i => i.status !== 'Resolved').length;
      const resolved = deptIssues.filter(i => i.status === 'Resolved').length;
      const total = open + resolved;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { ...dept, openCount: open, resolvedCount: resolved, rate };
    });
  }, [issues]);

  const avgResolutionHours = useMemo(() => {
    const resolved = issues.filter(i => i.status === 'Resolved' && i.resolvedAt && i.createdAt);
    if (resolved.length === 0) return '—';
    const totalHours = resolved.reduce((sum, i) => {
      const diff = new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime();
      return sum + diff / (1000 * 60 * 60);
    }, 0);
    return Math.round(totalHours / resolved.length) + 'h';
  }, [issues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section-gap pb-10">
      {/* Page Header */}
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">Ward Impact Dashboard</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Live data · {issues.length} total reports
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Resolved', value: resolvedCount, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Open Issues', value: openCount, icon: 'pending', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Critical Open', value: criticalOpen, icon: 'emergency', color: 'text-red-600', bg: 'bg-red-500/10' },
          { label: 'Avg AI Confidence', value: `${aiAccuracy}%`, icon: 'smart_toy', color: 'text-primary', bg: 'bg-primary/10' },
        ].map(k => (
          <div key={k.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-full ${k.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined text-[20px] ${k.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{k.value}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resolution Rate Donut */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface mb-4">Resolution Rate</h2>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ededf9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#004ac6" strokeWidth="3"
                  strokeDasharray={`${resolutionRate} ${100 - resolutionRate}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">{resolutionRate}%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">resolved</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />Resolved
                </span>
                <span className="font-label-lg text-label-lg text-on-surface">{resolvedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-surface-container-high inline-block" />Open
                </span>
                <span className="font-label-lg text-label-lg text-on-surface">{openCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Avg Resolution</span>
                <span className="font-label-lg text-label-lg text-on-surface">{avgResolutionHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface mb-4">Open by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-on-surface-variant font-body-sm text-body-sm text-center py-4">No open issues 🎉</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(c => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body-sm text-body-sm text-on-surface">{c.category}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{c.count}</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${categoryTotal > 0 ? (c.count / categoryTotal) * 100 : 0}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface">Department Performance</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Live counts from Firestore</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container/50">
              <tr>
                {['Department', 'Open', 'Resolved', 'Resolution %'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-label-lg text-label-lg text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {deptStats.map(dept => (
                <tr key={dept.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: dept.color, fontVariationSettings: "'FILL' 1" }}>{dept.icon}</span>
                      <span className="font-label-lg text-label-lg text-on-surface">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-label-lg text-label-lg ${dept.openCount > 10 ? 'text-orange-600 font-bold' : 'text-on-surface'}`}>{dept.openCount}</span>
                  </td>
                  <td className="px-4 py-3 font-label-lg text-label-lg text-emerald-600">{dept.resolvedCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${dept.rate}%` }} />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface">{dept.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Resolved */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface">Recently Resolved</h2>
          <span className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer">View all</span>
        </div>
        <div className="divide-y divide-outline-variant/50">
          {issues.filter(i => i.status === 'Resolved').slice(0, 5).map(issue => (
            <div key={issue.id} className="flex items-center gap-4 p-4 hover:bg-surface-container/50 transition-colors">
              <img src={issue.image} alt={issue.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-label-lg text-label-lg text-on-surface truncate">{issue.title}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{issue.category} · {issue.trackingId}</p>
              </div>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-emerald-600 shrink-0">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Resolved
              </span>
            </div>
          ))}
          {issues.filter(i => i.status === 'Resolved').length === 0 && (
            <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-8">No resolved issues yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
