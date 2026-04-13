import type { Request, Response } from "express";
import { COOKIE_NAME } from "../../shared/const.js";

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Context {
  req: Request;
  res: Response;
  user: User | null;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  let user: User | null = null;

  try {
    const sessionToken = req.cookies?.[COOKIE_NAME] ??
      req.headers.authorization?.replace("Bearer ", "");

    if (sessionToken) {
      // In development, accept any token as a placeholder user
      // In production this would verify the JWT against the OAuth server
      if (process.env.NODE_ENV === "development") {
        user = { id: "dev-user", name: "Dev User", email: "dev@caliq.app" };
      }
    }
  } catch {
    // Invalid token — user stays null
  }

  return { req, res, user };
}
