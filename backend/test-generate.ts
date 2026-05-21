import fs from 'fs';

async function main() {
  const res = await fetch("http://localhost:3001/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://google.com",
      patternStyle: "rounded",
      finderStyle: "rounded",
      fillMode: "auto",
      gradient: false
    })
  });
  const data = await res.json();
  const artifactPath = "C:/Users/Suvesh/.gemini/antigravity-ide/brain/7cbec329-bf0f-4a92-86ab-1ce2bb41ee6e/scratch/google-qr.svg";
  
  if (!fs.existsSync("C:/Users/Suvesh/.gemini/antigravity-ide/brain/7cbec329-bf0f-4a92-86ab-1ce2bb41ee6e/scratch")) {
    fs.mkdirSync("C:/Users/Suvesh/.gemini/antigravity-ide/brain/7cbec329-bf0f-4a92-86ab-1ce2bb41ee6e/scratch", { recursive: true });
  }
  
  fs.writeFileSync(artifactPath, data.svg);
  console.log("Saved to " + artifactPath);
}

main();
