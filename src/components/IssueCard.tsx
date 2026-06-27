import { Link } from 'react-router-dom';
import { type Issue } from '../data/mockData';
import StatusChip from './StatusChip';
import SeverityBadge from './SeverityBadge';

export default function IssueCard({ issue }: { issue: Issue }) {
  return (
    <article className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/issue/${issue.id}`} className="flex gap-3 p-4">
        <img
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          src={issue.image}
          alt={issue.title}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-label-sm text-label-sm bg-tertiary-container/15 text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant">
                {issue.category}
              </span>
              <SeverityBadge severity={issue.severity} />
            </div>
            <StatusChip status={issue.status} />
          </div>
          <h3 className="font-label-lg text-label-lg text-on-surface line-clamp-1 mb-1 hover:text-primary transition-colors">
            {issue.title}
          </h3>
          <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="truncate">{issue.location}</span>
          </div>
        </div>
      </Link>

      <div className="border-t border-outline-variant px-4 py-2 flex justify-between items-center bg-surface-container/30">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
            <span className="font-label-sm text-label-sm">{issue.upvotes}</span>
          </button>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
            <span className="font-label-sm text-label-sm">{issue.aiConfidence}% AI</span>
          </div>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{issue.trackingId}</span>
      </div>
    </article>
  );
}
