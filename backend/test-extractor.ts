import { fetchLogo } from "./src/logo/fetcher";
import fs from "fs";

async function main() {
  const result = await fetchLogo("https://google.com");
  fs.writeFileSync("google-logo.png", result.buffer);
  console.log("Saved google-logo.png");
}
main();
