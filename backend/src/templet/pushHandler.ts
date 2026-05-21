import { Request, Response } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pushSchema = z.object({
  name: z.string().min(1),
  html: z.string().min(1),
  category: z.string().optional(),
  style: z.string().optional(),
  imageName: z.string().optional(),
  imageBase64: z.string().optional(),
});

export interface StoredTemplate {
  id: string;
  name: string;
  category: string;
  style: string;
  image: string;
  pushedAt: string;
}

const METADATA_FILE = path.join(__dirname, "templateMetadata.json");
const LOCK_FILE = path.join(__dirname, "sourceCodes.lock");

/**
 * Tries to acquire a synchronous file lock on the compilation target with retries.
 */
function acquireLock(lockFilePath: string, retries = 5, delayMs = 150): boolean {
  for (let i = 0; i < retries; i++) {
    try {
      fs.writeFileSync(lockFilePath, process.pid.toString(), { flag: "wx" });
      return true;
    } catch {
      // Busy wait spin-lock delay
      const start = Date.now();
      while (Date.now() - start < delayMs) {}
    }
  }
  return false;
}

/**
 * Releases the synchronous file lock on the compilation target.
 */
function releaseLock(lockFilePath: string): void {
  try {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }
  } catch {}
}

function readMetadata(): StoredTemplate[] {
  if (!fs.existsSync(METADATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeMetadata(templates: StoredTemplate[]): void {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(templates, null, 2), "utf-8");
}

export async function pushTemplateHandler(req: Request, res: Response): Promise<void> {
  try {
    const parsed = pushSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request data", details: parsed.error.flatten() });
      return;
    }

    const { name, html, category, style, imageName, imageBase64 } = parsed.data;

    // ── 1. Acquire Concurrency File Lock ─────────────────────────────────────
    if (!acquireLock(LOCK_FILE)) {
      res.status(503).json({ error: "Template compilation engine is currently busy. Please try again." });
      return;
    }

    try {
      // ── 2. Write HTML source code into sourceCodes.ts ────────────────────────
      const filePath = path.join(__dirname, "sourceCodes.ts");

      if (!fs.existsSync(filePath)) {
        res.status(500).json({ error: `sourceCodes.ts not found at: ${filePath}` });
        return;
      }

      let fileContent = fs.readFileSync(filePath, "utf-8");

      const keyPatternDouble = `  "${name}": \``;
      const keyPatternSingle = `  '${name}': \``;

      let existingIndex = fileContent.indexOf(keyPatternDouble);
      if (existingIndex === -1) {
        existingIndex = fileContent.indexOf(keyPatternSingle);
      }

      const cleanHtml = html.trim();
      const newEntry = `  "${name}": \`\n${cleanHtml}\n\`,\n`;

      if (existingIndex !== -1) {
        const searchString = fileContent.substring(existingIndex);
        const match = searchString.match(/`\s*,\s*\n\s*(?:"|'|};)/);

        if (match && match.index !== undefined) {
          const endIndex = existingIndex + match.index;
          const closingSequence = fileContent.substring(endIndex).match(/`\s*,/);

          if (closingSequence && closingSequence[0]) {
            const targetLength = endIndex - existingIndex + closingSequence[0].length + 1;
            const targetSegment = fileContent.substring(existingIndex, existingIndex + targetLength);
            fileContent = fileContent.replace(targetSegment, newEntry);
          } else {
            const closingBracketIndex = fileContent.lastIndexOf("};");
            if (closingBracketIndex !== -1) {
              const before = fileContent.substring(0, closingBracketIndex);
              const after = fileContent.substring(closingBracketIndex);
              fileContent = before + newEntry + after;
            }
          }
        } else {
          const closingBracketIndex = fileContent.lastIndexOf("};");
          if (closingBracketIndex !== -1) {
            const before = fileContent.substring(0, closingBracketIndex);
            const after = fileContent.substring(closingBracketIndex);
            fileContent = before + newEntry + after;
          }
        }
      } else {
        const closingBracketIndex = fileContent.lastIndexOf("};");
        if (closingBracketIndex !== -1) {
          const before = fileContent.substring(0, closingBracketIndex);
          const after = fileContent.substring(closingBracketIndex);

          let formattedBefore = before.trimEnd();
          if (!formattedBefore.endsWith(",") && !formattedBefore.endsWith("{")) {
            formattedBefore += ",\n";
          } else {
            formattedBefore += "\n";
          }

          fileContent = formattedBefore + newEntry + after;
        } else {
          res.status(500).json({ error: "Could not locate ending export bracket }; in sourceCodes.ts" });
          return;
        }
      }

      fs.writeFileSync(filePath, fileContent, "utf-8");
    } finally {
      // Always release lock under finalization segment
      releaseLock(LOCK_FILE);
    }

    // ── 3. Save preview image asset ──────────────────────────────────────────
    let savedImagePath = "";
    if (imageName && imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        const frontendPublicPath = path.resolve(__dirname, "../../../frontend/public/templates");
        if (!fs.existsSync(frontendPublicPath)) {
          fs.mkdirSync(frontendPublicPath, { recursive: true });
        }
        fs.writeFileSync(path.join(frontendPublicPath, imageName), imageBuffer);
        savedImagePath = `/templates/${imageName}`;
      } catch (imgErr) {
        console.error("Failed to write preview image asset:", imgErr);
      }
    }

    // ── 4. Save template metadata to templateMetadata.json ───────────────────
    const existing = readMetadata();
    const existingIdx = existing.findIndex((t) => t.name === name);
    const templateId = existingIdx !== -1 ? existing[existingIdx].id : `pushed-${Date.now()}`;
    const categoryName = category || "Custom";
    const styleName = style || "Pushed • Custom";
    const pushedAt = new Date().toISOString();

    const templateEntry: StoredTemplate = {
      id: templateId,
      name,
      category: categoryName,
      style: styleName,
      image: savedImagePath,
      pushedAt,
    };

    let updated: StoredTemplate[];
    if (existingIdx !== -1) {
      updated = existing.map((t, i) => (i === existingIdx ? templateEntry : t));
    } else {
      updated = [...existing, templateEntry];
    }

    writeMetadata(updated);

    // ── 5. Synchronize template metadata directly with SQLite ────────────────
    db.prepare(`
      INSERT OR REPLACE INTO templates (id, name, category, style, image, pushedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      templateEntry.id,
      templateEntry.name,
      templateEntry.category,
      templateEntry.style,
      templateEntry.image,
      templateEntry.pushedAt
    );

    console.log(
      `[AUTOMATION] Successfully deployed and synced template "${name}" inside both SQLite and sourceCodes.ts.`
    );

    res.json({
      success: true,
      message: `Template "${name}" successfully pushed to backend and database!`,
      name,
      template: templateEntry,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to push template";
    console.error("Push template error:", err);
    res.status(500).json({ error: message });
  }
}
