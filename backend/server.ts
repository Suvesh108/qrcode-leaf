import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/db";
import { generateQRHandler } from "./src/api";
import { pushTemplateHandler } from "./src/templet/pushHandler";
import { listTemplatesHandler } from "./src/templet/listHandler";
import { loginHandler, registerHandler, requireAdmin } from "./src/auth";
import { getAnalytics } from "./src/analyticsStore";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Dynamic QR Redirect tracking endpoint
app.get("/scan/:id", (req, res) => {
  try {
    const { id } = req.params;
    const gen = db.prepare("SELECT url FROM generations WHERE id = ?").get(id) as { url: string } | undefined;
    if (!gen) {
      res.status(404).send("<div style='text-align:center;padding:50px;font-family:sans-serif;'><h1>404 - QR Campaign Not Found</h1><p>This QR Code does not point to an active campaign.</p></div>");
      return;
    }

    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "unknown";

    db.prepare(`
      INSERT INTO scans (generationId, ip, userAgent, timestamp)
      VALUES (?, ?, ?, ?)
    `).run(id, ip, userAgent, new Date().toISOString());

    // Bumps scanValid to show it's functional
    db.prepare(`
      UPDATE generations
      SET attempts = attempts + 1
      WHERE id = ?
    `).run(id);

    res.redirect(gen.url);
  } catch (err) {
    console.error("[SCAN TRACKING ERROR]:", err);
    res.status(500).send("<div style='text-align:center;padding:50px;font-family:sans-serif;'><h1>500 - Redirect Error</h1><p>Failed to record analytics scan.</p></div>");
  }
});

app.post("/api/generate", generateQRHandler);
app.get("/api/templates", listTemplatesHandler);
app.post("/api/templates/push", requireAdmin as any, pushTemplateHandler);
app.post("/api/auth/login", loginHandler);
app.post("/api/auth/register", registerHandler);
app.get("/api/analytics", (req, res) => {
  res.json(getAnalytics());
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
