import { NextRequest, NextResponse } from "next/server";
import {
  proxyToBE,
  setAuthCookies,
  getRefreshToken,
} from "@/lib/api/proxy.helpers";

// POST /api/auth/refresh
// BE expects: { refreshToken: string } in request body
export async function POST(req: NextRequest) {
  try {
    // Read refresh token from httpOnly cookie
    const refreshToken = getRefreshToken(req);

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token found" },
        { status: 401 }
      );
    }

    const beRes = await proxyToBE("/auth/refresh", {
      method: "POST",
      // Forward refreshToken in the body as BE expects
      body: JSON.stringify({ refreshToken }),
    });

    const data = await beRes.json();

    if (!beRes.ok) {
      return NextResponse.json(data, { status: beRes.status });
    }

    const res = NextResponse.json({ message: "Token refreshed" }, { status: 200 });

    // Update cookies with new tokens (BE wraps tokens in data.data)
    const newAccess = data.data?.accessToken;
    const newRefresh = data.data?.refreshToken ?? refreshToken;
    setAuthCookies(res, newAccess, newRefresh);

    return res;
  } catch (err) {
    console.error("[/api/auth/refresh]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
