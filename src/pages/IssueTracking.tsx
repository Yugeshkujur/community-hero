import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useIssues } from '../hooks/useIssues';
import { type IssueStatus } from '../data/mockData';
import StatusChip from '../components/StatusChip';
import SeverityBadge from '../components/SeverityBadge';
import AIRationalePanel from '../components/AIRationalePanel';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRole } from '../context/RoleContext';

const TIMELINE: { status: IssueStatus; label: string; desc: string }[] = [
  { status: 'Reported',    label: 'Reported',    desc: 'Citizen submitted with photo evidence' },
  { status: 'Triaged',     label: 'Triaged',     desc: 'AI agent classified & scored severity' },
  { status: 'Assigned',    label: 'Assigned',    desc: 'Routed to correct department' },
  { status: 'In Progress', label: 'In Progress', desc: 'Crew on site and working' },
  { status: 'Resolved',    label: 'Resolved',    desc: 'Issue closed with proof of resolution' },
];

const STATUS_ORDER: IssueStatus[] = ['Reported', 'Triaged', 'Assigned', 'In Progress', 'Resolved'];

export default function IssueTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { issues: allIssues, loading } = useIssues();
  const { currentUser } = useRole();

  const issue = allIssues.find(i => i.id === id) ?? allIssues[2];
  const currentIndex = issue ? STATUS_ORDER.indexOf(issue.status) : 0;

  // Derive initial upvoted state from issue.upvotedBy (persisted)
  const uid = currentUser?.uid;
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    if (issue && uid) {
      setUpvoted(issue.upvotedBy?.includes(uid) ?? false);
    }
  }, [issue, uid]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-body-lg">Loading tracking details...</div>;
  }

  if (!issue) {
    return <div className="p-8 text-center text-on-surface-variant font-body-lg">Issue not found.</div>;
  }

  async function handleUpvote() {
    if (!uid) {
      alert('Please sign in to upvote.');
      return;
    }
    if (upvoted) return; // already upvoted — can't un-upvote to prevent gaming
    setUpvoting(true);
    try {
      await updateDoc(doc(db, 'reports', issue.id), {
        upvotes: increment(1),
        upvotedBy: arrayUnion(uid),
      });
      setUpvoted(true);
    } catch (err) {
      console.error('Failed to upvote:', err);
      alert('Failed to register upvote. Please try again.');
    } finally {
      setUpvoting(false);
    }
  }

  // SLA countdown
  const slaMs = new Date(issue.slaDeadline).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.round(slaMs / (1000 * 60 * 60)));

  // Duplicate detection notice
  const duplicateIssue = issue.isDuplicate && issue.duplicateOfId
    ? allIssues.find(i => i.id === issue.duplicateOfId)
    : null;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Back header (mobile) */}
      <header className="md:hidden sticky top-14 bg-surface z-40 flex items-center gap-2 px-margin-mobile py-3 border-b border-outline-variant">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-md text-headline-md-mobile text-on-surface truncate">Issue Detail</h1>
      </header>

      <div className="px-margin-mobile pt-4 space-y-stack-gap">
        {/* Duplicate Notice */}
        {issue.isDuplicate && (
          <div className="bg-amber-50 border border-amber-400/40 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>content_copy</span>
            <div>
              <p className="font-label-lg text-label-lg text-amber-700 font-semibold">Likely Duplicate Report</p>
              <p className="font-body-sm text-body-sm text-amber-600">
                The AI flagged this as a likely duplicate.{' '}
                {duplicateIssue
                  ? <Link to={`/issue/${duplicateIssue.id}`} className="underline font-semibold">View original: {duplicateIssue.trackingId}</Link>
                  : issue.duplicateOfId
                    ? <span>Original ID: <code className="bg-amber-100 px-1 rounded">{issue.duplicateOfId}</code></span>
                    : null
                }
              </p>
            </div>
          </div>
        )}

        {/* Hero Image */}
        <div className="rounded-xl overflow-hidden aspect-video relative border border-outline-variant/30 shadow-sm">
          <img className="w-full h-full object-cover" src={issue.image} alt={issue.title} />
          <div className="absolute top-2 right-2">
            <StatusChip status={issue.status} showIcon />
          </div>
          <div className="absolute top-2 left-2">
            <SeverityBadge severity={issue.severity} />
          </div>
        </div>

        {/* Header Info */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{issue.title}</h2>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {issue.location}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Reported by {issue.citizenName} · {issue.trackingId}
          </p>
        </div>

        {/* SLA + Upvote row */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`border rounded-xl p-3 flex items-center gap-3 ${hoursLeft < 8 ? 'border-orange-400/30 bg-orange-50' : 'border-outline-variant bg-surface-container-lowest'}`}>
            <span className={`material-symbols-outlined ${hoursLeft < 8 ? 'text-orange-500' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              timer
            </span>
            <div>
              <p className={`font-label-lg text-label-lg ${hoursLeft < 8 ? 'text-orange-600' : 'text-on-surface'}`}>
                {hoursLeft > 0 ? `${hoursLeft}h left` : 'SLA Breached'}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">SLA deadline</p>
            </div>
          </div>
          <button
            onClick={handleUpvote}
            disabled={upvoting || upvoted || !uid}
            className={`border rounded-xl p-3 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              upvoted
                ? 'border-primary/30 bg-primary/5'
                : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-variant/20'
            }`}
          >
            <span
              className={`material-symbols-outlined ${upvoted ? 'text-primary' : 'text-on-surface-variant'}`}
              style={{ fontVariationSettings: upvoted ? "'FILL' 1" : "'FILL' 0" }}
            >
              thumb_up
            </span>
            <div className="text-left">
              <p className={`font-label-lg text-label-lg ${upvoted ? 'text-primary' : 'text-on-surface'}`}>
                {issue.upvotes + (upvoted && !issue.upvotedBy?.includes(uid ?? '') ? 1 : 0)}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {upvoting ? 'Saving…' : upvoted ? 'Confirmed!' : uid ? 'Me Too' : 'Sign in to vote'}
              </p>
            </div>
          </button>
        </div>

        {/* Description */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <h3 className="font-label-lg text-label-lg text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">description</span>
            Description
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{issue.description}</p>
        </div>

        {/* Timeline Stepper */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <h3 className="font-label-lg text-label-lg text-on-surface mb-4">Tracking Timeline</h3>
          <div className="relative pl-6 space-y-5">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant/40" />
            {TIMELINE.map((step, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              const pending = i > currentIndex;
              return (
                <div key={step.status} className={`relative flex gap-4 items-start ${pending ? 'opacity-40' : ''}`}>
                  <div className={`absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${
                    done ? 'bg-primary border-surface shadow-sm' :
                    active ? 'bg-surface border-primary shadow-sm' :
                    'bg-surface border-outline-variant'
                  }`}>
                    {done && <span className="material-symbols-outlined text-on-primary text-[13px]">check</span>}
                    {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className={`font-label-lg text-label-lg ${active ? 'text-primary font-bold' : 'text-on-surface'}`}>{step.label}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Rationale */}
        <AIRationalePanel logs={issue.agentLog} confidence={issue.aiConfidence} />
      </div>
    </div>
  );
}
