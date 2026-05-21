import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "leafqr_secret_key_2026_spring";

export interface DecodedUser {
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

/**
 * Handles user login queries against the SQLite database and issues a signed JWT token.
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        error: "Please provide both email and password." 
      });
      return;
    }

    const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(email.toLowerCase()) as any;

    if (user && user.password === password) {
      const payload: DecodedUser = {
        name: user.name,
        email: user.email,
        role: user.role
      };

      // Sign the token with a strict 6-hour expiration limit
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "6h" });

      res.json({
        success: true,
        user: payload,
        token
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: "Invalid email or password. Please try again."
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    console.error("Login Handler error:", err);
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Handles user registration queries, inserts profiles securely in SQLite, and returns a signed JWT.
 */
export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: "Please provide all required fields (name, email, password)."
      });
      return;
    }

    const exists = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(email.toLowerCase());
    if (exists) {
      res.status(400).json({
        success: false,
        error: "An account with this email address already exists."
      });
      return;
    }

    // Insert user into SQLite database
    db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)")
      .run(email.toLowerCase(), name, password, "user");

    const payload: DecodedUser = {
      name,
      email: email.toLowerCase(),
      role: "user"
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "6h" });

    res.status(201).json({
      success: true,
      user: payload,
      token
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("Register Handler error:", err);
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Authentication Middleware: Verifies the client-supplied Bearer token.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Access denied. No authorization token supplied." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Access denied. Token is invalid or has expired." });
  }
}

/**
 * Admin Middleware: Requires the authenticated user to hold the 'admin' role scope.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
      return;
    }
    res.status(403).json({ success: false, error: "Access denied. Administrator privileges required." });
  });
}
