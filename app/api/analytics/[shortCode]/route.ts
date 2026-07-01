import { NextRequest, NextResponse } from "next/server";
import { proxyToBE, getAccessToken } from "@/lib/api/proxy.helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const beRes = await proxyToBE(`/url/${shortCode}/analytics`, {
      method: "GET",
      token: accessToken,
    });

    const data = await beRes.json();
    return NextResponse.json(data.data ?? data, { status: beRes.status });
  } catch (err) {
    console.error("[GET /api/analytics/:shortCode]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
