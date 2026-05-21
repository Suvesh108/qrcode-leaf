import db from "./db";
import { extractBrandName } from "./utils";

export interface QRGeneration {
  id: string;
  url: string;
  timestamp: string; // ISO string
  foregroundColor: string;
  backgroundColor: string;
  patternStyle: string;
  finderStyle: string;
  errorCorrection: string;
  scanValid: boolean;
  attempts: number;
  baseScans: number;
}

/**
 * Reads generations from SQLite and maps integer binary flags back to standard TypeScript booleans.
 */
function readGenerations(): QRGeneration[] {
  try {
    const rows = db.prepare("SELECT * FROM generations ORDER BY timestamp ASC").all() as any[];
    return rows.map(r => ({
      id: r.id,
      url: r.url,
      timestamp: r.timestamp,
      foregroundColor: r.foregroundColor,
      backgroundColor: r.backgroundColor,
      patternStyle: r.patternStyle,
      finderStyle: r.finderStyle,
      errorCorrection: r.errorCorrection,
      scanValid: r.scanValid === 1,
      attempts: r.attempts,
      baseScans: r.baseScans
    }));
  } catch (err) {
    console.error("Failed to read generations from database:", err);
    return [];
  }
}

/**
 * Persists a new QR generation record into SQLite.
 */
export function addGeneration(gen: Omit<QRGeneration, "timestamp" | "baseScans">): void {
  try {
    const timestamp = new Date().toISOString();
    const baseScans = 0; // Real campaign starts with 0 simulated clicks

    // Insert new campaign record into SQLite database
    db.prepare(`
      INSERT INTO generations (
        id, url, timestamp, foregroundColor, backgroundColor, patternStyle, finderStyle, errorCorrection, scanValid, attempts, baseScans
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      gen.id,
      gen.url,
      timestamp,
      gen.foregroundColor,
      gen.backgroundColor,
      gen.patternStyle,
      gen.finderStyle,
      gen.errorCorrection,
      gen.scanValid ? 1 : 0,
      gen.attempts,
      baseScans
    );

    console.log(`[ANALYTICS] Persisted generation for campaign: "${gen.url}" with ID: "${gen.id}" inside database.`);
  } catch (err) {
    console.error("Failed to add generation record:", err);
  }
}

/**
 * Generates structured, high-fidelity daily and dynamic real-time traffic statistics.
 * Computes all analytics using actual recorded SQLite database scan records.
 */
export function getAnalytics() {
  const generations = readGenerations();
  const allScans = db.prepare("SELECT * FROM scans").all() as { timestamp: string; generationId: string }[];
  
  let globalTotalScans = 0;
  let totalReadabilitySum = 0;
  
  const mappedCampaigns = generations.map(g => {
    const scansCount = db.prepare("SELECT COUNT(*) as count FROM scans WHERE generationId = ?").get(g.id) as { count: number };
    const uniqueCount = db.prepare("SELECT COUNT(DISTINCT ip) as count FROM scans WHERE generationId = ?").get(g.id) as { count: number };

    const totalScansForCampaign = scansCount.count;
    const uniqueVisitorsForCampaign = uniqueCount.count;

    globalTotalScans += totalScansForCampaign;
    
    // Calculate mock visual readability score based on contrast & error correction level
    const levelScores: Record<string, number> = { L: 85, M: 92, Q: 96, H: 99 };
    const base = levelScores[g.errorCorrection] || 99;
    
    const fgContrast = g.foregroundColor.toLowerCase() === "#000000" ? 0 : 3;
    const bgContrast = g.backgroundColor.toLowerCase() === "#ffffff" ? 0 : 2;
    const scanPenalty = g.scanValid ? 0 : 25;

    const readability = Math.max(45.0, Math.min(99.8, base - fgContrast - bgContrast - scanPenalty));
    totalReadabilitySum += readability;

    return {
      id: g.id,
      name: `${extractBrandName(g.url)} Campaign`,
      url: g.url,
      status: g.scanValid ? 'active' : 'paused',
      createdAt: new Date(g.timestamp).toISOString().split("T")[0],
      scans: totalScansForCampaign,
      readability: parseFloat(readability.toFixed(1)),
      qrConfig: {
        foregroundColor: g.foregroundColor,
        backgroundColor: g.backgroundColor,
        patternStyle: g.patternStyle,
        finderStyle: g.finderStyle,
        errorCorrection: g.errorCorrection
      }
    };
  }).reverse(); // Latest campaigns first!
  
  const avgReadability = generations.length > 0 
    ? (totalReadabilitySum / generations.length)
    : 98.4;
    
  // Dynamic unique visitors by counting distinct IPs across database
  const globalUniqueIPs = db.prepare("SELECT COUNT(DISTINCT ip) as count FROM scans").get() as { count: number };
  const uniqueVisitors = globalUniqueIPs.count;
  
  // Construct daily traffic profiles for the past 7 days based on real scan dates
  const dailyTraffic: { day: string; scans: number }[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayName = daysOfWeek[d.getDay()];
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    let dayScans = 0;

    // Add real database scans that occurred on this calendar day
    allScans.forEach(s => {
      const scanDate = new Date(s.timestamp);
      const syyyy = scanDate.getFullYear();
      const smm = String(scanDate.getMonth() + 1).padStart(2, '0');
      const sdd = String(scanDate.getDate()).padStart(2, '0');
      const sDateStr = `${syyyy}-${smm}-${sdd}`;

      if (sDateStr === dateStr) {
        dayScans += 1;
      }
    });
    
    dailyTraffic.push({
      day: dayName,
      scans: Math.max(0, dayScans)
    });
  }
  
  return {
    totalScans: globalTotalScans,
    uniqueVisitors,
    avgReadability: parseFloat(avgReadability.toFixed(1)),
    activeCampaigns: new Set(generations.map(g => g.url)).size,
    dailyTraffic,
    campaigns: mappedCampaigns
  };
}
