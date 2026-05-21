/**
 * This file preserves the original HTML/Canvas source code snippets for each custom template.
 * These are used as a reference for the backend rendering logic in generator.ts.
 */

export const TEMPLATE_SOURCE_CODES: Record<string, string> = {
  "Liquid Rounded": `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Custom Styled QR</title>

<!-- QR Styling Library -->
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling/lib/qr-code-styling.js"></script>

<style>
    body{
        margin:0;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#f2f2f2;
        font-family:Arial;
    }

    #qr{
        padding:20px;
        background:white;
        border-radius:18px;
        box-shadow:0 5px 20px rgba(0,0,0,0.1);
    }
</style>
</head>
<body>

<div id="qr"></div>

<script>
const qrCode = new QRCodeStyling({
    width: 520,
    height: 520,
    type: "canvas",

    data: "brandcrowd.com",

    margin: 10,

    qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H"
    },

    dotsOptions: {
        type: "rounded",
        color: "#000000"
    },

    backgroundOptions: {
        color: "#ffffff"
    },

    cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000000"
    },

    cornersDotOptions: {
        type: "dot",
        color: "#000000"
    }
});

qrCode.append(document.getElementById("qr"));
</script>

</body>
</html>
`,
  "Constellation": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Constellation Circuit QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f3f4f6;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.06);
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        canvas {
            display: block;
            margin-top: 20px;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Constellation QR Code</h2>
    <canvas id="constellationCanvas" width="450" height="450"></canvas>
</div>

<script>
    function generateConstellationQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Generate base QR data using Error Correction Level 'H' (High) 
        // to tolerate customized visual nodes safely
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.strokeStyle = '#000000'; // Color for the connecting circuit lines
        ctx.fillStyle = '#000000';   // Color for the nodes and finder patterns
        ctx.lineCap = 'round';

        // Core helper functions
        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= count - 7) return true; // Top-Right
            if (r >= count - 7 && c < 7) return true; // Bottom-Left
            return false;
        }

        // STEP 1: DRAW THE $45^{\circ}$ DIAGONAL CONNECTING LINES FIRST
        // (So they seamlessly run underneath the node dots)
        ctx.lineWidth = cellSize * 0.18; // Elegant, crisp line thickness
        
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const startX = (c + 0.5) * cellSize;
                const startY = (r + 0.5) * cellSize;

                // Check diagonal neighbors: bottom-right and bottom-left
                // (Checking forward prevents drawing duplicate overlapping lines)
                const diagBottomRight = isDark(r + 1, c + 1) && !isFinderPattern(r + 1, c + 1);
                const diagBottomLeft  = isDark(r + 1, c - 1) && !isFinderPattern(r + 1, c - 1);

                if (diagBottomRight) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX + cellSize, startY + cellSize);
                    ctx.stroke();
                }
                if (diagBottomLeft) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX - cellSize, startY + cellSize);
                    ctx.stroke();
                }
            }
        }

        // STEP 2: DRAW THE NODES (Variable-sized dots)
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const centerX = (c + 0.5) * cellSize;
                const centerY = (r + 0.5) * cellSize;

                // To replicate the template's organic feel, standalone dots are slightly smaller, 
                // while dots connected to networks are drawn slightly larger.
                const hasAnyNeighbor = isDark(r-1, c-1) || isDark(r-1, c+1) || isDark(r+1, c-1) || isDark(r+1, c+1);
                const radius = hasAnyNeighbor ? (cellSize * 0.38) : (cellSize * 0.28);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // STEP 3: DRAW THE SHARP, GRID-ALIGNED FINDER PATTERNS
        const finders = [
            { x: 0, y: 0 },
            { x: (count - 7) * cellSize, y: 0 },
            { x: 0, y: (count - 7) * cellSize }
        ];

        finders.forEach(pos => {
            // Draw Outer Box Frame
            ctx.fillStyle = '#000000';
            ctx.fillRect(pos.x, pos.y, 7 * cellSize, 7 * cellSize);
            
            // Draw White Inner Cutout
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pos.x + cellSize, pos.y + cellSize, 5 * cellSize, 5 * cellSize);
            
            // Draw Center Solid Core Block
            ctx.fillStyle = '#000000';
            ctx.fillRect(pos.x + (2 * cellSize), pos.y + (2 * cellSize), 3 * cellSize, 3 * cellSize);
        });
    }

    // Initialize with your URL payload
    generateConstellationQR("https://yourwebsite.com", "constellationCanvas");
</script>

