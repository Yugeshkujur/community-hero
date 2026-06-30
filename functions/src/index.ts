import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const MODEL_NAME = "gemini-3.1-flash-lite";

interface AnalyzeIssueRequest {
  description?: string;
  base64Image?: string;
  mimeType?: string;
  nearbyIssues?: { id: string; title: string; category: string }[];
}

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

function parseBody(body: unknown): AnalyzeIssueRequest {
  if (typeof body === "string") {
    return JSON.parse(body) as AnalyzeIssueRequest;
  }

  if (body && typeof body === "object") {
    return body as AnalyzeIssueRequest;
  }

  return {};
}

function buildGeminiParts(payload: AnalyzeIssueRequest) {
  const { description, base64Image, mimeType, nearbyIssues } = payload;
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

function validatePayload(payload: AnalyzeIssueRequest) {
  if (!payload.description || typeof payload.description !== "string") {
    throw new Error("A text description is required.");
  }

  if (payload.description.length > 4000) {
    throw new Error("Description is too long.");
  }

  if (payload.base64Image && typeof payload.base64Image !== "string") {
    throw new Error("Image payload must be a base64 string.");
  }

  if (payload.mimeType && !payload.mimeType.startsWith("image/")) {
    throw new Error("Only image MIME types are supported.");
  }
}

export const analyzeIssue = onRequest(
  {
    region: "us-central1",
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const token = req.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
      if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      await getAuth().verifyIdToken(token);

      const payload = parseBody(req.body);
      validatePayload(payload);

      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(buildGeminiParts(payload));
      const response = await result.response;
      const text = response.text();
      const match = text.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("No JSON object found in Gemini response");
      }

      res.status(200).type("application/json").send(match[0]);
    } catch (error) {
      console.error("Gemini classification failed:", error);
      res.status(500).json({ error: "Failed to classify issue with AI" });
    }
  }
);
