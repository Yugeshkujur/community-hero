# Community Hero

Community Hero is a modern civic engagement platform built for a hackathon. It allows citizens to report local issues (like potholes, broken streetlights, or water leaks) and uses an AI agent (powered by Gemini) to automatically classify, prioritize, and route these issues to the correct municipal departments.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend & Auth:** Firebase (Auth, Firestore, Storage)
<<<<<<< HEAD
- **AI Triage Agent:** Google Gemini (3.1-flash-lite) via `@google/generative-ai`
=======
- **AI Triage Agent:** Google Gemini(3.1-flash-lite) via `@google/generative-ai`
>>>>>>> b17a7c6 (some small changes)
- **Mapping:** React-Leaflet

## Core Features
1. **AI-Powered Reporting:** Citizens upload photos and descriptions. The Gemini AI agent automatically classifies the issue category, assigns severity, sets an SLA, and routes it.
2. **Duplicate Detection:** The AI cross-references new reports with recent nearby issues to prevent duplicate work.
3. **Authority Dashboard:** Live aggregation of issues across the city, department performance tracking, and actionable queue.
4. **Gamification:** Citizens earn badges and trust scores based on their successful reports, encouraging high-quality civic engagement.

## Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file based on `.env.example` with your Firebase and Gemini API keys.
4. Run `npm run dev` to start the development server.

## Building for Production
Run `npm run build`. The output will be in the `dist` directory.
