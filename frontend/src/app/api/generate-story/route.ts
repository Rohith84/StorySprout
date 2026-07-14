import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

/**
 * POST /api/generate-story
 *
 * Forwards the wizard payload to the FastAPI backend at FASTAPI_URL/generate-story
 * and streams the story JSON back to the frontend.
 */
export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  let fastapiRes: Response;
  try {
    fastapiRes = await fetch(`${FASTAPI_URL}/generate-story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach story generation service.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Forward whatever status + body FastAPI returned
  const data = await fastapiRes.json();
  return NextResponse.json(data, { status: fastapiRes.status });
}

/** Return 405 for all other methods */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
