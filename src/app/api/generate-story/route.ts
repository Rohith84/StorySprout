import { NextRequest, NextResponse } from "next/server";
import type { StoryPayload } from "@/lib/auth-types";

/**
 * POST /api/generate-story
 *
 * Placeholder endpoint — echoes the received JSON so the wizard
 * data capture can be verified before the FastAPI backend is wired up.
 *
 * In production, replace the body of this function with:
 *   const result = await fetch(`${FASTAPI_URL}/generate-story`, { method:"POST", body, ... });
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

  // Basic shape validation
  const payload = body as Partial<StoryPayload>;
  const required: (keyof StoryPayload)[] = [
    "heroType", "incident", "lesson", "moral", "theme",
    "storyType", "length", "artStyle",
  ];

  const missing = required.filter((k) => !payload[k]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  // Echo back exactly what was received so the frontend can confirm
  // every field was captured correctly.
  return NextResponse.json(
    {
      received: payload,
      status: "ok",
      message: "Payload captured successfully. Story generation will begin here.",
      _note: "This is a placeholder. Connect to FastAPI /generate-story in production.",
    },
    { status: 200 }
  );
}

/** Return 405 for all other methods */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
