import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import * as crypto from "crypto";
import * as jwt from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export function registerEmailAuthRoutes(app: Express) {
  /**
   * Register endpoint
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "User already exists" });
        return;
      }

      // Hash password
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

      // Create user
      const userId = await db.createUser(email, passwordHash, name);

      // Create user profile
      await db.getOrCreateUserProfile(userId);

      res.json({ success: true, userId });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * Login endpoint
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Get user
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      if (user.passwordHash !== passwordHash) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Update last signed in
      await db.updateLastSignedIn(user.id);

      // Create session token
      const token = await new jwt.SignJWT({
        userId: user.id,
        email: user.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1y")
        .sign(JWT_SECRET);

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * Logout endpoint
   */
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  /**
   * Get current user endpoint
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sessionCookie = cookies.get(COOKIE_NAME);

      if (!sessionCookie) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const payload = await jwt.jwtVerify(sessionCookie, JWT_SECRET);
      const userId = (payload.payload as any).userId;

      const user = await db.getUserById(userId);
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error("[Auth] Get user failed", error);
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}

function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies.set(name, decodeURIComponent(value));
    }
  });

  return cookies;
}
