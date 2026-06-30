import { auth } from './firebase';

export interface GeminiAnalysis {
  category: 'Roads' | 'Water' | 'Electricity' | 'Sanitation' | 'Parks & Rec' | 'Other';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  departmentId: string;
  slaDeadlineHours: number;
  isDuplicate: boolean;
  duplicateOfId?: string;
  agentLog: { step: string; output: string; confidence: number; timestamp: string }[];
  citizenNotification: string;
}

const GEMINI_PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || '/api/analyzeIssue';

export async function analyzeIssue(
  description: string,
  base64Image?: string,
  mimeType?: string,
  nearbyIssues?: { id: string; title: string; category: string }[]
): Promise<GeminiAnalysis> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be signed in to classify an issue.');
    }

    const token = await currentUser.getIdToken();
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        base64Image,
        mimeType,
        nearbyIssues,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.error || 'AI classification request failed');
    }

    return await response.json() as GeminiAnalysis;
  } catch (error) {
    console.error("Gemini classification failed:", error);
    throw new Error("Failed to classify issue with AI");
  }
}
