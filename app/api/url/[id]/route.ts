import { NextRequest, NextResponse } from "next/server";
import { proxyToBE, getAccessToken } from "@/lib/api/proxy.helpers";

// PATCH /api/url/[id] → PATCH /url/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const beRes = await proxyToBE(`/url/${id}`, {
      method: "PATCH",
      token: accessToken,
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (err) {
    console.error("[PATCH /api/url/[id]]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/url/[id] → DELETE /url/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const beRes = await proxyToBE(`/url/${id}`, {
      method: "DELETE",
      token: accessToken,
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (err) {
    console.error("[DELETE /api/url/[id]]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
