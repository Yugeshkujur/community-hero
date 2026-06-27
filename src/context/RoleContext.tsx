import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserRole, User } from '../data/mockData';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void; // Keeping for compatibility, but ideally driven by Firebase
  isAuthority: boolean;
  isCitizen: boolean;
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
  isAuthority: false,
  isCitizen: false,
  currentUser: null,
  userData: null,
  loading: true,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user document from Firestore to get their role and details
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            setUserData(data);
            setRole(data.role === 'citizen' ? 'citizen' : 'authority');
          } else {
            // Document may not exist yet (race with sign-up write).
            // Preserve the role already set by the Login page instead of resetting.
            setRole((prev) => prev ?? 'citizen');
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole((prev) => prev ?? 'citizen');
        }
      } else {
        setRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{
      role,
      setRole, // You might want to remove this eventually if purely driven by Auth
      isAuthority: role === 'authority',
      isCitizen: role === 'citizen',
      currentUser,
      userData,
      loading
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-surface-container">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
            <p className="text-on-surface-variant text-sm">Loading…</p>
          </div>
        </div>
      ) : children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
