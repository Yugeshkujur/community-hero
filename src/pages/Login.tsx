import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { stripUndefined } from '../lib/sanitize';
import type { User } from '../data/mockData';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = (queryParams.get('role') as 'citizen' | 'authority') || 'citizen';

  const { setRole } = useRole();
  const [activeTab, setActiveTab] = useState<'citizen' | 'authority'>(initialRole);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isForgotIdMode, setIsForgotIdMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Create a dummy email based on role to use Firebase Email Auth simply
      const email = activeTab === 'citizen'
        ? `${identifier.replace(/[^a-zA-Z0-9]/g, '')}@citizen.local`
        : `${identifier.replace(/[^a-zA-Z0-9]/g, '')}@authority.local`;

      if (isSignUpMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userData: User = {
          id: uid,
          name: fullName,
          role: activeTab as 'citizen' | 'authority',
          ...(activeTab === 'citizen' && { phone: identifier }),
          ...(activeTab === 'authority' && { employeeId: identifier, departmentId: department }),
        };

        await setDoc(doc(db, 'users', uid), stripUndefined(userData));
        setRole(activeTab);
        navigate(activeTab === 'citizen' ? '/home' : '/authority');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setRole(activeTab);
        navigate(activeTab === 'citizen' ? '/home' : '/authority');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  // Handle simple toggles and clear form
  const toggleMode = (mode: 'signup' | 'login' | 'otp' | 'forgot') => {
    setIsSignUpMode(mode === 'signup');
    setIsOtpMode(mode === 'otp');
    setIsForgotIdMode(mode === 'forgot');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 relative" style={{ backgroundImage: 'radial-gradient(at 50% 0%, #dbe1ff 0px, transparent 50%)' }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-8 md:left-8 w-12 h-12 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all shadow-sm"
        aria-label="Back to home"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      {/* Brand Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface font-bold">Community Hero</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Sign in to continue</p>
      </div>

      {/* Login Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-xl overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-outline-variant bg-surface-container/30">
          <button
            onClick={() => { setActiveTab('citizen'); toggleMode('login'); }}
            className={`flex-1 py-4 font-label-lg text-label-lg transition-colors border-b-2 -mb-px flex items-center justify-center gap-2 ${activeTab === 'citizen' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'citizen' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            Citizen
          </button>
          <button
            onClick={() => { setActiveTab('authority'); toggleMode('login'); }}
            className={`flex-1 py-4 font-label-lg text-label-lg transition-colors border-b-2 -mb-px flex items-center justify-center gap-2 ${activeTab === 'authority' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'authority' ? "'FILL' 1" : "'FILL' 0" }}>admin_panel_settings</span>
            Authority
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
                {errorMsg}
              </div>
            )}

            {activeTab === 'citizen' ? (
              isSignUpMode ? (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">+91</span>
                      <input
                        type="tel"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Mobile Number"
                        className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => toggleMode('login')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Already have an account? Log In
                    </button>
                  </div>
                </>
              ) : isOtpMode ? (
                <>
                  <div className="text-center mb-6">
                    <span className="material-symbols-outlined text-emerald-500 text-[40px] mb-2">mark_email_read</span>
                    <p className="font-body-lg text-body-lg text-on-surface">We sent a 6-digit OTP to your mobile number.</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">+91 {identifier}</p>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide text-center">Enter OTP</label>
                    <input
                      type="text"
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-headline-md text-headline-md text-center tracking-[0.5em] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <button type="button" onClick={() => toggleMode('login')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Back to Password Login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">+91</span>
                      <input
                        type="tel"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Mobile Number"
                        className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={() => toggleMode('signup')} className="font-label-sm text-label-sm text-primary hover:underline">
                      New here? Sign Up
                    </button>
                    <button type="button" onClick={() => toggleMode('otp')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                </>
              )
            ) : (
              isSignUpMode ? (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Officer Sharma"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Gov Employee ID</label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. GOV-XXX-123"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Department</label>
                    <select
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    >
                      <option value="">Select Department</option>
                      <option value="roads">Roads</option>
                      <option value="water">Water</option>
                      <option value="electricity">Electricity</option>
                      <option value="sanitation">Sanitation</option>
                      <option value="parks">Parks & Rec</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => toggleMode('login')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Already have an account? Log In
                    </button>
                  </div>
                </>
              ) : isForgotIdMode ? (
                <>
                  <div className="text-center mb-6">
                    <span className="material-symbols-outlined text-primary text-[40px] mb-2">badge</span>
                    <p className="font-body-lg text-body-lg text-on-surface">Retrieve your Employee ID</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Enter your registered government email or phone</p>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Email or Phone</label>
                    <input
                      type="text"
                      placeholder="e.g., anil.kumar@gov.in"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <button type="button" onClick={() => toggleMode('login')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Back to Login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Gov Employee ID</label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Employee ID"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wide">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={() => toggleMode('signup')} className="font-label-sm text-label-sm text-primary hover:underline">
                      New Officer? Sign Up
                    </button>
                    <button type="button" onClick={() => toggleMode('forgot')} className="font-label-sm text-label-sm text-primary hover:underline">
                      Forgot ID?
                    </button>
                  </div>
                </>
              )
            )}

            <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-lg text-label-lg shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
              {loading ? 'Processing...' : (isSignUpMode ? 'Create Account' : activeTab === 'citizen' ? (isOtpMode ? 'Verify OTP & Login' : 'Sign In to Report') : (isForgotIdMode ? 'Send ID' : 'Sign In to Console'))}
              {!loading && <span className="material-symbols-outlined text-[20px]">{isForgotIdMode && activeTab === 'authority' ? 'send' : 'arrow_forward'}</span>}
            </button>
          </form>

          {/* Social Proof / Security */}
          <div className="mt-8 pt-6 border-t border-outline-variant/50 flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant max-w-[200px]">
              Secured with Government Identity Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

