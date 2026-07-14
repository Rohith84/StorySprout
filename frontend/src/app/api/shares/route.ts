import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let fastapiRes: Response;
  try {
    fastapiRes = await fetch(`${FASTAPI_URL}/api/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach share service.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const data = await fastapiRes.json();
  return NextResponse.json(data, { status: fastapiRes.status });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
