import { NextResponse } from "next/server";

import { createUploadSession } from "@/features/admin/server/upload-sessions";

export const runtime = "nodejs";

export async function POST(request, { params }) {
    const origin = request.headers.get("origin");
    if (origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }
    try {
        const result = await createUploadSession({ galleryId: (await params).id, files: body?.files });
        if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
        return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Upload session creation failed:", error);
        return NextResponse.json({ error: "Upload authorization is unavailable." }, { status: 503 });
    }
}
