import { NextResponse } from "next/server";

import { completeUpload } from "@/features/admin/server/complete-upload";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const { sessionId, fileId } = await params;
  try {
    const result = await completeUpload({ sessionId, fileId });
    if (result.error)
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Upload completion failed:", error);
    return NextResponse.json(
      { error: "Upload verification is unavailable." },
      { status: 503 },
    );
  }
}
