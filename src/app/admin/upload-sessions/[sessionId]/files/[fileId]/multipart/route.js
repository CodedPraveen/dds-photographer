import { NextResponse } from "next/server";

import { multipartRequest } from "@/features/admin/server/multipart-upload";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  const body = await request.json().catch(() => null);
  if (!body || !["start", "part", "complete", "abort"].includes(body.action)) {
    return NextResponse.json(
      { error: "Invalid multipart action." },
      { status: 400, headers },
    );
  }
  try {
    const result = await multipartRequest({
      ...(await params),
      action: body.action,
      partNumber: body.partNumber,
    });
    return NextResponse.json(result, { status: result.status ?? 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Multipart operation is unavailable. Retry the request." },
      { status: 503, headers },
    );
  }
}
