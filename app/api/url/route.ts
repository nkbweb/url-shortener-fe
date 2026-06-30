import { NextRequest, NextResponse } from "next/server";
import { proxyToBE, getAccessToken } from "@/lib/api/proxy.helpers";

// GET  /api/url  → GET  /url  (get all URLs for authenticated user)
// POST /api/url  → POST /url/shorten  (create short URL)
export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const beRes = await proxyToBE("/url", {
      method: "GET",
      token: accessToken,
    });

    const data = await beRes.json();
    return NextResponse.json(data.data ?? data, { status: beRes.status });
  } catch (err) {
    console.error("[GET /api/url]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);
    const body = await req.json();

    const beRes = await proxyToBE("/url/shorten", {
      method: "POST",
      body: JSON.stringify(body),
      // Shorten can work unauthenticated too — forward token if present
      ...(accessToken ? { token: accessToken } : {}),
    });

    const data = await beRes.json();
    return NextResponse.json(data.data ?? data, { status: beRes.status });
  } catch (err) {
    console.error("[POST /api/url]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
