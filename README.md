# HireSense AI — Full-stack Resume Analyzer & Job Matcher

A MERN-style portfolio project: React + Vite frontend, Express API, MongoDB persistence,
PDF/DOCX text extraction, explainable skill matching, and optional LLM-powered feedback.

## Features
- Register/login with JWT and bcrypt
- Upload PDF/DOCX resume
- Paste a job description
- Extract resume text and identify skills
- Explainable match score based on required/preferred skills
- Optional LLM-generated feedback via an OpenAI-compatible API
- Save and view analysis history
- Delete stored analysis
- Basic dashboard with score and skill gaps

**Important:** The score is an informational matching estimate, not a hiring decision or a guarantee of ATS ranking. Do not use it as the sole basis for employment decisions.

## Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas
- Optional LLM API key (OpenAI-compatible)

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Set `MONGODB_URI` and a long random `JWT_SECRET`. LLM features are optional:
- `LLM_BASE_URL` (e.g. provider's OpenAI-compatible base URL)
- `LLM_API_KEY`
- `LLM_MODEL`

### 2. Frontend
In a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal.

## GitHub
Create a public repository named `hiresense-ai`, then:
```bash
git init
git add .
git commit -m "Build HireSense AI full-stack resume analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hiresense-ai.git
git push -u origin main
```

## Security notes before production
- Use HTTPS and secure deployment secrets.
- Add email verification, password reset, rate limiting, malware scanning, and stricter file validation.
- Store files in private object storage rather than the local uploads directory.
- Configure CORS to your exact frontend origin.
- Review privacy/retention requirements before processing real resumes.
- LLM output is treated as untrusted text and is never executed.
