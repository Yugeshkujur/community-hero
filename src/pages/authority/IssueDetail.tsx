import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LEADERBOARD, type IssueStatus } from '../../data/mockData';
import { useIssues } from '../../hooks/useIssues';
import StatusChip from '../../components/StatusChip';
import SeverityBadge from '../../components/SeverityBadge';
import AIRationalePanel from '../../components/AIRationalePanel';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const STATUS_ACTIONS: { label: string; next: IssueStatus; icon: string; color: string }[] = [
  { label: 'Acknowledge', next: 'Triaged', icon: 'visibility', color: 'border-outline-variant text-on-surface hover:bg-surface-variant/30' },
  { label: 'Assign', next: 'Assigned', icon: 'person_pin', color: 'border-outline-variant text-on-surface hover:bg-surface-variant/30' },
  { label: 'Mark In Progress', next: 'In Progress', icon: 'construction', color: 'border-primary/40 text-primary bg-primary/5 hover:bg-primary/10' },
  { label: 'Mark Resolved', next: 'Resolved', icon: 'check_circle', color: 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' },
];

export default function AuthorityIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { issues: mockIssues, loading } = useIssues();
  
  const issue = mockIssues.find(i => i.id === id) ?? mockIssues[2];

  const [currentStatus, setCurrentStatus] = useState(issue?.status || 'Reported');
  const [note, setNote] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Evidence Upload State
  const [isResolvingMode, setIsResolvingMode] = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (issue) {
      setCurrentStatus(issue.status);
    }
  }, [issue]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-body-lg">Loading issue details...</div>;
  }
  
  if (!issue) {
    return <div className="p-8 text-center text-on-surface-variant font-body-lg">Issue not found.</div>;
  }

  // Find the reporting user to show their credibility
  const reporter = LEADERBOARD.find(u => u.id === issue.citizenId) ?? LEADERBOARD[2];

  async function handleStatusUpdate(nextStatus: IssueStatus) {
    if (nextStatus === 'Resolved' && !isResolvingMode) {
      setIsResolvingMode(true);
      return;
    }

    if (nextStatus === 'Resolved' && !resolvedImage) {
      setImageError('Proof photo is required to resolve this issue.');
      return;
    }

    setIsSavingStatus(true);
    try {
      const updateData: any = {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      
      if (nextStatus === 'Resolved') {
        updateData.resolvedAt = new Date().toISOString();
        if (resolvedImage) {
          updateData.resolvedImage = resolvedImage;
        }
      }

      await updateDoc(doc(db, 'reports', issue.id), updateData);
      
      setCurrentStatus(nextStatus);
      if (nextStatus === 'Resolved') {
        setIsResolvingMode(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function handleSaveNote() {
    if (!note.trim()) return;
    setIsSavingNote(true);
    try {
      await updateDoc(doc(db, 'reports', issue.id), {
        notes: arrayUnion({
          text: note.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
      setNote('');
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setImageError('File size exceeds 10MB. Please choose a smaller image.');
        e.target.value = '';
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setResolvedImage(compressedBase64);
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Back nav */}
      <button
        onClick={() => navigate('/authority')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4 font-label-lg text-label-lg"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back to Queue
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="md:col-span-2 space-y-4">
          {/* Hero Image */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 rounded-xl overflow-hidden aspect-video relative border border-outline-variant shadow-sm">
              <img className="w-full h-full object-cover" src={issue.image} alt={issue.title} />
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <StatusChip status={currentStatus} showIcon />
                <SeverityBadge severity={issue.severity} />
              </div>
              <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface">Before</span>
              </div>
            </div>
            
            {issue.resolvedImage && (
              <div className="flex-1 rounded-xl overflow-hidden aspect-video relative border border-emerald-500/50 shadow-sm">
                <img className="w-full h-full object-cover" src={issue.resolvedImage} alt="Resolved Proof" />
                <div className="absolute top-2 right-2">
                  <span className="bg-emerald-500 text-white font-label-sm text-label-sm px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Verified
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface">After</span>
                </div>
              </div>
            )}
          </div>

          {/* Title + Meta */}
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">{issue.title}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>{issue.location}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>Reported by {issue.citizenName} · {new Date(issue.createdAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 bg-surface-container border border-outline-variant rounded-md px-2 py-0.5">
                <span className="material-symbols-outlined text-[12px] text-emerald-500">verified</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Trust Score: {reporter.trustScore}%</span>
              </div>
            </div>
          </div>

          {/* Citizen description */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">description</span>
              Citizen Report
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{issue.description}</p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant">
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                <span className="font-label-sm text-label-sm">{issue.upvotes} citizens confirmed</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span className="font-label-sm text-label-sm">{issue.aiConfidence}% AI confidence</span>
              </div>
            </div>
          </div>

          {/* AI Rationale */}
          <AIRationalePanel logs={issue.agentLog} confidence={issue.aiConfidence} />

          {/* Department Override */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">alt_route</span>
                Department Assignment
              </h3>
              <button onClick={() => setShowOverride(!showOverride)} className="text-primary font-label-sm text-label-sm hover:underline">
                {showOverride ? 'Cancel' : 'Override'}
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              AI routed to: <strong className="text-on-surface">{issue.category} Department</strong>
            </p>
            {showOverride && (
              <div className="mt-3 flex flex-wrap gap-2">
                {['Roads', 'Water', 'Electricity', 'Sanitation', 'Parks & Rec'].map(d => (
                  <button key={d} className="px-3 py-1.5 rounded-full border border-outline-variant font-label-sm text-label-sm text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all">
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions panel */}
        <div className="space-y-4">
          {/* Status Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-3">Update Status</h3>
            
            {isResolvingMode ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Add Proof of Resolution
                </h4>
                
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-surface-container-high group flex items-center justify-center border-2 border-dashed border-outline-variant">
                  {resolvedImage ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="Resolved evidence"
                      src={resolvedImage}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">add_photo_alternate</span>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Tap to upload photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-black/20 flex items-end justify-center p-3 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">{resolvedImage ? 'change_circle' : 'upload'}</span>
                      {resolvedImage ? 'Change Photo' : 'Upload Proof'}
                    </div>
                  </div>
                </div>
                
                {imageError && (
                  <p className="font-label-sm text-label-sm text-red-500">{imageError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsResolvingMode(false);
                      setResolvedImage(null);
                      setImageError('');
                    }}
                    className="flex-1 h-11 border border-outline-variant rounded-xl font-label-lg text-label-lg text-on-surface hover:bg-surface-variant/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('Resolved')}
                    disabled={!resolvedImage || isSavingStatus}
                    className="flex-1 h-11 bg-emerald-500 text-white rounded-xl font-label-lg text-label-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingStatus ? 'Saving...' : 'Confirm Resolution'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {STATUS_ACTIONS.map(action => (
                  <button
                    key={action.next}
                    onClick={() => handleStatusUpdate(action.next)}
                    disabled={currentStatus === action.next || isSavingStatus || (action.next === 'Resolved' && currentStatus === 'Resolved')}
                    className={`w-full h-11 rounded-xl border font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.color}`}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                    {isSavingStatus && currentStatus !== action.next ? 'Saving...' : action.label}
                    {currentStatus === action.next && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Internal Note */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-3">Internal Note</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-outline-variant rounded-xl p-3 font-body-sm text-body-sm text-on-surface bg-surface-container focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              placeholder="Add note for team members…"
              rows={3}
            />
            <button
              onClick={handleSaveNote}
              disabled={isSavingNote || !note.trim()}
              className="w-full mt-2 h-10 bg-surface-container border border-outline-variant rounded-xl font-label-sm text-label-sm text-on-surface hover:bg-surface-variant/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingNote ? 'Saving...' : noteSaved ? '✓ Note Saved!' : 'Save Note'}
            </button>
          </div>

          {/* SLA Info */}
          <div className="bg-orange-50 border border-orange-400/30 rounded-xl p-4">
            <h3 className="font-label-lg text-label-lg text-orange-700 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              SLA Status
            </h3>
            <p className="font-body-sm text-body-sm text-orange-700">
              Deadline: <strong>{new Date(issue.slaDeadline).toLocaleString()}</strong>
            </p>
            <p className="font-label-sm text-label-sm text-orange-600 mt-1">⚠ Less than 8 hours remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}