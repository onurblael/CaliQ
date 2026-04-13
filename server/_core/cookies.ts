import type { Request } from "express";
import type { CookieOptions } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
  };
}
