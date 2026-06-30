import { NextRequest, NextResponse } from "next/server";
import {
  proxyToBE,
  clearAuthCookies,
  getAccessToken,
} from "@/lib/api/proxy.helpers";

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);

    // Notify BE (best-effort — clear cookies regardless)
    if (accessToken) {
      await proxyToBE("/auth/logout", {
        method: "POST",
        token: accessToken,
      }).catch(() => {
        // Swallow BE errors — we still clear local cookies
      });
    }

    const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    clearAuthCookies(res);
    return res;
  } catch (err) {
    console.error("[/api/auth/logout]", err);
    // Always clear cookies even on error
    const res = NextResponse.json(
      { message: "Logged out" },
      { status: 200 }
    );
    clearAuthCookies(res);
    return res;
  }
}
