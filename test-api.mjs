
async function runTest() {
  console.log("Testing QR Generate API...");
  try {
    const res = await fetch("http://localhost:3001/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: "https://example.com",
        template: "Liquid Rounded",
        dotStyle: "liquid",
        cornerStyle: "rounded"
      })
    });
    
    const text = await res.text();
    if (!res.ok) {
      console.error("API failed with status:", res.status);
      console.error(text);
      process.exit(1);
    }
    
    console.log("API succeeded! Response snippet:", text.substring(0, 100));
  } catch (err) {
    console.error("Fetch error:", err);
    process.exit(1);
  }
}

runTest();
