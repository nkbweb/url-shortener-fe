import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.API_BASE_URL!;
const ACCESS_COOKIE = process.env.AUTH_COOKIE_NAME ?? "access_token";
const REFRESH_COOKIE = process.env.REFRESH_COOKIE_NAME ?? "refresh_token";
const IS_PROD = process.env.NODE_ENV === "production";
const COOKIE_MAX_AGE_ACCESS = 60 * 15; // 15 min
const COOKIE_MAX_AGE_REFRESH = 60 * 60 * 24 * 7; // 7 days

/** Helper to set both tokens as httpOnly cookies on a response */
export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE_ACCESS,
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE_REFRESH,
  });
}

/** Helper to clear auth cookies (logout) */
export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
}

/** Helper to read the access token from the incoming request cookies */
export function getAccessToken(req: NextRequest): string | undefined {
  return req.cookies.get(ACCESS_COOKIE)?.value;
}

/** Helper to read the refresh token from the incoming request cookies */
export function getRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(REFRESH_COOKIE)?.value;
}

/** Proxy a request to the BE, forwarding auth header if provided */
export async function proxyToBE(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, headers, ...rest } = options;
  return fetch(`${BE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
  });
}
