import { 
  ArrowRight, 
  Zap, 
  Sparkles,
  Scan,
  Download,
  CheckCircle2,
  PlayCircle,
  Palette,
  Link2,
  Type,
  Wifi,
  Contact,
  Layout,
  ImageIcon,
  Grid3X3,
  Layers,
  Eye,
  Copy,
  RefreshCw
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { MARKETPLACE_TEMPLATES } from '../templateMetadata';

const contentTypes = [
  {
    icon: Link2,
    title: 'URL Redirect',
    description: 'Encode any web link into a scannable QR code. Perfect for marketing campaigns, product pages, and landing pages.',
  },
  {
    icon: Type,
    title: 'Plain Text',
    description: 'Embed messages, notes, or snippets directly into your QR code. No internet connection needed to read.',
  },
  {
    icon: Wifi,
    title: 'WiFi Network',
    description: 'Generate QR codes that connect devices to your network instantly. Supports WPA, WEP, and open networks.',
  },
  {
    icon: Contact,
    title: 'vCard Contact',
    description: 'Share contact details with a single scan. Name, phone, email — all stored directly on the device.',
  },
];

const designFeatures = [
  {
    icon: Palette,
    title: 'Advanced Customization',
    details: [
      'Solid, Linear, & Radial dynamic gradient custom fills',
      'Configurable custom angles and color stops',
      'Live foreground & background contrast checking',
      'Instant artboard rendering feedback loops'
    ],
  },
  {
    icon: Layout,
    title: 'Pattern & Brand Finders',
    details: [
      'Square, rounded, dots, liquid, columns, and crystal data modules',
      'Circular, rounded, square, and custom bullseye finder styles',
      'Distinct custom color controls for outer/inner finders',
      'Perfect brand integration and modern organic themes'
    ],
  },
  {
    icon: Grid3X3,
    title: 'Technical Specification Limits',
    details: [
      'Standardized Error Correction levels (L, M, Q, H)',
      'Adjustable pixel quiet zone safety margins',
      'Auto QR Version selection algorithm',
      'Accurate validation scan readability score engines'
    ],
  },
  {
    icon: Download,
    title: 'Studio Quality Exports',
    details: [
      'Scalable lossless SVG vector graphics for heavy print design',
      'High-quality web-ready PNG image formats',
      'Print-ready high-density PDF exports',
      'Optimized 512px, 1024px, and 2048px custom dimensions'
    ],
  },
];

const workspaceFeatures = [
  {
    icon: Grid3X3,
    title: 'Visual Grid Guides',
    description: 'Toggle a pixel-perfect layout alignment grid guide to easily ensure precision, balance, and center-focused design consistency.',
  },
  {
    icon: Eye,
    title: 'Contrast Dark Mode Preview',
    description: 'Instantly view your custom branded QR code designs on a dark theme artboard background to guarantee maximum scan performance.',
  },
  {
    icon: Copy,
    title: 'Instant Clipboard Copier',
    description: 'Copy high-fidelity generated QR code images directly to your system clipboard (Ctrl+V) for rapid branding design workflow.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Live Sync Updater',
    description: 'Manually trigger rendering engine preview updates to guarantee pixel integrity across every customized parameter.',
  },
  {
    icon: Layout,
    title: 'Interactive Artboard Canvas',
    description: 'Zoom in to inspect alignment, zoom out for general aesthetics, or use fit-to-screen for a fully centered control view.',
  },
  {
    icon: Sparkles,
    title: 'Custom Brand Logo Overlays',
    description: 'Upload your own business logo as a center overlay, or use the pre-configured premium sample logo with automatic safety checks.',
  },
];



export default function LandingView() {
  const navigate = useNavigate();

  return (
    <div className="bg-background relative">
      <div className="absolute inset-0 bg-organic-grid pointer-events-none" />

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative pt-28 pb-36 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[900px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mx-auto w-fit border border-primary/20 shadow-[0_2px_12px_rgba(46,157,82,0.04)]"
          >
            <Sparkles className="h-3.5 w-3.5 fill-primary" />
            Professional QR Code Designer
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary max-w-5xl mx-auto leading-[1.05]"
          >
            Design Custom QR Codes That<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-primary-container">Reflect Your Brand</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            A full-featured QR code studio with real-time design tools, campaign analytics, 
            multi-format export, and a template marketplace — all themed for the modern tech age.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-[1px] transition-all duration-300" onClick={() => navigate('/generator')}>
              Open QR Designer
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl border-border bg-white shadow-sm gap-3 hover:-translate-y-[1px] transition-all duration-300" onClick={() => navigate('/collections')}>
              <Layers className="h-5 w-5 text-primary" />
              Browse Templates
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── CONTENT TYPES ─────────────── */}
      <section className="py-28 bg-surface-container-low border-y border-border/40 relative">
        <div className="absolute inset-0 bg-organic-grid opacity-3" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-text-primary">What You Can Encode</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              QR Code Leaf supports multiple data formats. Pick the content type that fits your use case and customize the look.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-border/70 p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-[2px] transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── DESIGN STUDIO ─────────────── */}
      <section className="py-28 relative">
        <div className="absolute top-[20%] right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mx-auto w-fit border border-primary/20">
              <Palette className="h-3.5 w-3.5" />
              Design Studio
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text-primary">Full Design Control</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Every visual aspect of your QR code is customizable. Change colors, patterns, and finder styles in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {designFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="bg-surface-container-low rounded-2xl border border-border/70 p-8 hover:shadow-xl hover:border-primary/20 hover:-translate-y-[1px] transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center border border-border shrink-0">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">{feature.title}</h3>
                    <ul className="space-y-2">
                      {feature.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── INTERACTIVE WORKSPACE ─────────────── */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-[30%] left-0 w-[450px] h-[450px] rounded-full bg-primary/2 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mx-auto w-fit border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Advanced Workspace
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text-primary">Centrally Powered Design Workspace</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Experience the central QR design artboard built to boost custom brand-aligned production workflow efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                className="bg-surface-container-low rounded-2xl border border-border/70 p-7 hover:shadow-xl hover:border-primary/20 hover:-translate-y-[2px] transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center justify-center border border-border mb-5 group-hover:bg-primary/5 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ─────────────── TEMPLATES ─────────────── */}
      <section className="py-28 relative">
        <div className="absolute top-[30%] left-0 w-[400px] h-[400px] rounded-full bg-primary/2 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit border border-primary/20">
                <Layers className="h-3.5 w-3.5" />
                Marketplace
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-text-primary leading-tight">Pre-Designed Brand Templates</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Not a designer? Browse our collection of professionally crafted QR code templates. 
                Categories include marketing, business cards, menus, events, and abstract art. Pick one and customize it to match your brand style instantly.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-lg">
              {MARKETPLACE_TEMPLATES.slice(0, 4).map((tpl, idx) => (
                <motion.div 
                  key={tpl.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02, boxShadow: '0 20px 40px rgba(46, 157, 82, 0.08)' }}
                  className="aspect-[4/5] bg-surface-container-low rounded-2xl border border-border/70 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate('/collections')}
                >
                  <div className="w-full aspect-square bg-white rounded-xl border border-border/70 flex items-center justify-center mb-3 group-hover:border-primary/20 transition-colors">
                    <Scan className="h-10 w-10 text-text-secondary/30 group-hover:text-primary/40 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-text-primary tracking-tight">{tpl.name}</span>
                  <span className="text-[11px] text-text-secondary font-medium mt-0.5">
                    {tpl.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── CTA ─────────────── */}
      <section className="py-28 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-organic-grid opacity-5" />
        
        {/* Static ambient glow — no JS animation to avoid scroll repaints */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/8 rounded-full blur-[120px] pointer-events-none"
          style={{ willChange: 'transform', transform: 'translate(-50%, -50%) translateZ(0)' }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-3xl p-12 md:p-16 text-center space-y-8 shadow-[0_20px_50px_rgba(46,157,82,0.04)] border border-primary/15 relative overflow-hidden"
          >
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
              Ready to Design Your <span className="text-primary">QR Code Leaf</span>?
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
              Create gorgeous, modern, brand-aligned QR codes in seconds. No sign-up required. Free forever to build static and dynamic campaigns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" onClick={() => navigate('/generator')}>
                Open QR Designer
                <ArrowRight className="h-5 w-5 ml-2 animate-pulse" />
              </Button>
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-semibold text-sm">No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
