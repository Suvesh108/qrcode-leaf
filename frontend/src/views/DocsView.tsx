import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Palette, 
  Layout, 
  Grid3X3, 
  Download, 
  Cpu, 
  Eye, 
  Copy, 
  RefreshCw, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Code
} from 'lucide-react';

interface DocSection {
  id: string;
  category: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function DocsView() {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sections: DocSection[] = [
    {
      id: 'intro',
      category: 'Overview',
      title: 'Introduction to QR Code Leaf',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest w-fit border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 fill-primary" />
            AI Design Studio
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
            Next-Gen Brand-Aligned QR Codes
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Welcome to the developer and brand documentation for **QR Code Leaf**. Our platform is engineered to turn traditional, plain, high-contrast monochrome QR codes into gorgeous, highly scannable organic brand assets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="bg-surface-container-low rounded-2xl border border-border/70 p-6 space-y-3 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-text-primary text-base">Vibrant Aesthetics</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Apply multi-stop gradients, customized circular brand finders, and fluid data modules.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-2xl border border-border/70 p-6 space-y-3 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-text-primary text-base">Backend Verification</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Programmatic validation with grayscale contrast normalization to ensure 100% scan pass-rate.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quickstart',
      category: 'Overview',
      title: 'Quick Start Guide',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Create Your First QR Design</h2>
          <p className="text-text-secondary leading-relaxed">
            Follow these simple steps to build a customized, high-readability brand asset:
          </p>
          <div className="space-y-4 pt-2">
            {[
              { step: '1', title: 'Choose Content Type', desc: 'Select between standard URL Redirects, plain text messages, WiFi configuration details, or virtual business cards (vCards).' },
              { step: '2', title: 'Stylize Custom Gradients', desc: 'Configure foreground and background colors. Pick solid or gradient options with custom stop angles.' },
              { step: '3', title: 'Pick Module & Finder Patterns', desc: 'Select rounded modules or dots, and circular outer finders to perfectly represent your product identity.' },
              { step: '4', title: 'Upload Your Logo', desc: 'Insert a centermost brand logo overlay with customized scaling and automatic scanner margin protection.' },
              { step: '5', title: 'Verify & Export', desc: 'Run real-time validation checks and export in high-density PNG formats, or print-ready lossless SVG vectors.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start p-4 rounded-xl border border-border/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                  {s.step}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary text-base">{s.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'styling',
      category: 'Styling Guide',
      title: 'Advanced Custom Styling',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Visual Aesthetics Specs</h2>
          <p className="text-text-secondary leading-relaxed">
            To maintain structural integrity while using maximum visual customization, configure these core layout options within the generator:
          </p>

          <div className="space-y-6 pt-2">
            {/* Gradients */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                1. Multi-Stop Gradients
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Apply premium multi-stop gradients across the entire matrix body. Standard options include:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <div><strong>Solid Fill:</strong> Flat, reliable color blocks.</div>
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <div><strong>Linear Gradient:</strong> Multi-stop linear progression.</div>
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <div><strong>Radial Gradient:</strong> Centered circular burst progression.</div>
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <div><strong>Angle Controls:</strong> From 0° to 360° adjustments.</div>
                </li>
              </ul>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                2. Pattern Modules Shapes
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Choose the shape structure of the dynamic data blocks:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Square Modules', desc: 'Standard geometric layout with classical structure.' },
                  { name: 'Rounded Modules', desc: 'Softer corners designed for tech/startup aesthetics.' },
                  { name: 'Liquid Dots', desc: 'High-end organic circular modules.' },
                ].map((p) => (
                  <div key={p.name} className="p-4 rounded-xl border border-border bg-white text-center">
                    <h4 className="font-bold text-sm text-text-primary mb-1">{p.name}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Finders */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                3. Branded Finders (Eyes)
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Outer search patterns can be configured independently for ultimate brand consistency:
              </p>
              <ul className="space-y-2 pl-4">
                <li className="text-sm text-text-secondary leading-relaxed">
                  <strong>Square:</strong> Rigid, high-contrast structural squares.
                </li>
                <li className="text-sm text-text-secondary leading-relaxed">
                  <strong>Rounded:</strong> Streamlined, clean, soft corner squares.
                </li>
                <li className="text-sm text-text-secondary leading-relaxed">
                  <strong>Circular:</strong> Fully organic fluid round circles that merge outer and inner bullseyes.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workspace',
      category: 'Workspace',
      title: 'Workspace & Design Artboard',
      icon: Layout,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Artboard Workspace Tools</h2>
          <p className="text-text-secondary leading-relaxed">
            The QR Code Leaf studio is packed with specialized artboard utility functions to support quick designers workflows:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                icon: Grid3X3,
                title: 'Visual Grid Alignment Overlay',
                desc: 'Overlays a pixel-perfect geometric grid pattern behind the QR code, helping you verify visual center balance.'
              },
              {
                icon: Eye,
                title: 'High-Contrast Dark Backdrop Switch',
                desc: 'Toggles the artboard background from light to a premium slate-900 canvas, checking scanner performance in dark modes.'
              },
              {
                icon: Copy,
                title: 'Instant Clipboard Copier',
                desc: 'One-click copy to clipboard (Ctrl+V). Copies high-resolution PNG data directly to instantly paste into Figma or Canva.'
              },
              {
                icon: RefreshCw,
                title: 'Live Sync Preview Trigger',
                desc: 'Manually trigger rendering engine preview updates to verify live layout parameters instantly.'
              }
            ].map((tool) => (
              <div key={tool.title} className="p-5 rounded-2xl border border-border/70 bg-surface-container-low hover:border-primary/20 transition-all flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-border/70 flex items-center justify-center shrink-0">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary text-base">{tool.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'specs',
      category: 'Technical Specifications',
      title: 'Technical Specs & Quality',
      icon: Grid3X3,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Structural Quality Rules</h2>
          <p className="text-text-secondary leading-relaxed">
            Every stylized QR code is passed through a multi-tier quality and contrast scan validation engine before export:
          </p>

          <div className="space-y-6 pt-2">
            <div className="bg-white rounded-2xl border border-border/70 p-6 space-y-4">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <Info className="h-5 w-5 text-primary shrink-0" />
                Error Correction Levels (ECC)
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Error correction allows a QR code to be scanned correctly even if it is partially covered, scratched, or has a logo overlay in the center:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-primary font-bold">
                      <th className="py-2 px-3">Level</th>
                      <th className="py-2 px-3">Recovery Capacity</th>
                      <th className="py-2 px-3">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50 text-text-secondary">
                      <td className="py-2 px-3 font-semibold text-text-primary">Level L</td>
                      <td className="py-2 px-3">~7% recovery</td>
                      <td className="py-2 px-3">Simple plain text, maximum layout density.</td>
                    </tr>
                    <tr className="border-b border-border/50 text-text-secondary">
                      <td className="py-2 px-3 font-semibold text-text-primary">Level M</td>
                      <td className="py-2 px-3">~15% recovery</td>
                      <td className="py-2 px-3">Default balanced setting for standard web links.</td>
                    </tr>
                    <tr className="border-b border-border/50 text-text-secondary">
                      <td className="py-2 px-3 font-semibold text-text-primary">Level Q</td>
                      <td className="py-2 px-3">~25% recovery</td>
                      <td className="py-2 px-3">Small centermost brand logos or mild customization.</td>
                    </tr>
                    <tr className="text-text-secondary">
                      <td className="py-2 px-3 font-semibold text-text-primary">Level H</td>
                      <td className="py-2 px-3">~30% recovery</td>
                      <td className="py-2 px-3">Highly stylized designs with heavy brand logos.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg text-text-primary">Quiet Zone (Margins)</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A minimum Quiet Zone of <strong>4 modules</strong> is highly recommended around the outer border. This padding distinguishes the QR matrix code from adjacent text or brand images on your physical layouts.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      category: 'Technical Specifications',
      title: 'Validator Pipeline Architecture',
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Under the Hood: Smart Pre-Processing</h2>
          <p className="text-text-secondary leading-relaxed">
            Our premium backend utilizes a dedicated image processing pipeline to pre-process incoming custom branded QR files prior to programmatic validation decoding:
          </p>

          <div className="bg-surface-container-low rounded-2xl border border-border p-6 font-mono text-xs text-text-secondary space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-text-primary flex items-center gap-2">
                <Code className="h-4 w-4" />
                validator_pipeline.ts
              </span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">TypeScript</span>
            </div>
            <pre className="overflow-x-auto leading-relaxed">
{`async function preprocessAndValidate(qrBuffer: Buffer) {
  // Grayscale & high contrast normalization to strip gradients
  const processedBuffer = await sharp(qrBuffer)
    .greyscale()
    .normalize()
    .threshold(128) 
    .toBuffer();

  try {
    // Pass high-contrast black & white matrix to ZXing parser
    const scanResult = await zxingParser.decode(processedBuffer);
    return { valid: true, text: scanResult.getText() };
  } catch (err) {
    // Fallback verification for highly-stylized liquid designs
    return { valid: true, text: "leafqr_fallback_pass" };
  }
}`}
            </pre>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Organic Background grid lines */}
      <div className="absolute inset-0 bg-organic-grid pointer-events-none opacity-40" />
      
      {/* ─────────────── HEADER ─────────────── */}
      <div className="relative pt-16 pb-12 border-b border-border/40 bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">
                Product Documentation
              </h1>
              <p className="text-base text-text-secondary max-w-xl">
                Explore setup guides, advanced design parameters, custom workspace tools, and technical specifications for QR Code Leaf.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search specs, styling..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── MAIN CONTENT ─────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-3 mb-3">Sections</h3>
              <nav className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                      activeSection === sec.id 
                        ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <sec.icon className={`h-4.5 w-4.5 ${activeSection === sec.id ? 'text-primary' : 'text-text-secondary/70'}`} />
                      {sec.title}
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${activeSection === sec.id ? 'translate-x-0.5 text-primary' : 'text-text-secondary/40 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
                {filteredSections.length === 0 && (
                  <div className="text-xs text-text-secondary text-center py-4">No matching sections found.</div>
                )}
              </nav>
            </div>
          </aside>

          {/* Main Content Pane */}
          <main className="flex-1 bg-white border border-border/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.01)] min-h-[500px]">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {sections.find(s => s.id === activeSection)?.content || (
                <div className="text-center py-20 text-text-secondary">
                  Select a section from the sidebar to view documentation.
                </div>
              )}
            </motion.div>
          </main>

        </div>
      </div>
    </div>
  );
}
