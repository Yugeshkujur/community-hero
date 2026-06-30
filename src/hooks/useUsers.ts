import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../data/mockData';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: User[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}
