import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from '../../data/mockData';
import { useIssues } from '../../hooks/useIssues';
import StatusChip from '../../components/StatusChip';
import SeverityBadge from '../../components/SeverityBadge';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';



export default function AuthorityQueue() {
  const { issues: mockIssues } = useIssues();
  const [activeTab] = useState<'All' | 'Critical'>('All');
  const [filterDept, setFilterDept] = useState<string | 'All'>('All');

  const filtered = mockIssues
    .filter(i => activeTab === 'All' ? true : i.severity === 'Critical')
    .filter(i => filterDept === 'All' ? true : i.departmentId === filterDept)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const criticalCount = mockIssues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  return (
    <div className="flex flex-col gap-section-gap">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">AI-Prioritized Queue</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Auto-sorted by severity & SLA risk · West End Ward</p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-600 px-3 py-2 rounded-xl font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            {criticalCount} Critical
          </div>
        )}
      </div>

      {/* Dept KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept.id}
            onClick={() => setFilterDept(dept.id)}
            className={`text-left bg-surface-container-lowest border rounded-xl p-3 shadow-sm hover:shadow-md transition-all ${filterDept === dept.id ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-[18px]" style={{ color: dept.color, fontVariationSettings: "'FILL' 1" }}>
                {dept.icon}
              </span>
              {dept.openCount > 0 && (
                <span className="font-label-sm text-label-sm bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">{dept.openCount} open</span>
              )}
            </div>
            <p className="font-label-lg text-label-lg text-on-surface">{dept.name}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{dept.resolvedCount} resolved</p>
          </button>
        ))}
      </div>

      {/* Dept filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilterDept('All')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-label-lg text-label-lg border transition-all shrink-0 ${
            filterDept === 'All'
              ? 'bg-primary text-on-primary border-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-variant/30'
          }`}
        >
          All
        </button>
        {DEPARTMENTS.map(dept => (
          <button
            key={dept.id}
            onClick={() => setFilterDept(dept.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-lg text-label-lg border transition-all shrink-0 ${
              filterDept === dept.id
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-variant/30'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Issue Queue */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] block mb-2 opacity-40">inbox</span>
            <p className="font-body-lg text-body-lg">No open issues in this department.</p>
          </div>
        )}
        {filtered.map((issue, idx) => {
          const hoursLeft = issue.severity === 'Critical' ? 2 : issue.severity === 'High' ? 6 : 24;
          const isSlaRisk = hoursLeft < 8;
          return (
            <Link
              key={issue.id}
              to={`/authority/issue/${issue.id}`}
              className="block bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Priority rank badge */}
              <div className={`px-4 py-1.5 flex items-center justify-between ${isSlaRisk ? 'bg-red-500/5 border-b border-red-400/20' : 'bg-surface-container/50 border-b border-outline-variant/50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-on-surface-variant'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{issue.trackingId}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSlaRisk && (
                    <span className="flex items-center gap-1 font-label-sm text-label-sm text-red-600 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {hoursLeft}h SLA
                    </span>
                  )}
                  <SeverityBadge severity={issue.severity} />
                </div>
              </div>

              <div className="p-4 flex gap-4">
                <img src={issue.image} alt={issue.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-label-lg text-label-lg text-on-surface line-clamp-1">{issue.title}</h3>
                    <StatusChip status={issue.status} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {issue.location}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-label-sm text-label-sm bg-tertiary-container/15 text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant">
                      {issue.category}
                    </span>
                    <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                      {issue.aiConfidence}% AI
                    </span>
                    <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                      {issue.upvotes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-3 flex gap-2">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await updateDoc(doc(db, 'reports', issue.id), { status: 'Triaged' });
                      alert("Issue Acknowledged and Triaged!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to acknowledge issue.");
                    }
                  }}
                  disabled={issue.status !== 'Reported'}
                  className={`flex-1 h-9 border rounded-lg font-label-sm text-label-sm transition-colors ${issue.status !== 'Reported' ? 'opacity-50 cursor-not-allowed border-outline-variant text-on-surface-variant' : 'border-outline-variant text-on-surface hover:bg-surface-variant/30'}`}
                >
                  {issue.status !== 'Reported' ? 'Acknowledged' : 'Acknowledge'}
                </button>
                <div
                  className="flex-1 h-9 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Open Detail →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
