@AGENTS.md
# StorySprout — Project Context

## What this is
StorySprout is a web app for the IBM AI Builders Challenge (Creative Industries, July 2026).
A parent signs in, answers a wizard (or Quick mode), and the AI generates a personalized
children's storybook with illustrations, narration, quizzes, and vocabulary.

## Non-negotiable rules
- The story-generating AI MUST be IBM Granite via watsonx (this is required for the challenge).
- Child safety first: every generated story and image is checked; never store a child's real name or data.
- It's a WEB app (responsive), not a mobile app.

## Stack
- Frontend: Next.js + React + TypeScript + Tailwind (in /src)
- Backend: FastAPI (Python) in /backend, calls Granite via watsonx
- Database: MongoDB (planned)
- Auth: Google OAuth (planned)

## How I want you to work
- Always use Plan mode and show the plan before running.
- Build ONE feature at a time; don't add features I haven't asked for.
- Keep changes small and simple. Don't rewrite working files unnecessarily.
- Never commit secrets; keep .env in .gitignore.

## Current status
Frontend prototype done (all pages + wizard). Backend skeleton works (/health ok).
Currently wiring the backend to Granite (/test-granite), then real story generation.