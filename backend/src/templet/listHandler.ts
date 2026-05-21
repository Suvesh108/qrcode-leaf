import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/templates
 * Retrieves all registered marketplace templates from the SQLite database.
 * If the database table is currently empty but a backup JSON metadata file exists,
 * it will automatically import/seed the templates into SQLite.
 */
export async function listTemplatesHandler(req: Request, res: Response): Promise<void> {
  try {
    // 1. Fetch from SQLite database
    let templates = db.prepare("SELECT * FROM templates ORDER BY pushedAt DESC").all() as any[];

    // 2. Self-Healing Fallback: Seed SQLite if table is empty but templateMetadata.json exists
    if (templates.length === 0) {
      const metaPath = path.join(__dirname, "templateMetadata.json");
      if (fs.existsSync(metaPath)) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          const backupTemplates = JSON.parse(raw) as any[];

          const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO templates (id, name, category, style, image, pushedAt)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          for (const t of backupTemplates) {
            insertStmt.run(t.id, t.name, t.category, t.style, t.image, t.pushedAt || new Date().toISOString());
          }

          // Re-fetch templates from database
          templates = db.prepare("SELECT * FROM templates ORDER BY pushedAt DESC").all() as any[];
          console.log(`[DB] Successfully migrated ${backupTemplates.length} templates from templateMetadata.json to SQLite.`);
        } catch (migrationErr) {
          console.error("Failed to migrate templates from JSON to SQLite:", migrationErr);
        }
      }
    }

    res.json({ templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list templates";
    console.error("List templates error:", err);
    res.status(500).json({ error: message });
  }
}
