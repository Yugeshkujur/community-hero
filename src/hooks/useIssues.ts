import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_ISSUES } from '../data/mockData';
import type { Issue } from '../data/mockData';
import { stripUndefined } from '../lib/sanitize';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIssues: Issue[] = [];
      snapshot.forEach((doc) => {
        fetchedIssues.push({ id: doc.id, ...doc.data() } as Issue);
      });
      setIssues(fetchedIssues);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching issues:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { issues, loading };
}

// Utility function to seed database if needed during dev
export async function seedDatabase() {
  console.log("Seeding database with mock issues...");
  for (const issue of MOCK_ISSUES) {
    try {
      await setDoc(doc(db, 'reports', issue.id), stripUndefined(issue));
      console.log(`Seeded issue: ${issue.id}`);
    } catch (e) {
      console.error(`Failed to seed ${issue.id}:`, e);
    }
  }
  console.log("Seeding complete!");
}
