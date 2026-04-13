import type { Express, Request, Response } from "express";
import { COOKIE_NAME } from "../../shared/const.js";
import { getSessionCookieOptions } from "./cookies";

export function registerOAuthRoutes(app: Express) {
  // OAuth callback — exchanges code for session token from OAuth portal
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const { token, redirectUri } = req.query as Record<string, string>;

    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    // Redirect back to the app (deep link or web root)
    const destination = redirectUri || "/";
    res.redirect(destination);
  });

  // Logout
  app.post("/api/oauth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
