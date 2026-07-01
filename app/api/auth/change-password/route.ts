import { NextRequest, NextResponse } from "next/server";
import { proxyToBE, getAccessToken } from "@/lib/api/proxy.helpers";

// PATCH /api/auth/change-password → PATCH /auth/change-password
export async function PATCH(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const beRes = await proxyToBE("/auth/change-password", {
      method: "PATCH",
      token: accessToken,
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (err) {
    console.error("[/api/auth/change-password]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
