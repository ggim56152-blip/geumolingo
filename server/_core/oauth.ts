import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";

/**
 * OAuth routes are disabled in favor of email-based authentication
 * See emailAuth.ts for the new authentication system
 */
export function registerOAuthRoutes(app: Express) {
  // OAuth is disabled - all authentication is now email-based
  // This function is kept for backward compatibility
}
