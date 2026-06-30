import { NextRequest, NextResponse } from "next/server";
import {
  proxyToBE,
  setAuthCookies,
} from "@/lib/api/proxy.helpers";

// POST /api/auth/register
// Body: { email: string; password: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const beRes = await proxyToBE("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await beRes.json();

    if (!beRes.ok) {
      return NextResponse.json(data, { status: beRes.status });
    }

    // BE returns { success, message, data: { user } }
    const res = NextResponse.json(
      { user: data.data?.user, message: data.message },
      { status: 201 }
    );

    if (data.data?.accessToken && data.data?.refreshToken) {
      setAuthCookies(res, data.data.accessToken, data.data.refreshToken);
    }

    return res;
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
