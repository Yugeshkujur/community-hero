import type { IssueSeverity } from '../data/mockData';

const SEVERITY_CONFIG: Record<IssueSeverity, { bg: string; text: string; border: string; label: string }> = {
  'Critical': { bg: 'bg-red-500/10',    text: 'text-red-600',    border: 'border-red-500/30',    label: 'Critical' },
  'High':     { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30', label: 'High' },
  'Medium':   { bg: 'bg-amber-400/10',  text: 'text-amber-600',  border: 'border-amber-400/30',  label: 'Medium' },
  'Low':      { bg: 'bg-emerald-500/10',text: 'text-emerald-600',border: 'border-emerald-500/30',label: 'Low' },
};

export default function SeverityBadge({ severity, showLabel = true }: { severity: IssueSeverity; showLabel?: boolean }) {
  const FALLBACK = { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/30', label: severity ?? 'Unknown' };
  const cfg = SEVERITY_CONFIG[severity] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg.replace('/10', '')} bg-current`} />
      {showLabel && cfg.label}
    </span>
  );
}
