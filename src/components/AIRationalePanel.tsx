import { useState } from 'react';
import type { AgentLog } from '../data/mockData';

const STEP_ICONS: Record<string, string> = {
  Perceive: 'visibility',
  Classify: 'category',
  Deduplicate: 'content_copy',
  Route: 'alt_route',
  Notify: 'notifications',
};

export default function AIRationalePanel({ logs, confidence }: { logs: AgentLog[]; confidence: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <div className="text-left">
            <p className="font-label-lg text-label-lg text-primary">AI Agent Reasoning</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{confidence}% confidence · {logs?.length || 0} steps</p>
          </div>
        </div>
        <span className={`material-symbols-outlined text-primary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {expanded && logs && logs.length > 0 && (
        <div className="px-4 pb-4 border-t border-primary/20 pt-3 space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 items-start">
              {/* Step connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {STEP_ICONS[log.step] || 'check'}
                  </span>
                </div>
                {i < logs.length - 1 && <div className="w-0.5 h-4 bg-primary/30 mt-1" />}
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-label-lg text-label-lg text-on-surface">{log.step}</p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{log.confidence}%</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{log.output}</p>
              </div>
            </div>
          ))}
          {/* Overall confidence bar */}
          <div className="pt-2 border-t border-primary/10">
            <div className="flex justify-between mb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Overall Confidence</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">{confidence}%</span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
