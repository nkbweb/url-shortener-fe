import { NextRequest, NextResponse } from "next/server";
import { proxyToBE } from "@/lib/api/proxy.helpers";

// POST /api/auth/reset-password
// Body: { token: string; newPassword: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const beRes = await proxyToBE("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await beRes.json();

    if (!beRes.ok) {
      return NextResponse.json(data, { status: beRes.status });
    }

    return NextResponse.json({ message: data.message }, { status: 200 });
  } catch (err) {
    console.error("[/api/auth/reset-password]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
