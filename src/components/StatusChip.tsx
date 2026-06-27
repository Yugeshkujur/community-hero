import type { IssueStatus } from '../data/mockData';

const STATUS_CONFIG: Record<IssueStatus, { bg: string; text: string; dot: string; icon: string }> = {
  'Reported':    { bg: 'bg-orange-500/10',  text: 'text-orange-600',  dot: 'bg-orange-500',  icon: 'flag' },
  'Triaged':     { bg: 'bg-amber-400/10',   text: 'text-amber-600',   dot: 'bg-amber-400',   icon: 'manage_search' },
  'Assigned':    { bg: 'bg-blue-500/10',    text: 'text-blue-600',    dot: 'bg-blue-500',    icon: 'person_pin' },
  'In Progress': { bg: 'bg-primary/10',     text: 'text-primary',     dot: 'bg-primary',     icon: 'construction' },
  'Resolved':    { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500', icon: 'check_circle' },
};

export default function StatusChip({ status, showIcon = false }: { status: IssueStatus; showIcon?: boolean }) {
  const FALLBACK = { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-500', icon: 'help' };
  const cfg = STATUS_CONFIG[status] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${cfg.bg} ${cfg.text}`}>
      {showIcon && (
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {cfg.icon}
        </span>
      )}
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${showIcon ? 'hidden' : 'inline-block'}`} />
      {status}
    </span>
  );
}
