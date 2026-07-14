import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  let fastapiRes: Response;
  try {
    fastapiRes = await fetch(`${FASTAPI_URL}/api/shares/${code}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach share service.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (fastapiRes.status === 404) {
    return NextResponse.json({ error: "Share link not found." }, { status: 404 });
  }

  const data = await fastapiRes.json();
  return NextResponse.json(data, { status: fastapiRes.status });
}
