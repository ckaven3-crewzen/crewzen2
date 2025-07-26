# CrewZen Project Management Platform

CrewZen is a modular project management platform built with Next.js, Firebase, and Genkit AI. It supports construction project tracking, employee onboarding, AI-powered voice-to-task, and more.

## Features
- Modular tabs for Projects (ProZen), Employees (CrewZen), Companies (ConnectZen), and more
- AI voice-to-task: create tasks from voice notes using Google AI
- Employee onboarding with photo/document upload and Firestore sync
- Real-time updates and notifications
- Built with Next.js, Firebase, TypeScript, and Radix UI

## Quick Start
1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd crewzen
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` (or `.env.local` if you prefer)
   - Add your Firebase and Google AI API keys:
     ```
     GOOGLE_AI_API_KEY=your-google-ai-api-key
     FIREBASE_API_KEY=your-firebase-api-key
     # ...other required keys
     ```
4. **Run the app locally:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
5. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

## Documentation
- See [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md) for full setup, usage, and development details.
- See [`docs/ONBOARDING_DATA_FLOW.md`](docs/ONBOARDING_DATA_FLOW.md) for onboarding and data flow diagrams.

---

*This project is under active development. Contributions and feedback are welcome!*
