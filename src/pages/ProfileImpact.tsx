import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIssues, seedDatabase } from '../hooks/useIssues';
import { useUsers } from '../hooks/useUsers';
import { useRole } from '../context/RoleContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AvatarCustomizer from '../components/AvatarCustomizer';

const TABS = ['My Reports', 'Badges', 'Leaderboard'];

export default function ProfileImpact() {
  const [activeTab, setActiveTab] = useState('My Reports');
  const [isSeeding, setIsSeeding] = useState(false);
  const { issues } = useIssues();
  const { users: allUsers } = useUsers();
  const { currentUser, userData, loading } = useRole();

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  const uid = currentUser?.uid;
  const myIssues = issues.filter(i => i.citizenId === uid);
  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length;
  const totalCount = myIssues.length;

  // Compute trust score: starts at 50, +5 per report, +10 per resolved, capped at 99
  const trustScore = Math.min(99, 50 + totalCount * 5 + resolvedCount * 10);

  // Badge unlock conditions based on real issue data
  const roadCount = myIssues.filter(i => i.category === 'Roads').length;
  const waterCount = myIssues.filter(i => i.category === 'Water').length;
  const parkCount = myIssues.filter(i => i.category === 'Parks & Rec').length;

  const BADGES = useMemo(() => [
    {
      id: 'first_responder',
      name: 'First Responder',
      icon: 'flash_on',
      desc: 'Submit your first report',
      color: 'bg-primary/10 text-primary',
      unlocked: totalCount >= 1,
      progress: `${Math.min(totalCount, 1)}/1`,
    },
    {
      id: 'road_warrior',
      name: 'Road Warrior',
      icon: 'directions_car',
      desc: 'Report 3+ road issues',
      color: 'bg-secondary-container text-on-secondary-container',
      unlocked: roadCount >= 3,
      progress: `${Math.min(roadCount, 3)}/3`,
    },
    {
      id: 'water_watcher',
      name: 'Water Watcher',
      icon: 'water_drop',
      desc: 'Report 2+ water issues',
      color: 'bg-blue-100 text-blue-700',
      unlocked: waterCount >= 2,
      progress: `${Math.min(waterCount, 2)}/2`,
    },
    {
      id: 'park_keeper',
      name: 'Park Keeper',
      icon: 'park',
      desc: 'Report 2+ parks issues',
      color: 'bg-emerald-100 text-emerald-700',
      unlocked: parkCount >= 2,
      progress: `${Math.min(parkCount, 2)}/2`,
    },
    {
      id: 'champion',
      name: 'Community Champion',
      icon: 'emoji_events',
      desc: 'Get 3+ reports resolved',
      color: 'bg-amber-100 text-amber-700',
      unlocked: resolvedCount >= 3,
      progress: `${Math.min(resolvedCount, 3)}/3`,
    },
  ], [totalCount, roadCount, waterCount, parkCount, resolvedCount]);

  const unlockedCount = BADGES.filter(b => b.unlocked).length;

  // Real Leaderboard calculation based on live issues
  const realLeaderboard = useMemo(() => {
    const userStats: Record<string, { id: string; name: string; reportsCount: number; resolvedCount: number; points: number; avatar: string }> = {};

    issues.forEach(issue => {
      if (!issue.citizenId) return;
      
      if (!userStats[issue.citizenId]) {
        const matchedUser = allUsers.find(u => u.id === issue.citizenId);
        userStats[issue.citizenId] = {
          id: issue.citizenId,
          name: matchedUser?.name || issue.citizenName || 'Unknown Citizen',
          reportsCount: 0,
          resolvedCount: 0,
          points: 0,
          avatar: matchedUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.citizenName || issue.citizenId}`
        };
      }

      userStats[issue.citizenId].reportsCount += 1;
      if (issue.status === 'Resolved') {
        userStats[issue.citizenId].resolvedCount += 1;
      }
    });

    // Calculate points and sort
    return Object.values(userStats)
      .map(user => ({
        ...user,
        points: user.reportsCount * 50 + user.resolvedCount * 100
      }))
      .sort((a, b) => b.points - a.points);
  }, [issues, allUsers]);

  const displayName = userData?.name || 'Citizen';
  const avatarSeed = userData?.name || 'User';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
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

  return (
    <div className="pb-10" style={{ background: 'linear-gradient(180deg, #faf8ff 0%, #f0f0fb 100%)' }}>
      {/* Profile Identity */}
      <div className="px-margin-mobile pt-stack-gap pb-section-gap max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-4 shadow-sm flex items-center gap-4 relative overflow-hidden mb-4">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div 
            className="relative w-16 h-16 shrink-0 cursor-pointer group"
            onClick={() => setIsCustomizerOpen(true)}
          >
            <img 
              className={`w-full h-full object-cover rounded-full border-2 border-primary-container shadow-sm transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'}`} 
              src={avatarUrl} 
              alt={displayName} 
            />
            {isUploadingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                <span className="material-symbols-outlined text-white text-[20px]">edit</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-primary-container text-on-primary border-2 border-surface-container-lowest rounded-full w-6 h-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          
          <AvatarCustomizer 
            isOpen={isCustomizerOpen} 
            onClose={() => setIsCustomizerOpen(false)} 
            onSave={handleSaveAvatar} 
            initialSeed={avatarSeed} 
          />
          <div>
            <h2 className="font-headline-md text-headline-md-mobile text-on-surface">{displayName}</h2>
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" /> Active Contributor
            </span>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="col-span-1 bg-gradient-to-br from-primary-container to-[#0053db] text-on-primary-container rounded-[16px] p-3 shadow-md flex flex-col justify-between h-[100px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">Badges</span>
            <div>
              <span className="text-2xl font-bold">{unlockedCount}</span>
              <span className="font-body-sm text-body-sm opacity-70 ml-1">unlocked</span>
            </div>
          </div>
          <div className="col-span-1 bg-surface-container border border-outline-variant rounded-[16px] p-3 h-[100px] flex flex-col justify-between">
            <div className="flex justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Reports</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">article</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-on-surface">{totalCount}</span>
              <p className="font-label-sm text-label-sm text-secondary">{resolvedCount} resolved</p>
            </div>
          </div>
          <div className="col-span-1 bg-surface-container border border-outline-variant rounded-[16px] p-3 h-[100px] flex flex-col justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Trust</span>
            <div>
              <span className="text-2xl font-bold text-on-surface">{totalCount > 0 ? trustScore : '—'}%</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">credibility</p>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            setIsSeeding(true);
            await seedDatabase();
            setIsSeeding(false);
            alert('Database seeded!');
          }}
          disabled={isSeeding}
          className="w-full bg-secondary-container text-on-secondary-container h-12 rounded-xl font-label-lg mb-8"
        >
          {isSeeding ? 'Seeding...' : 'Seed Mock Data to Firebase'}
        </button>

        {/* Civic Credibility */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-4 mb-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md-mobile text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">gpp_good</span>
              Civic Credibility
            </h3>
            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-label-sm text-label-sm">
              {trustScore >= 80 ? 'Highly Reliable' : trustScore >= 50 ? 'Reliable' : 'Building Trust'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ededf9" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#004ac6" strokeWidth="4"
                  strokeDasharray={`${totalCount > 0 ? trustScore : 0} ${100 - (totalCount > 0 ? trustScore : 0)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-on-surface">{totalCount > 0 ? trustScore : '—'}%</span>
                <span className="text-[10px] text-on-surface-variant">Trust</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                    Verified Reports
                  </span>
                  <span className="font-label-lg text-label-lg font-bold">{resolvedCount}</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-orange-400">article</span>
                    Pending / In Progress
                  </span>
                  <span className="font-label-lg text-label-lg font-bold">{totalCount - resolvedCount}</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${totalCount > 0 ? ((totalCount - resolvedCount) / totalCount) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 text-center bg-surface-container py-2 rounded-lg">
            High trust scores ensure your reports are prioritized by the AI agent.
          </p>
        </div>

        {/* Impact line */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Your <strong>{resolvedCount} resolved reports</strong> have improved your community.{' '}
            {totalCount === 0 && <span className="text-on-surface-variant">Submit your first report to get started!</span>}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 font-label-lg text-label-lg transition-colors border-b-2 -mb-px ${
                activeTab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* My Reports Tab */}
        {activeTab === 'My Reports' && (
          <div className="space-y-3">
            {myIssues.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] block mb-2 opacity-40">inbox</span>
                <p className="font-body-lg text-body-lg">No reports yet.</p>
                <Link to="/report" className="mt-3 inline-block text-primary font-label-lg text-label-lg hover:underline">
                  Submit your first report →
                </Link>
              </div>
            )}
            {myIssues.map(issue => (
              <Link
                key={issue.id}
                to={`/issue/${issue.id}`}
                className="block bg-surface-container-lowest border border-outline-variant rounded-[16px] p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className={`px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${issue.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-400/10 text-amber-600'}`}>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {issue.status === 'Resolved' ? 'check_circle' : 'schedule'}
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold">{issue.status}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{issue.trackingId}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <img className="w-12 h-12 rounded-lg object-cover shrink-0" src={issue.image} alt={issue.title} />
                  <div>
                    <h4 className="font-label-lg text-label-lg text-on-surface">{issue.title}</h4>
                    <span className="font-body-sm text-[13px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>{issue.location}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'Badges' && (
          <div className="grid grid-cols-1 gap-3">
            {BADGES.map(b => (
              <div
                key={b.id}
                className={`border rounded-[12px] p-4 flex items-center gap-4 shadow-sm transition-all ${
                  b.unlocked ? 'bg-surface-container-lowest border-outline-variant' : 'bg-surface-container border-dashed border-outline-variant opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${b.unlocked ? b.color : 'bg-surface-variant text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-label-lg text-on-surface font-semibold">{b.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{b.desc}</p>
                  {!b.unlocked && (
                    <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{b.progress} progress</p>
                  )}
                </div>
                {b.unlocked
                  ? <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  : <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                }
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'Leaderboard' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-400/30 rounded-xl px-4 py-2.5 mb-3">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">info</span>
              <p className="font-label-sm text-label-sm text-emerald-800">
                Live leaderboard driven by real civic reports.
              </p>
            </div>
            {realLeaderboard.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant font-body-sm text-body-sm">
                No users on the leaderboard yet. Be the first!
              </div>
            )}
            {realLeaderboard.map((user, i) => (
              <div key={user.id} className={`flex items-center gap-4 bg-surface-container-lowest border rounded-xl p-3 shadow-sm ${user.id === uid ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  {i + 1}
                </div>
                <img className="w-9 h-9 rounded-full object-cover border-2 border-outline-variant" src={user.avatar} alt={user.name} />
                <div className="flex-1 min-w-0">
                  <p className={`font-label-lg text-label-lg truncate ${user.id === uid ? 'text-primary font-bold' : 'text-on-surface'}`}>
                    {user.name}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{user.reportsCount} reports</p>
                </div>
                <div className="text-right">
                  <p className="font-label-lg text-label-lg text-on-surface font-semibold">{user.points}</p>
                  <p className="font-label-sm text-label-sm text-secondary">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
