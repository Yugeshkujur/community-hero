import { auth } from './firebase';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';

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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.1-flash-lite";

const SYSTEM_PROMPT = `
You are an AI civic issue triage agent. Your job is to analyze images and descriptions of civic issues (like potholes, broken streetlights, water leaks, etc.) and classify them.

Output ONLY a valid JSON object matching this schema, with NO markdown formatting, backticks, or extra text:
{
  "category": "Roads" | "Water" | "Electricity" | "Sanitation" | "Parks & Rec" | "Other",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "confidence": number (0-100),
  "departmentId": "roads" | "water" | "electricity" | "sanitation" | "parks",
  "slaDeadlineHours": number (e.g. 24, 48, 72),
  "isDuplicate": boolean (always false for now unless specifically asked to check),
  "duplicateOfId": string (optional),
  "citizenNotification": string (A short, friendly message acknowledging the report and giving an ETA),
  "agentLog": [
    { "step": "Perceive", "output": string (What do you see?), "confidence": number, "timestamp": string (ISO format) },
    { "step": "Classify", "output": string (Why this category/severity?), "confidence": number, "timestamp": string (ISO format) },
    { "step": "Route", "output": string (Assigned to which department and why?), "confidence": number, "timestamp": string (ISO format) },
    { "step": "Notify", "output": string (Drafted citizen notification), "confidence": number, "timestamp": string (ISO format) }
  ]
}

Guidelines:
- Severity Critical: Immediate danger to life or property. SLA: 24h
- Severity High: Major disruption but not life-threatening. SLA: 48h
- Severity Medium: Nuisance, localized issue. SLA: 72h
- Severity Low: Minor aesthetic or non-urgent issue. SLA: 168h
`;

function buildGeminiParts(
  description: string,
  base64Image?: string,
  mimeType?: string,
  nearbyIssues?: { id: string; title: string; category: string }[]
): Part[] {
  const parts: Part[] = [
    { text: SYSTEM_PROMPT },
    { text: `User description: ${description}` },
  ];

  if (nearbyIssues && nearbyIssues.length > 0) {
    parts.push({
      text: `Context: The following issues were recently reported within a 1km radius. If the user's description and photo clearly depict the exact same specific issue as one of these, set "isDuplicate" to true and provide its ID in "duplicateOfId":\n${JSON.stringify(nearbyIssues)}`,
    });
  }

  if (base64Image && mimeType) {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType,
      },
    });
  }

  return parts;
}

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

    // Direct Client-Side Gemini Execution (Fallback for Hackathons without Firebase Blaze)
    if (GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const parts = buildGeminiParts(description, base64Image, mimeType, nearbyIssues);

      const result = await model.generateContent(parts);
      const responseText = await result.response.text();
      const match = responseText.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("No JSON object found in Gemini response");
      }

      return JSON.parse(match[0]) as GeminiAnalysis;
    }

    // Proxy Fetch Execution
    // If we're in local dev and have no proxy configured, fail fast to prevent Vite hanging for 100+ seconds
    if (!GEMINI_API_KEY && import.meta.env.DEV && GEMINI_PROXY_URL === '/api/analyzeIssue') {
      throw new Error("Missing VITE_GEMINI_API_KEY in .env. Please add it and RESTART the dev server (`npm run dev`) so Vite picks it up.");
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