</body>
</html>
`,
  "Bullseye Dot": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bullseye Dot QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        canvas {
            display: block;
            margin-top: 20px;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Bullseye Dot QR Code</h2>
    <canvas id="bullseyeCanvas" width="450" height="450"></canvas>
</div>

<script>
    function generateBullseyeQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Generate base QR data using Error Correction Level 'H'
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; // Target QR Code color

        // Core helper functions
        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= count - 7) return true; // Top-Right
            if (r >= count - 7 && c < 7) return true; // Bottom-Left
            return false;
        }

        // STEP 1: DRAW THE DATA MODULES AS DISCRETE DOTS
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const centerX = (c + 0.5) * cellSize;
                const centerY = (r + 0.5) * cellSize;

                // Check immediate neighbors to dynamically size dots
                const hasHorizontalNeighbor = isDark(r, c - 1) || isDark(r, c + 1);
                const hasVerticalNeighbor = isDark(r - 1, c) || isDark(r + 1, c);
                
                let radius;
                if (hasHorizontalNeighbor && hasVerticalNeighbor) {
                    radius = cellSize * 0.42; // Larger dot for intersections
                } else if (hasHorizontalNeighbor || hasVerticalNeighbor) {
                    radius = cellSize * 0.35; // Standard module dot size
                } else {
                    radius = cellSize * 0.25; // Smaller dot for standalone nodes
                }

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // STEP 2: DRAW THE CIRCULAR BULLSEYE FINDER PATTERNS
        const finders = [
            { cx: 3.5 * cellSize, cy: 3.5 * cellSize },                         // Top-Left
            { cx: (count - 3.5) * cellSize, cy: 3.5 * cellSize },               // Top-Right
            { cx: 3.5 * cellSize, cy: (count - 3.5) * cellSize }                // Bottom-Left
        ];

        finders.forEach(center => {
            // 1. Outer Dark Ring
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 3.5 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 2. Middle White Space Ring
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 2.3 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 3. Center Dark Solid Core
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 1.3 * cellSize, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Initialize with your payload link
    generateBullseyeQR("https://yourwebsite.com", "bullseyeCanvas");
</script>

</body>
</html>
`,
  "Orbital": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbital Planetary QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        canvas {
            display: block;
            margin-top: 20px;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Orbital QR Code</h2>
    <canvas id="orbitalCanvas" width="450" height="450"></canvas>
</div>

<script>
    function generateOrbitalQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Generate base QR data with High error correction (H)
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; 
        ctx.strokeStyle = '#000000';

        // Helper functions
        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= count - 7) return true; // Top-Right
            if (r >= count - 7 && c < 7) return true; // Bottom-Left
            return false;
        }

        // STEP 1: DRAW THE DATA MODULE DOTS WITH DYNAMIC SIZES
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const centerX = (c + 0.5) * cellSize;
                const centerY = (r + 0.5) * cellSize;

                const hasHorizontalNeighbor = isDark(r, c - 1) || isDark(r, c + 1);
                const hasVerticalNeighbor = isDark(r - 1, c) || isDark(r + 1, c);
                
                let radius;
                if (hasHorizontalNeighbor && hasVerticalNeighbor) {
                    radius = cellSize * 0.44; // Dense cluster node
                } else if (hasHorizontalNeighbor || hasVerticalNeighbor) {
                    radius = cellSize * 0.36; // Inline node
                } else {
                    radius = cellSize * 0.24; // Isolated single node
                }

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // STEP 2: DRAW THE CUSTOM ORBITAL FINDER PATTERNS
        const finders = [
            { cx: 3.5 * cellSize, cy: 3.5 * cellSize },                         // Top-Left
            { cx: (count - 3.5) * cellSize, cy: 3.5 * cellSize },               // Top-Right
            { cx: 3.5 * cellSize, cy: (count - 3.5) * cellSize }                // Bottom-Left
        ];

        finders.forEach(center => {
            // 1. Draw Large Central Solid Core Planet
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 1.6 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 2. Draw Dashed Fine Orbit Line
            ctx.save();
            ctx.lineWidth = cellSize * 0.15;
            ctx.setLineDash([cellSize * 0.4, cellSize * 0.3]); // Creates perfectly spaced dashes
            ctx.beginPath();
            const orbitRadius = 3.1 * cellSize;
            ctx.arc(center.cx, center.cy, orbitRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            // 3. Draw 4 Solid Satellite Nodes along the orbit (0, 90, 180, 270 degrees)
            const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
            angles.forEach((angle, idx) => {
                const satX = center.cx + Math.cos(angle) * orbitRadius;
                const satY = center.cy + Math.sin(angle) * orbitRadius;
                
                // Mirroring the template: top/bottom satellites are slightly larger than side ones
                const satRadius = (idx % 2 === 0) ? (cellSize * 0.38) : (cellSize * 0.5);

                ctx.beginPath();
                ctx.arc(satX, satY, satRadius, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }

    // Initialize with your website link
    generateOrbitalQR("https://yourwebsite.com", "orbitalCanvas");
</script>

</body>
</html>
`,
  "Micro Target": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimalist Target Micro-Dot QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        canvas {
            display: block;
            margin-top: 20px;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Minimalist Target QR Code</h2>
    <canvas id="minimalTargetCanvas" width="450" height="450"></canvas>
</div>

<script>
    function generateMinimalTargetQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Generate base QR data using Error Correction Level 'H'
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; // QR code primary color

        // Core helper functions
        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= count - 7) return true; // Top-Right
            if (r >= count - 7 && c < 7) return true; // Bottom-Left
            return false;
        }

        // STEP 1: DRAW UNIFORM MICRO-DOT DATA MODULES
        // Fixed radius gives the clean, airy, structured look of this layout
        const dotRadius = cellSize * 0.26; 

        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const centerX = (c + 0.5) * cellSize;
                const centerY = (r + 0.5) * cellSize;

                ctx.beginPath();
                ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // STEP 2: DRAW THE CIRCULAR TARGET / BULLSEYE FINDER PATTERNS
        const finders = [
            { cx: 3.5 * cellSize, cy: 3.5 * cellSize },                         // Top-Left
            { cx: (count - 3.5) * cellSize, cy: 3.5 * cellSize },               // Top-Right
            { cx: 3.5 * cellSize, cy: (count - 3.5) * cellSize }                // Bottom-Left
        ];

        finders.forEach(center => {
            // 1. Heavy Outer Dark Circle Ring
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 3.5 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 2. Middle White Space Ring Isolator
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 2.2 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 3. Center Solid Bullseye Core
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 1.2 * cellSize, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Initialize with your website or payload link
    generateMinimalTargetQR("https://yourwebsite.com", "minimalTargetCanvas");
</script>

</body>
</html>
`,
  "Fluid Logo": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fluid QR Code Generator</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .canvas-container {
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            padding: 30px;
            background: white;
            border-radius: 20px;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>

<div class="canvas-container">
    <canvas id="qrCanvas" width="600" height="600"></canvas>
</div>

<script>
    // Exact structural matrix representation of the provided QR code image
    // 1 = Black module, 0 = White space
    const qrMatrix = [
        [1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,1,1,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,0,1,1,0,0,0,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,1,0,0,1,0,0,1,0,0,0,0,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,1,1,0,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        [1,0,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1],
        [0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,0,0,1,0],
        [0,0,0,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,1],
        [1,1,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,0],
        [0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,1,0],
        [1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,0],
        [1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,1],
        [0,1,0,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
        [0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0],
        [0,1,0,0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0],
        [0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,0,0,1,1],
        [1,1,1,1,1,1,1,0,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,1,0,1,1,1,1,0,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0],
        [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0],
        [1,0,1,1,1,0,1,0,0,1,1,0,0,1,0,0,0,1,0,0,0,0,1,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,1,0,0,0,0,0,0],
        [1,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,1,1,0,1,1,0,1,1,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,1,1,0,0,1,1,0,0,0,0,0,0,1,0,0,1,1]
    ];

    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    
    const matrixSize = qrMatrix.length;
    const cellSize = canvas.width / matrixSize;
    const borderRadius = cellSize * 0.45; // Controls the fluidity/roundness

    // Helper helper function to safely check neighbor values
    function isBlack(r, c) {
        if (r < 0 || r >= matrixSize || c < 0 || c >= matrixSize) return false;
        return qrMatrix[r][c] === 1;
    }

    // Identifies if a cell is part of the 3 large corner finder patterns
    function isFinderPattern(r, c) {
        if (r < 7 && c < 7) return true; // Top-Left
        if (r < 7 && c >= matrixSize - 7) return true; // Top-Right
        if (r >= matrixSize - 7 && c < 7) return true; // Bottom-Left
        return false;
    }

    function drawQRCode() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw the 3 Primary Position Finder Patterns with customized smooth rounded tracks
        drawFinder(0, 0); // Top Left
        drawFinder(matrixSize - 7, 0); // Bottom Left
        drawFinder(0, matrixSize - 7); // Top Right

        // 2. Process and draw the fluid body data matrix
        for (let r = 0; r < matrixSize; r++) {
            for (let c = 0; c < matrixSize; c++) {
                
                // Skip finder patterns to let our specialized function handle them smoothly
                if (isFinderPattern(r, c)) continue;

                if (qrMatrix[r][c] === 1) {
                    ctx.fillStyle = '#000000';
                    
                    let x = c * cellSize;
                    let y = r * cellSize;

                    // Evaluate neighbors to compute fluid connected shapes
                    let top = isBlack(r - 1, c) && !isFinderPattern(r - 1, c);
                    let bottom = isBlack(r + 1, c) && !isFinderPattern(r + 1, c);
                    let left = isBlack(r, c - 1) && !isFinderPattern(r, c - 1);
                    let right = isBlack(r, c + 1) && !isFinderPattern(r, c + 1);

                    ctx.beginPath();
                    ctx.moveTo(x + borderRadius, y);

                    // Top-Right corner connection logic
                    if (right || top) { ctx.lineTo(x + cellSize, y); } 
                    else { ctx.arcTo(x + cellSize, y, x + cellSize, y + cellSize, borderRadius); }

                    // Bottom-Right corner connection logic
                    if (right || bottom) { ctx.lineTo(x + cellSize, y + cellSize); } 
                    else { ctx.arcTo(x + cellSize, y + cellSize, x, y + cellSize, borderRadius); }

                    // Bottom-Left corner connection logic
                    if (left || bottom) { ctx.lineTo(x, y + cellSize); } 
                    else { ctx.arcTo(x, y + cellSize, x, y, borderRadius); }

                    // Top-Left corner connection logic
                    if (left || top) { ctx.lineTo(x, y); } 
                    else { ctx.arcTo(x, y, x + cellSize, y, borderRadius); }

                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Fill in inversed fluid corners for negative space matching
                    drawInverseCorners(r, c);
                }
            }
        }
    }

    // Renders custom outer frame and inner square for position tracking modules
    function drawFinder(row, col) {
        ctx.fillStyle = '#000000';
        let x = col * cellSize;
        let y = row * cellSize;
        let size = 7 * cellSize;

        // Outer rounded box
        ctx.beginPath();
        roundRect(ctx, x, y, size, size, cellSize * 1.8);
        ctx.fill();

        // White inner cutout mask
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        roundRect(ctx, x + cellSize, y + cellSize, size - 2 * cellSize, size - 2 * cellSize, cellSize * 1.0);
        ctx.fill();

        // Center solid black core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        roundRect(ctx, x + 2 * cellSize, y + 2 * cellSize, size - 4 * cellSize, size - 4 * cellSize, cellSize * 0.5);
        ctx.fill();
    }

    // Generates fluid inner-gaps when multiple liquid-like points intersect
    function drawInverseCorners(r, c) {
        let x = c * cellSize;
        let y = r * cellSize;
        ctx.fillStyle = '#000000';

        // Top-Left Inverse Corner
        if (isBlack(r-1, c) && isBlack(r, c-1) && isBlack(r-1, c-1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c-1)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + borderRadius, y);
            ctx.arcTo(x, y, x, y + borderRadius, borderRadius);
            ctx.closePath();
            ctx.fill();
        }
        // Top-Right Inverse Corner
        if (isBlack(r-1, c) && isBlack(r, c+1) && isBlack(r-1, c+1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c+1)) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize - borderRadius, y);
            ctx.arcTo(x + cellSize, y, x + cellSize, y + borderRadius, borderRadius);
            ctx.closePath();
            ctx.fill();
        }
        // Bottom-Right Inverse Corner
        if (isBlack(r+1, c) && isBlack(r, c+1) && isBlack(r+1, c+1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c+1)) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x + cellSize - borderRadius, y + cellSize);
            ctx.arcTo(x + cellSize, y + cellSize, x + cellSize, y + cellSize - borderRadius, borderRadius);
            ctx.closePath();
            ctx.fill();
        }
        // Bottom-Left Inverse Corner
        if (isBlack(r+1, c) && isBlack(r, c-1) && isBlack(r+1, c-1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c-1)) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x + borderRadius, y + cellSize);
            ctx.arcTo(x, y + cellSize, x, y + cellSize - borderRadius, borderRadius);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Helper path generator for clean rounded rectangles
    function roundRect(context, x, y, width, height, radius) {
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height - radius);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
    }

    // Execute drawing sequence
    drawQRCode();
</script>

</body>
</html>
`,
  "Octagonal Fluid": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Octagonal Liquid QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .qr-wrapper {
            position: relative;
            display: inline-block;
            margin-top: 20px;
        }
        canvas {
            display: block;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Octagonal Liquid QR Code</h2>
    
    <div class="qr-wrapper">
        <canvas id="octoLiquidCanvas" width="450" height="450"></canvas>
    </div>
</div>

<script>
    function generateOctoLiquidQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;
        const borderRadius = cellSize * 0.45; // Smooth blend factor

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; 

        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; 
            if (r < 7 && c >= count - 7) return true; 
            if (r >= count - 7 && c < 7) return true; 
            return false;
        }

        function drawOctagon(ctx, x, y, size, inset) {
            ctx.beginPath();
            ctx.moveTo(x + inset, y);
            ctx.lineTo(x + size - inset, y);
            ctx.lineTo(x + size, y + inset);
            ctx.lineTo(x + size, y + size - inset);
            ctx.lineTo(x + size - inset, y + size);
            ctx.lineTo(x + inset, y + size);
            ctx.lineTo(x, y + size - inset);
            ctx.lineTo(x, y + inset);
            ctx.closePath();
        }

        // Logic to draw inverse rounded curves in negative gaps for a liquid effect
        function drawInverseFluidCorners(r, c, x, y) {
            ctx.fillStyle = '#000000';

            // Top-Left Inward Blend
            if (isDark(r-1, c) && isDark(r, c-1) && isDark(r-1, c-1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c-1)) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + borderRadius, y);
                ctx.arcTo(x, y, x, y + borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Top-Right Inward Blend
            if (isDark(r-1, c) && isDark(r, c+1) && isDark(r-1, c+1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c+1)) {
                ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize - borderRadius, y);
                ctx.arcTo(x + cellSize, y, x + cellSize, y + borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Bottom-Right Inward Blend
            if (isDark(r+1, c) && isDark(r, c+1) && isDark(r+1, c+1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c+1)) {
                ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x + cellSize - borderRadius, y + cellSize);
                ctx.arcTo(x + cellSize, y + cellSize, x + cellSize, y + cellSize - borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Bottom-Left Inward Blend
            if (isDark(r+1, c) && isDark(r, c-1) && isDark(r+1, c-1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c-1)) {
                ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + borderRadius, y + cellSize);
                ctx.arcTo(x, y + cellSize, x, y + cellSize - borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
        }

        // STEP 1: DRAW HIGHLY FLUID LIQUID BLOB DATA MODULES
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c)) continue;

                const x = c * cellSize;
                const y = r * cellSize;

                if (isDark(r, c)) {
                    ctx.fillStyle = '#000000';

                    const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                    const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);
                    const left = isDark(r, c - 1) && !isFinderPattern(r, c - 1);
                    const right = isDark(r, c + 1) && !isFinderPattern(r, c + 1);

                    ctx.beginPath();
                    ctx.moveTo(x + borderRadius, y);

                    // Fluid border rounding with neighborhood awareness
                    if (right || top) { ctx.lineTo(x + cellSize, y); } 
                    else { ctx.arcTo(x + cellSize, y, x + cellSize, y + cellSize, borderRadius); }

                    if (right || bottom) { ctx.lineTo(x + cellSize, y + cellSize); } 
                    else { ctx.arcTo(x + cellSize, y + cellSize, x, y + cellSize, borderRadius); }

                    if (left || bottom) { ctx.lineTo(x, y + cellSize); } 
                    else { ctx.arcTo(x, y + cellSize, x, y, borderRadius); }

                    if (left || top) { ctx.lineTo(x, y); } 
                    else { ctx.arcTo(x, y, x + cellSize, y, borderRadius); }

                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Smooths out inside intersections for empty cells surrounded by active ones
                    drawInverseFluidCorners(r, c, x, y);
                }
            }
        }

        // STEP 2: DRAW THE GEOMETRIC OCTAGON CORNER FINDERS
        const finders = [
            { x: 0, y: 0 },
            { x: (count - 7) * cellSize, y: 0 },
            { x: 0, y: (count - 7) * cellSize }
        ];

        finders.forEach(pos => {
            const size = 7 * cellSize;
            const outerInset = 2 * cellSize; 
            const innerInset = 1.3 * cellSize;

            // 1. Solid Outer Black Octagon Shield
            ctx.fillStyle = '#000000';
            drawOctagon(ctx, pos.x, pos.y, size, outerInset);
            ctx.fill();

            // 2. White Octagon Isolation Layer
            ctx.fillStyle = '#ffffff';
            drawOctagon(ctx, pos.x + cellSize, pos.y + cellSize, size - (2 * cellSize), innerInset);
            ctx.fill();

            // 3. Central Solid Core
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(pos.x + (2 * cellSize), pos.y + (2 * cellSize), 3 * cellSize, 3 * cellSize, 0.8 * cellSize);
            ctx.fill();
        });
    }

    generateOctoLiquidQR("https://yourwebsite.com", "octoLiquidCanvas");
</script>

</body>
</html>
`,
  "Orbital Diamond": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbital Diamond Liquid QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .qr-wrapper {
            position: relative;
            display: inline-block;
            margin-top: 20px;
        }
        canvas {
            display: block;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <h2>Orbital Diamond QR Code</h2>
    
    <div class="qr-wrapper">
        <canvas id="orbitalDiamondCanvas" width="450" height="450"></canvas>
    </div>
</div>

<script>
    function generateOrbitalDiamondQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;
        const borderRadius = cellSize * 0.45; // Fluid connection radius

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; 

        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; 
            if (r < 7 && c >= count - 7) return true; 
            if (r >= count - 7 && c < 7) return true; 
            return false;
        }

        // Draws smooth concave corners between fluid dots to mimic liquid flow
        function drawInverseFluidCorners(r, c, x, y) {
            ctx.fillStyle = '#000000';

            // Top-Left corner pocket
            if (isDark(r-1, c) && isDark(r, c-1) && isDark(r-1, c-1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c-1)) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + borderRadius, y);
                ctx.arcTo(x, y, x, y + borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Top-Right corner pocket
            if (isDark(r-1, c) && isDark(r, c+1) && isDark(r-1, c+1) && !isFinderPattern(r-1, c) && !isFinderPattern(r, c+1)) {
                ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize - borderRadius, y);
                ctx.arcTo(x + cellSize, y, x + cellSize, y + borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Bottom-Right corner pocket
            if (isDark(r+1, c) && isDark(r, c+1) && isDark(r+1, c+1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c+1)) {
                ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x + cellSize - borderRadius, y + cellSize);
                ctx.arcTo(x + cellSize, y + cellSize, x + cellSize, y + cellSize - borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
            // Bottom-Left corner pocket
            if (isDark(r+1, c) && isDark(r, c-1) && isDark(r+1, c-1) && !isFinderPattern(r+1, c) && !isFinderPattern(r, c-1)) {
                ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + borderRadius, y + cellSize);
                ctx.arcTo(x, y + cellSize, x, y + cellSize - borderRadius, borderRadius); ctx.closePath(); ctx.fill();
            }
        }

        // STEP 1: DRAW HIGHLY FLUID LIQUID BLOB DATA MODULES
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c)) continue;

                const x = c * cellSize;
                const y = r * cellSize;

                if (isDark(r, c)) {
                    ctx.fillStyle = '#000000';

                    const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                    const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);
                    const left = isDark(r, c - 1) && !isFinderPattern(r, c - 1);
                    const right = isDark(r, c + 1) && !isFinderPattern(r, c + 1);

                    ctx.beginPath();
                    ctx.moveTo(x + borderRadius, y);

                    // Contextual edge blending calculations
                    if (right || top) { ctx.lineTo(x + cellSize, y); } 
                    else { ctx.arcTo(x + cellSize, y, x + cellSize, y + cellSize, borderRadius); }

                    if (right || bottom) { ctx.lineTo(x + cellSize, y + cellSize); } 
                    else { ctx.arcTo(x + cellSize, y + cellSize, x, y + cellSize, borderRadius); }

                    if (left || bottom) { ctx.lineTo(x, y + cellSize); } 
                    else { ctx.arcTo(x, y + cellSize, x, y, borderRadius); }

                    if (left || top) { ctx.lineTo(x, y); } 
                    else { ctx.arcTo(x, y, x + cellSize, y, borderRadius); }

                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Inject liquid properties inside empty intersections
                    drawInverseFluidCorners(r, c, x, y);
                }
            }
        }

        // STEP 2: DRAW THE CIRCULAR BULLSEYE FINDERS WITH THE INNER DIAMOND CORE
        const finders = [
            { cx: 3.5 * cellSize, cy: 3.5 * cellSize },                         // Top-Left
            { cx: (count - 3.5) * cellSize, cy: 3.5 * cellSize },               // Top-Right
            { cx: 3.5 * cellSize, cy: (count - 3.5) * cellSize }                // Bottom-Left
        ];

        finders.forEach(center => {
            // 1. Draw Outer Circle Shield Ring
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 3.5 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 2. Inner White Space Isolator Ring
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(center.cx, center.cy, 2.3 * cellSize, 0, 2 * Math.PI);
            ctx.fill();

            // 3. Central Rotated Square (Diamond) Core
            ctx.fillStyle = '#000000';
            ctx.save();
            ctx.translate(center.cx, center.cy);
            ctx.rotate(Math.PI / 4); 
            const diamondSize = 2.4 * cellSize;
            ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
            ctx.restore();
        });
    }

    generateOrbitalDiamondQR("https://yourwebsite.com", "orbitalDiamondCanvas");
