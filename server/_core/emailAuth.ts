import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import * as crypto from "crypto";
import * as jwt from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

async function createSessionToken(userId: number, email: string): Promise<string> {
  return await new jwt.SignJWT({
    userId,
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1y")
    .sign(JWT_SECRET);
}

export function registerEmailAuthRoutes(app: Express) {
  /**
   * Register endpoint - creates account and auto-logs in
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "이미 가입된 이메일입니다." });
        return;
      }

      // Hash password
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

      // Create user
      const userId = await db.createUser(email, passwordHash, name);

      // Create user profile
      await db.getOrCreateUserProfile(userId);

      // Auto-login: create session token and set cookie
      const token = await createSessionToken(userId, email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: userId, email, name } });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "회원가입에 실패했습니다." });
    }
  });

  /**
   * Login endpoint
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
        return;
      }

      // Get user
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
        return;
      }

      // Verify password
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      if (user.passwordHash !== passwordHash) {
        res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
        return;
      }

      // Update last signed in
      await db.updateLastSignedIn(user.id);

      // Create session token
      const token = await createSessionToken(user.id, email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "로그인에 실패했습니다." });
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
      res.status(500).json({ error: "로그아웃에 실패했습니다." });
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
        res.json({ user: null });
        return;
      }

      const payload = await jwt.jwtVerify(sessionCookie, JWT_SECRET);
      const userId = (payload.payload as any).userId;

      const user = await db.getUserById(userId);
      if (!user) {
        res.json({ user: null });
        return;
      }

      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[Auth] Get user failed", error);
      res.json({ user: null });
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
