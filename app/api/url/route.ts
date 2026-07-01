import { NextRequest, NextResponse } from "next/server";
import { proxyToBE, getAccessToken } from "@/lib/api/proxy.helpers";

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const cursor = searchParams.get("cursor") || "";
    const limit = searchParams.get("limit") || "20";
    const query = cursor ? `?cursor=${cursor}&limit=${limit}` : `?limit=${limit}`;

    const beRes = await proxyToBE(`/url${query}`, {
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
      ...(accessToken ? { token: accessToken } : {}),
    });

    const data = await beRes.json();
    return NextResponse.json(data.data ?? data, { status: beRes.status });
  } catch (err) {
    console.error("[POST /api/url]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