</script>

</body>
</html>
`,
  "Flame Wave": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfect Liquid Flame QR</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
    <style>
        body {
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #ffffff; /* Clean white background */
        }

        canvas {
            display: block;
            width: 100%;
            max-width: 400px;
            height: auto;
        }
    </style>
</head>
<body>

    <canvas id="liquidCanvas" width="1024" height="1024"></canvas>

<script>
    const canvas = document.getElementById('liquidCanvas');
    const ctx = canvas.getContext('2d');

    // Helper: Safely checks if a module is dark, while explicitly ignoring the 3 large finder areas
    function isDark(r, c, count, qr) {
        if (r < 0 || r >= count || c < 0 || c >= count) return false;
        
        // Exclude the 7x7 standard finder patterns from neighbor calculations
        if (r < 7 && c < 7) return false; // Top Left
        if (r < 7 && c >= count - 7) return false; // Top Right
        if (r >= count - 7 && c < 7) return false; // Bottom Left
        
        return qr.isDark(r, c);
    }

    function generate() {
        // SET YOUR QR TEXT OR URL HERE
        const text = "https://google.com";
        
        // Use high error correction to create denser, more fluid path networks
        const qr = qrcode(0, 'H');
        qr.addData(text);
        qr.make();

        const count = qr.getModuleCount();
        
        // Calculate dimensions and padding
        const padding = 80; // White space border
        const drawSize = canvas.width - (padding * 2);
        const cellSize = drawSize / count;
        const R = cellSize / 2;

        // Clear canvas with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Strict Black color for the QR code
        ctx.fillStyle = '#000000';

        // 1. Draw Organic Data Modules using the "Pinwheel Flame" rule
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (!isDark(r, c, count, qr)) continue;

                // Identify adjacent dark modules
                const n = isDark(r - 1, c, count, qr); // North (Top)
                const s = isDark(r + 1, c, count, qr); // South (Bottom)
                const w = isDark(r, c - 1, count, qr); // West (Left)
                const e = isDark(r, c + 1, count, qr); // East (Right)

                const neighbors = (n ? 1 : 0) + (s ? 1 : 0) + (w ? 1 : 0) + (e ? 1 : 0);
                
                // Track corner radii [TopLeft, TopRight, BottomRight, BottomLeft]
                let rTL = 0, rTR = 0, rBR = 0, rBL = 0;

                // THE EXACT REVERSE-ENGINEERED FLAME RULE:
                if (neighbors === 0) {
                    // Isolated blocks are perfectly circular droplets
                    rTL = R; rTR = R; rBR = R; rBL = R;
                } else if (neighbors === 1) {
                    // Endpoints taper to a specific sharp corner to create the "flame/swirl" look
                    if (w) rBR = R;      // Facing Right -> Bottom-Right is round, Top-Right stays sharp
                    else if (n) rBL = R; // Facing Down -> Bottom-Left is round, Bottom-Right stays sharp
                    else if (e) rTL = R; // Facing Left -> Top-Left is round, Bottom-Left stays sharp
                    else if (s) rTR = R; // Facing Up -> Top-Right is round, Top-Left stays sharp
                } else if (neighbors === 2) {
                    // Outer corners of 90-degree turns are rounded, inner corners are sharp
                    if (e && s) rTL = R;
                    else if (w && s) rTR = R;
                    else if (w && n) rBR = R;
                    else if (e && n) rBL = R;
                }
                // 3 or 4 neighbors automatically keep 0 (sharp) to create solid dense blocks

                const x = padding + c * cellSize;
                const y = padding + r * cellSize;

                // Draw the module. We add a tiny 0.2px overlap to perfectly fuse 
                // adjacent shapes without rendering hairline cracks between them.
                ctx.beginPath();
                ctx.roundRect(x - 0.1, y - 0.1, cellSize + 0.2, cellSize + 0.2, [rTL, rTR, rBR, rBL]);
                ctx.fill();
            }
        }

        // 2. Draw Geometric Circular Finders
        // Standard finders are located at 3.5 cell centers
        const finders = [
            { x: 3.5, y: 3.5 },
            { x: count - 3.5, y: 3.5 },
            { x: 3.5, y: count - 3.5 }
        ];

        finders.forEach(f => {
            const cx = padding + f.x * cellSize;
            const cy = padding + f.y * cellSize;

            // Heavy Outer Ring
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5 * cellSize, 0, Math.PI * 2);
            ctx.fill();

            // Inner White Separator Ring
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 2.5 * cellSize, 0, Math.PI * 2);
            ctx.fill();

            // Heavy Inner Target Dot
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(cx, cy, 1.5 * cellSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Initialize layout on load
    window.onload = generate;
</script>

</body>
</html>
`,
  "Leaf Finder": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaf Finder Liquid QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .qr-wrapper {
            position: relative;
            display: inline-block;
        }
        canvas {
            display: block;
            background: #ffffff;
            width: 450px;
            height: 450px;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <div class="qr-wrapper">
        <canvas id="leafFinderCanvas"></canvas>
    </div>
</div>

<script>
    function generateLeafQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // High-DPI / Retina Sharpness Setup
        const displaySize = 450; 
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = displaySize * dpr;
        canvas.height = displaySize * dpr;
        ctx.scale(dpr, dpr);
        
        // Generate QR Matrix
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const cellSize = displaySize / count;

        ctx.clearRect(0, 0, displaySize, displaySize);
        ctx.fillStyle = '#000000'; 

        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; 
            if (r < 7 && c >= count - 7) return true; 
            if (r >= count - 7 && c < 7) return true; 
            return false;
        }

        // STEP 1: DRAW THE CONNECTING LIQUID DATA MODULES
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c)) continue;

                const x = c * cellSize;
                const y = r * cellSize;
                const radius = cellSize * 0.4; 

                if (isDark(r, c)) {
                    const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                    const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);
                    const left = isDark(r, c - 1) && !isFinderPattern(r, c - 1);
                    const right = isDark(r, c + 1) && !isFinderPattern(r, c + 1);

                    ctx.beginPath();
                    
                    if ((left || right) && (top || bottom)) {
                        ctx.fillRect(x, y, cellSize, cellSize);
                    } else if (left || right) {
                        ctx.roundRect(x, y, cellSize, cellSize, [left ? 0 : radius, right ? 0 : radius, right ? 0 : radius, left ? 0 : radius]);
                        ctx.fill();
                    } else if (top || bottom) {
                        ctx.roundRect(x, y, cellSize, cellSize, [top ? 0 : radius, top ? 0 : radius, bottom ? 0 : radius, bottom ? 0 : radius]);
                        ctx.fill();
                    } else {
                        ctx.roundRect(x, y, cellSize, cellSize, radius);
                        ctx.fill();
                    }
                }
            }
        }

        // STEP 2: DRAW THE CUSTOM LEAF FINDER PATTERNS
        const finders = [
            { x: 0, y: 0, radiiOuter: [4.5 * cellSize, 0, 4.5 * cellSize, 4.5 * cellSize], radiiInner: [2.5 * cellSize, 0, 2.5 * cellSize, 2.5 * cellSize], core: [1.3 * cellSize, 0, 1.3 * cellSize, 1.3 * cellSize] }, 
            { x: (count - 7) * cellSize, y: 0, radiiOuter: [0, 4.5 * cellSize, 4.5 * cellSize, 4.5 * cellSize], radiiInner: [0, 2.5 * cellSize, 2.5 * cellSize, 2.5 * cellSize], core: [0, 1.3 * cellSize, 1.3 * cellSize, 1.3 * cellSize] }, 
            { x: 0, y: (count - 7) * cellSize, radiiOuter: [4.5 * cellSize, 4.5 * cellSize, 4.5 * cellSize, 0], radiiInner: [2.5 * cellSize, 2.5 * cellSize, 2.5 * cellSize, 0], core: [1.3 * cellSize, 1.3 * cellSize, 1.3 * cellSize, 0] }  
        ];

        finders.forEach(pos => {
            const size = 7 * cellSize;

            // Outer Leaf Frame Shape
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, size, size, pos.radiiOuter);
            ctx.fill();

            // Isolation Mask
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(pos.x + cellSize, pos.y + cellSize, size - (2 * cellSize), size - (2 * cellSize), pos.radiiInner);
            ctx.fill();

            // Central Solid Core Leaf Drop
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(pos.x + (2 * cellSize), pos.y + (2 * cellSize), 3 * cellSize, 3 * cellSize, pos.core);
            ctx.fill();
        });
    }

    generateLeafQR("https://yourwebsite.com", "leafFinderCanvas");
</script>

</body>
</html>
`,
  "Crystal Shield": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfect Crystal QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .qr-wrapper {
            position: relative;
            display: inline-block;
        }
        canvas {
            display: block;
            background: #ffffff;
            width: 450px;
            height: 450px;
            border-radius: 12px;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <div class="qr-wrapper">
        <canvas id="crystalCanvas"></canvas>
    </div>
</div>

<script>
    // Advanced math function to draw a rectangle with individually chamfered (diagonally cut) corners
    function drawChamferedRect(ctx, x, y, w, h, chamfers) {
        const [tl, tr, br, bl] = chamfers;
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.lineTo(x + w, y + tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.lineTo(x + w - br, y + h);
        ctx.lineTo(x + bl, y + h);
        ctx.lineTo(x, y + h - bl);
        ctx.lineTo(x, y + tl);
        ctx.closePath();
        ctx.fill();
        
        // Micro-stroke prevents any sub-pixel rendering gaps between the connected geometric shapes
        ctx.lineWidth = 1.0; 
        ctx.stroke();
    }

    function generateExactCrystalQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // High-DPI / Retina Sharpness Setup
        const displaySize = 450; 
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = displaySize * dpr;
        canvas.height = displaySize * dpr;
        ctx.scale(dpr, dpr);
        
        // Generate Standard QR Matrix
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const moduleCount = qr.getModuleCount();
        
        // Add a 2-module padding (quiet zone) to frame it exactly like the reference image
        const padding = 2;
        const totalGridCount = moduleCount + (padding * 2);
        const cellSize = displaySize / totalGridCount;
        const offset = padding * cellSize;

        ctx.clearRect(0, 0, displaySize, displaySize);

        // Strict Black and White Style
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';

        // Core visibility matrix check (returns false for boundaries to ensure outer corners point)
        function isDark(r, c) {
            if (r < 0 || r >= moduleCount || c < 0 || c >= moduleCount) return false;
            return qr.isDark(r, c);
        }

        // Identify Finder Patterns so we can draw them with custom logic
        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; 
            if (r < 7 && c >= moduleCount - 7) return true; 
            if (r >= moduleCount - 7 && c < 7) return true; 
            return false;
        }

        // STEP 1: DRAW THE DATA MODULES (The True Solid Crystal Engine)
        for (let r = 0; r < moduleCount; r++) {
            for (let c = 0; c < moduleCount; c++) {
                if (isFinderPattern(r, c)) continue;

                if (isDark(r, c)) {
                    // Check direct orthogonal neighbors
                    const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                    const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);
                    const left = isDark(r, c - 1) && !isFinderPattern(r, c - 1);
                    const right = isDark(r, c + 1) && !isFinderPattern(r, c + 1);

                    const chamferSize = 0.5 * cellSize;
                    
                    // THE FIX: Only cut the corner if it is an EXPOSED OUTER EDGE.
                    // This ensures inner intersections remain perfectly solid and 90-degrees.
                    const tl = (!top && !left) ? chamferSize : 0;
                    const tr = (!top && !right) ? chamferSize : 0;
                    const br = (!bottom && !right) ? chamferSize : 0;
                    const bl = (!bottom && !left) ? chamferSize : 0;

                    const x = offset + (c * cellSize);
                    const y = offset + (r * cellSize);
                    
                    drawChamferedRect(ctx, x, y, cellSize, cellSize, [tl, tr, br, bl]);
                }
            }
        }

        // STEP 2: DRAW THE ASYMMETRICAL LEAF FINDER PATTERNS
        // Deep cuts adjusted to 2.75 modules wide to match the extreme Canva shape
        // Array maps to corner cuts: [TopLeft, TopRight, BottomRight, BottomLeft]
        const finders = [
            // Top-Left Finder (Sharp TL/BR, Cut TR/BL)
            { x: offset, y: offset, 
              outer: [0, 2.75, 0, 2.75], 
              inner: [0, 2.0, 0, 2.0], 
              core: [0, 1.2, 0, 1.2] },
            
            // Top-Right Finder (Cut TL/BR, Sharp TR/BL)
            { x: offset + (moduleCount - 7) * cellSize, y: offset, 
              outer: [2.75, 0, 2.75, 0], 
              inner: [2.0, 0, 2.0, 0], 
              core: [1.2, 0, 1.2, 0] },
            
            // Bottom-Left Finder (Cut TL/BR, Sharp TR/BL)
            { x: offset, y: offset + (moduleCount - 7) * cellSize, 
              outer: [2.75, 0, 2.75, 0], 
              inner: [2.0, 0, 2.0, 0], 
              core: [1.2, 0, 1.2, 0] }
        ];

        finders.forEach(pos => {
            const size = 7 * cellSize;

            // 1. Outer Frame Path (Black)
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#000000';
            drawChamferedRect(ctx, pos.x, pos.y, size, size, pos.outer.map(v => v * cellSize));

            // 2. Inner White Cutout Mask (Pure White to hollow it out)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ffffff';
            drawChamferedRect(ctx, pos.x + cellSize, pos.y + cellSize, size - 2 * cellSize, size - 2 * cellSize, pos.inner.map(v => v * cellSize));

            // 3. Central Solid Leaf Core (Black)
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#000000';
            drawChamferedRect(ctx, pos.x + 2 * cellSize, pos.y + 2 * cellSize, 3 * cellSize, 3 * cellSize, pos.core.map(v => v * cellSize));
        });
    }

    // Initialize Layout
    generateExactCrystalQR("https://yourwebsite.com", "crystalCanvas");
</script>

</body>
</html>
`,
  "Vertical Capsule": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        canvas {
            display: block;
            background: #ffffff;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <canvas id="capsuleCanvas" width="450" height="450"></canvas>
</div>

<script>
    function generateCapsuleQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Level 'M' or 'H' error correction works flawlessly here
        const qr = qrcode(0, 'M'); 
        qr.addData(text);
        qr.make();
        
        const count = qr.getModuleCount();
        const canvasSize = canvas.width;
        const cellSize = canvasSize / count;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#000000'; // Pure High-Contrast Black

        // Core helper functions
        function isDark(r, c) {
            if (r < 0 || r >= count || c < 0 || c >= count) return false;
            return qr.isDark(r, c);
        }

        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= count - 7) return true; // Top-Right
            if (r >= count - 7 && c < 7) return true; // Bottom-Left
            return false;
        }

        // STEP 1: DRAW VERTICALLY CONNECTED CAPSULE MODULES
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (isFinderPattern(r, c) || !isDark(r, c)) continue;

                const x = c * cellSize;
                const y = r * cellSize;
                const radius = cellSize / 2;

                // Check vertical neighbors explicitly to create vertical pill tracks
                const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);

                ctx.beginPath();
                
                if (top || bottom) {
                    // Vertical Pill Connection: shave a tiny fraction off the sides for definition
                    ctx.roundRect(
                        x + 0.6, 
                        y, 
                        cellSize - 1.2, 
                        cellSize, 
                        [top ? 0 : radius, top ? 0 : radius, bottom ? 0 : radius, bottom ? 0 : radius]
                    );
                } else {
                    // Standalone independent clean dot droplet
                    ctx.arc(x + radius, y + radius, radius - 0.4, 0, 2 * Math.PI);
                }
                ctx.fill();
            }
        }

        // STEP 2: DRAW THE SMOOTH ROUNDED CORNER FINDERS
        const finders = [
            { x: 0, y: 0 },
            { x: (count - 7) * cellSize, y: 0 },
            { x: 0, y: (count - 7) * cellSize }
        ];

        finders.forEach(pos => {
            const size = 7 * cellSize;

            // 1. Outer Smooth Square Shield Frame
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, size, size, 2 * cellSize);
            ctx.fill();

            // 2. White Inner Cutout Window
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(pos.x + cellSize, pos.y + cellSize, size - (2 * cellSize), size - (2 * cellSize), 1.2 * cellSize);
            ctx.fill();

            // 3. Central Solid Core Rounded Square Block
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.roundRect(pos.x + (2 * cellSize), pos.y + (2 * cellSize), 3 * cellSize, 3 * cellSize, 0.7 * cellSize);
            ctx.fill();
        });
    }

    // Initialize layout generation passing payload URL
    generateCapsuleQR("https://yourwebsite.com", "capsuleCanvas");
</script>

</body>
</html>
`,
  "Eco Circular": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fluid Curved QR Code Generator</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .qr-wrapper {
            position: relative;
            display: inline-block;
        }
        canvas {
            display: block;
            background: #ffffff;
            width: 450px;
            height: 450px;
            border-radius: 12px;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
</head>
<body>

<div class="card">
    <div class="qr-wrapper">
        <canvas id="fluidCanvas"></canvas>
    </div>
</div>

<script>
    function generateFluidQR(text, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // High-DPI / Retina Sharpness Setup for crystal-clear curves
        const displaySize = 450; 
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = displaySize * dpr;
        canvas.height = displaySize * dpr;
        ctx.scale(dpr, dpr);
        
        // Generate Standard QR Matrix (High Error Correction)
        const qr = qrcode(0, 'H'); 
        qr.addData(text);
        qr.make();
        
        const moduleCount = qr.getModuleCount();
        
        // Add a padding (quiet zone) around the QR code
        const padding = 2;
        const totalGridCount = moduleCount + (padding * 2);
        const cellSize = displaySize / totalGridCount;
        const offset = padding * cellSize;

        ctx.clearRect(0, 0, displaySize, displaySize);

        // Strict Black and White Style Color Configuration
        const qrColor = '#000000';
        ctx.fillStyle = qrColor;
        ctx.strokeStyle = qrColor;
        ctx.lineWidth = 0.5; // Micro-stroke to prevent any anti-aliasing gaps between cells

        // Core visibility matrix check
        function isDark(r, c) {
            if (r < 0 || r >= moduleCount || c < 0 || c >= moduleCount) return false;
            return qr.isDark(r, c);
        }

        // Identify Finder Patterns so we can draw them manually
        function isFinderPattern(r, c) {
            if (r < 7 && c < 7) return true; 
            if (r < 7 && c >= moduleCount - 7) return true; 
            if (r >= moduleCount - 7 && c < 7) return true; 
            return false;
        }

        // STEP 1: DRAW THE DATA MODULES (The Pure Liquid Engine)
        for (let r = 0; r < moduleCount; r++) {
            for (let c = 0; c < moduleCount; c++) {
                if (isFinderPattern(r, c)) continue;

                if (isDark(r, c)) {
                    // Check orthogonal neighbors to determine exposed edges
                    const top = isDark(r - 1, c) && !isFinderPattern(r - 1, c);
                    const bottom = isDark(r + 1, c) && !isFinderPattern(r + 1, c);
                    const left = isDark(r, c - 1) && !isFinderPattern(r, c - 1);
                    const right = isDark(r, c + 1) && !isFinderPattern(r, c + 1);

                    // Perfect circle radius for the fluid effect (half the cell size)
                    const radius = cellSize * 0.5;
                    
                    // Only round the corner if it's completely exposed to the outside.
                    // This ensures inner intersections remain solid and thick, exactly like Canva.
                    const tl = (!top && !left) ? radius : 0;
                    const tr = (!top && !right) ? radius : 0;
                    const br = (!bottom && !right) ? radius : 0;
                    const bl = (!bottom && !left) ? radius : 0;

                    const x = offset + (c * cellSize);
                    const y = offset + (r * cellSize);
                    
                    // Modern Canvas API for perfect native curves
                    ctx.beginPath();
                    ctx.roundRect(x, y, cellSize, cellSize, [tl, tr, br, bl]);
                    ctx.fill();
                    ctx.stroke(); // Fills sub-pixel gaps
                }
            }
        }

        // STEP 2: DRAW THE FLUID LEAF FINDER PATTERNS
        // Configured with pure circular curves matching the 13.png shape
        // Array maps to radii: [TopLeft, TopRight, BottomRight, BottomLeft]
        const finders = [
            // Top-Left Finder (Smooth TL/TR/BL, Sharp BR)
            { x: offset, y: offset, 
              outer: [3, 3, 0, 3], 
              inner: [2, 2, 0, 2], 
              core: [1.5, 1.5, 0, 1.5] },
            
            // Top-Right Finder (Smooth TL/TR/BR, Sharp BL)
            { x: offset + (moduleCount - 7) * cellSize, y: offset, 
              outer: [3, 3, 3, 0], 
              inner: [2, 2, 2, 0], 
              core: [1.5, 1.5, 1.5, 0] },
            
            // Bottom-Left Finder (Smooth TL/BL/BR, Sharp TR)
            { x: offset, y: offset + (moduleCount - 7) * cellSize, 
              outer: [3, 0, 3, 3], 
              inner: [2, 0, 2, 2], 
              core: [1.5, 0, 1.5, 1.5] }
        ];

        finders.forEach(pos => {
            const size = 7 * cellSize;

            // 1. Outer Frame Path (Black)
            ctx.fillStyle = qrColor;
            ctx.strokeStyle = qrColor;
            ctx.beginPath();
            ctx.roundRect(pos.x, pos.y, size, size, pos.outer.map(v => v * cellSize));
            ctx.fill();
            ctx.stroke();

            // 2. Inner White Cutout Mask
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(pos.x + cellSize, pos.y + cellSize, size - 2 * cellSize, size - 2 * cellSize, pos.inner.map(v => v * cellSize));
            ctx.fill();
            ctx.stroke();

            // 3. Central Solid Core Leaf Drop (Black)
            ctx.fillStyle = qrColor;
            ctx.strokeStyle = qrColor;
            ctx.beginPath();
            ctx.roundRect(pos.x + 2 * cellSize, pos.y + 2 * cellSize, 3 * cellSize, 3 * cellSize, pos.core.map(v => v * cellSize));
            ctx.fill();
            ctx.stroke();
        });
    }

    // Initialize Layout with your URL
    generateFluidQR("https://yourwebsite.com", "fluidCanvas");
</script>

</body>
</html>
`
};
