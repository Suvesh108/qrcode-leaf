import { 
  Link2, 
  Type, 
  Wifi, 
  Contact, 
  Undo2,
  Redo2,
  HelpCircle,
  ZoomOut,
  ZoomIn,
  Grid3X3,
  Maximize2,
  Palette,
  Layout,
  ImageIcon,
  Share2,
  Download,
  CheckCircle2,
  Globe,
  Plus,
  Sparkles,
  QrCode,
  Circle,
  Layers,
  Hexagon,
  Target,
  RefreshCw,
  Moon,
  Sun,
  Copy,
  Lock
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Template } from '../types';
import { useTemplates } from '../TemplateContext';

type ContentType = 'URL' | 'Text' | 'WiFi' | 'vCard';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
type PatternStyle = 'square' | 'rounded' | 'dots' | 'liquid' | 'constellation' | 'crystal' | 'columns';
type FinderStyle = 'square' | 'extra-rounded' | 'dot' | 'bullseye' | 'orbital' | 'octagonal' | 'diamond' | 'leaf' | 'shield';
type ExportFormat = 'PNG' | 'SVG' | 'PDF';
type DesignTab = 'Templates' | 'Logo';
type FillMode = 'solid' | 'gradient' | 'auto';

const ERROR_LABELS: Record<ErrorLevel, string> = { L: 'L (7%)', M: 'M (15%)', Q: 'Q (25%)', H: 'H (30%)' };
const ERROR_LEVELS: ErrorLevel[] = ['L', 'M', 'Q', 'H'];
const LEVEL_TO_INDEX: Record<ErrorLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
const INDEX_TO_LEVEL: ErrorLevel[] = ['L', 'M', 'Q', 'H'];
const PATTERN_MAP: Record<number, PatternStyle> = { 1: 'square', 2: 'rounded', 3: 'dots', 4: 'liquid', 5: 'constellation', 6: 'crystal', 7: 'columns' };

export default function GeneratorView() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('leafqr_user');
  const { templates } = useTemplates();
  const [url, setUrl] = useState('');
  const [activeType, setActiveType] = useState<ContentType>('URL');
  const [zoom, setZoom] = useState(100);
  const [gridVisible, setGridVisible] = useState(false);
  const [darkCanvas, setDarkCanvas] = useState(false);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [activeDesignTab, setActiveDesignTab] = useState<DesignTab>('Templates');
  const [fillMode, setFillMode] = useState<FillMode>('gradient');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PNG');
  const [resolution, setResolution] = useState('1024x1024 (HD)');
  const [selectedPattern, setSelectedPattern] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [versionAuto, setVersionAuto] = useState(true);
  const [qrVersion, setQrVersion] = useState(4);

  const location = useLocation();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const gradientStartInputRef = useRef<HTMLInputElement>(null);
  const gradientEndInputRef = useRef<HTMLInputElement>(null);
  const lastFetchedLogoUrl = useRef<string>('');
  const [config, setConfig] = useState({
    foregroundColor: '#000000',
    gradientColor2: '#8884d8',
    backgroundColor: '#FFFFFF',
    errorCorrection: 'H' as ErrorLevel,
    padding: 1,
    pattern: 'square' as PatternStyle,
    finder: 'square' as FinderStyle,
  });


  // Apply template state if redirected from collections
  useEffect(() => {
    const state = location.state as { template: Template } | null;
    if (state?.template?.qrConfig) {
      const { qrConfig } = state.template;
      setSelectedTemplate(state.template.name);
      setConfig(prev => ({
        ...prev,
        foregroundColor: qrConfig.foregroundColor,
        backgroundColor: qrConfig.backgroundColor,
        errorCorrection: qrConfig.errorCorrection as ErrorLevel,
        pattern: qrConfig.patternStyle as PatternStyle,
        finder: qrConfig.finderStyle as FinderStyle,
      }));
      
      // Update selected pattern for UI
      const patternEntries = Object.entries(PATTERN_MAP);
      const entry = patternEntries.find(([_, v]) => v === qrConfig.patternStyle);
      if (entry) setSelectedPattern(Number(entry[0]));
    }
  }, [location.state]);

  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // By default, logoImage is null to allow backend's dynamic logo scraper to run automatically

  const [serverSvg, setServerSvg] = useState<string | null>(null);
  const [serverPng, setServerPng] = useState<string | null>(null);
  const [isValidScan, setIsValidScan] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedColors, setExtractedColors] = useState<{
    primary: string;
    secondary: string;
    vibrant: string;
    darkMuted: string;
    lightMuted: string;
  } | null>(null);

  const isAutoModeActive = fillMode === 'auto' && isLoggedIn;

  // WiFi state
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  // vCard state
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  const getQRValue = useCallback(() => {
    switch (activeType) {
      case 'URL':
        return url;
      case 'Text':
        return url;
      case 'WiFi':
        return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
      case 'vCard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      default:
        return url;
    }
  }, [activeType, url, wifiSSID, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail]);

  const hasContent = React.useMemo(() => {
    if (activeType === 'URL') return url.trim() !== '';
    if (activeType === 'Text') return url.trim() !== '';
    if (activeType === 'WiFi') return wifiSSID.trim() !== '';
    if (activeType === 'vCard') return vcardName.trim() !== '';
    return false;
  }, [activeType, url, wifiSSID, vcardName]);

  const getReadabilityScore = useCallback(() => {
    const levelScores: Record<ErrorLevel, number> = { L: 85, M: 92, Q: 96, H: 99 };
    const base = levelScores[config.errorCorrection];
    const fgContrast = config.foregroundColor === '#000000' ? 0 : 3;
    const bgContrast = config.backgroundColor === '#FFFFFF' ? 0 : 2;
    return Math.min(99, base - fgContrast - bgContrast);
  }, [config.errorCorrection, config.foregroundColor, config.backgroundColor]);

  const updateConfig = useCallback((patch: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const handleExport = useCallback(() => {
    if (exportFormat === 'SVG' && serverSvg) {
      const link = document.createElement('a');
      link.href = serverSvg;
      link.download = 'qrcode.svg';
      link.click();
      return;
    }

    if (serverPng) {
      const link = document.createElement('a');
      link.download = `qrcode.png`;
      link.href = serverPng;
      link.click();
      return;
    }

    // fallback
    const size = resolution.startsWith('2048') ? 2048 : resolution.startsWith('512') ? 512 : 1024;
    if (exportFormat === 'SVG') {
      const svg = document.querySelector('#qr-display-svg svg') as SVGElement;
      if (svg) {
        const clone = svg.cloneNode(true) as SVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(clone)], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(svgBlob);
        link.download = 'qrcode.svg';
        link.click();
        URL.revokeObjectURL(link.href);
      }
      return;
    }

    const canvas = exportCanvasRef.current;
    if (canvas) {
      canvas.width = size;
      canvas.height = size;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [resolution, exportFormat, serverSvg, serverPng]);

  const handleShare = useCallback(async () => {
    const qrValue = getQRValue();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'QR Code', text: qrValue });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(qrValue);
      alert('QR value copied to clipboard!');
    }
  }, [getQRValue]);

  const handleCopyImage = useCallback(async () => {
    if (!serverPng) {
      alert('Generating QR Code preview... Please wait.');
      return;
    }
    try {
      const response = await fetch(serverPng);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert('QR Code image copied to clipboard! Paste it directly into Figma, Canva, or Slack.');
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
      alert('Failed to copy image to clipboard. Try manually exporting or sharing.');
    }
  }, [serverPng]);

  const handleTestLink = useCallback(() => {
    const value = getQRValue();
    if (activeType === 'URL' && value.startsWith('http')) {
      window.open(value, '_blank', 'noopener');
    } else {
      navigator.clipboard.writeText(value);
      alert('Content copied to clipboard!');
    }
  }, [getQRValue, activeType]);

  const handleResetZoom = useCallback(() => setZoom(100), []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveLogo = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLogoImage(null);
  }, []);


  // Post-process SVG to apply pattern styles to QR modules
  useEffect(() => {
    const svg = document.querySelector('#qr-display-svg svg');
    if (!svg) return;
    const rects = svg.querySelectorAll('rect');
    if (rects.length < 100) return; // Wait for full QR to render

    const isRounded = config.pattern === 'rounded';
    const isDots = config.pattern === 'dots';
    const finderStyle = config.finder;

    // Determine grid size from rect coordinates
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rects.forEach(r => {
      const x = parseFloat(r.getAttribute('x') || '0');
      const y = parseFloat(r.getAttribute('y') || '0');
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });

    const qrSize = maxX - minX;
    const rectSize = parseFloat(rects[0].getAttribute('width') || '1');
    const matrixSize = Math.round(qrSize / rectSize) + 1;

    rects.forEach((rect) => {
      const rx = parseFloat(rect.getAttribute('x') || '0');
      const ry = parseFloat(rect.getAttribute('y') || '0');
      const col = Math.round((rx - minX) / rectSize);
      const row = Math.round((ry - minY) / rectSize);
      const w = parseFloat(rect.getAttribute('width') || '0');

      const isFinder = (col < 7 && row < 7) || 
                       (col >= matrixSize - 7 && row < 7) || 
                       (col < 7 && row >= matrixSize - 7);

      if (isFinder) {
        if (finderStyle === 'dot') {
          rect.setAttribute('rx', String(w / 2));
          rect.setAttribute('ry', String(w / 2));
        } else if (finderStyle === 'extra-rounded') {
          rect.setAttribute('rx', String(w / 3));
          rect.setAttribute('ry', String(w / 3));
        } else {
          rect.removeAttribute('rx');
          rect.removeAttribute('ry');
        }
      } else {
        if (isDots) {
          rect.setAttribute('rx', String(w / 2));
          rect.setAttribute('ry', String(w / 2));
        } else if (isRounded) {
          rect.setAttribute('rx', '3');
          rect.setAttribute('ry', '3');
        } else {
          rect.removeAttribute('rx');
          rect.removeAttribute('ry');
        }
      }
    });
  }, [config.pattern, config.finder, getQRValue(), config.foregroundColor, config.backgroundColor, fillMode]);

  // Fetch from backend API
  useEffect(() => {
    if (!hasContent) {
      setServerSvg(null);
      setServerPng(null);
      setIsValidScan(false);
      setIsGenerating(false);
      setExtractedColors(null);
      return;
    }

    const timer = setTimeout(async () => {
      const qrVal = getQRValue();
      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: qrVal,
            customLogo: logoImage || undefined,
            dotStyle: config.pattern,
            cornerStyle: config.finder,
            foregroundColor: isAutoModeActive ? undefined : config.foregroundColor,
            gradientColor2: fillMode === 'gradient' ? config.gradientColor2 : undefined,
            backgroundColor: config.backgroundColor,
            gradient: fillMode === 'gradient',
            errorCorrection: config.errorCorrection,
            template: selectedTemplate || undefined,
            padding: config.padding,
            version: versionAuto ? undefined : qrVersion,
          }),
        });
        const data = await res.json();
        if (data.svg) {
          setServerSvg(data.svg);
          setServerPng(data.png);
          setIsValidScan(data.scanValid);
          if (data.colors) {
            setExtractedColors(data.colors);
            // Auto-populate gradient/foregroundColor once if new brand logo fetched
            if (data.logoUrl !== lastFetchedLogoUrl.current) {
              lastFetchedLogoUrl.current = data.logoUrl || '';
              if (data.logoUrl) {
                setConfig(prev => ({
                  ...prev,
                  foregroundColor: data.colors.primary || data.colors.vibrant || prev.foregroundColor,
                  gradientColor2: data.colors.secondary || prev.gradientColor2
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error("Error generating QR via API", err);
      } finally {
        setIsGenerating(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hasContent, getQRValue, logoImage, config.pattern, config.finder, config.foregroundColor, config.gradientColor2, config.backgroundColor, fillMode, selectedTemplate, config.errorCorrection, config.padding, versionAuto, qrVersion, manualRefreshCount, isLoggedIn]);

  const errorIndex = LEVEL_TO_INDEX[config.errorCorrection];
  const readability = getReadabilityScore();

  return (
    <div className="flex flex-col h-full">
      {/* Mini Header */}
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-surface border border-border rounded-lg px-3 py-1 text-sm text-text-secondary">
              {activeType === 'WiFi' ? `${wifiSSID || 'Untitled'}` : activeType === 'vCard' ? `${vcardName || 'Untitled'}` : 'Untitled Project'}
            </div>
            <div className="flex items-center gap-1.5 text-success text-[12px] font-medium bg-success/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready
            </div>
          </div>
        </div>

        {/* Center: Canvas View Controls */}
        <div className="flex items-center gap-3.5 bg-surface-container-low border border-border rounded-full px-4 py-1.5 shadow-sm">
          {/* Zoom controls */}
          <button className="p-1 text-text-secondary hover:text-primary transition-colors" onClick={() => setZoom(Math.max(50, zoom - 10))} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="text-[12px] font-mono font-bold text-text-primary w-11 text-center hover:text-primary transition-colors" onClick={handleResetZoom} title="Reset zoom">
            {zoom}%
          </button>
          <button className="p-1 text-text-secondary hover:text-primary transition-colors" onClick={() => setZoom(Math.min(200, zoom + 10))} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <div className="h-4.5 w-px bg-border" />
          
          {/* Grid Toggle */}
          <button
            className={cn("p-1.5 rounded-md transition-colors", gridVisible ? "text-primary bg-primary/10" : "text-text-secondary hover:text-primary hover:bg-hover")}
            onClick={() => setGridVisible(!gridVisible)}
            title="Toggle Artboard Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          
          {/* Fit to View */}
          <button className="p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors hover:bg-hover" onClick={handleResetZoom} title="Fit to view">
            <Maximize2 className="h-4 w-4" />
          </button>

          <div className="h-4.5 w-px bg-border" />

          {/* Dark Mode Canvas Toggle */}
          <button 
            className={cn("p-1.5 rounded-md transition-colors", darkCanvas ? "text-primary bg-primary/10" : "text-text-secondary hover:text-primary hover:bg-hover")}
            onClick={() => setDarkCanvas(!darkCanvas)}
            title={darkCanvas ? "Light Mode Workspace" : "Dark Contrast Workspace"}
          >
            {darkCanvas ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Copy to Clipboard */}
          <button 
            className="p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors hover:bg-hover disabled:opacity-40"
            onClick={handleCopyImage}
            title="Copy QR Image to Clipboard"
            disabled={!serverPng}
          >
            <Copy className="h-4 w-4" />
          </button>

          {/* Refresh/Sync */}
          <button 
            className={cn("p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors hover:bg-hover", isGenerating && "animate-spin text-primary")}
            onClick={() => setManualRefreshCount(prev => prev + 1)}
            title="Force Regenerate Preview"
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <div className="h-4.5 w-px bg-border" />

          {/* Share QR */}
          <button 
            className="p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors hover:bg-hover"
            onClick={handleShare}
            title="Share QR Content"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Download QR */}
          <button 
            className="p-1.5 rounded-md text-text-secondary hover:text-primary transition-colors hover:bg-hover disabled:opacity-40"
            onClick={handleExport}
            title="Export High-Res QR"
            disabled={!serverPng && !serverSvg}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <button
            className="p-2 text-text-secondary hover:text-primary transition-colors hover:bg-hover rounded-lg disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button
            className="p-2 text-text-secondary hover:text-primary transition-colors hover:bg-hover rounded-lg disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-border mx-1" />
          <button
            className="p-2 text-text-secondary hover:text-primary transition-colors hover:bg-hover rounded-lg"
            title="Help"
            onClick={() => alert('QR Code Leaf Pro - Create stunning, branded QR codes with advanced design tools.')}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
             <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Data Source */}
        <aside className="w-80 border-r border-border bg-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Data Source</h2>
          </div>

          <div className="p-4 space-y-8">
            {/* Content Type */}
            <div className="space-y-3">
               <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Content Type</label>
               <div className="grid grid-cols-2 gap-2">
                 {([
                   { name: 'URL' as ContentType, icon: Link2 },
                   { name: 'Text' as ContentType, icon: Type },
                   { name: 'WiFi' as ContentType, icon: Wifi },
                   { name: 'vCard' as ContentType, icon: Contact }
                 ]).map((t) => (
                   <button 
                    key={t.name}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200",
                      activeType === t.name 
                        ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/5 shadow-sm" 
                        : "border-border text-text-secondary hover:bg-hover active:scale-[0.98]"
                    )}
                    onClick={() => setActiveType(t.name)}
                   >
                     <t.icon className="h-4 w-4" />
                     {t.name}
                   </button>
                 ))}
               </div>
            </div>

            {/* Dynamic Input Area based on content type */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {activeType === 'URL' && (
                  <motion.div
                    key="URL"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="space-y-3 overflow-hidden"
                  >
                    <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Destination URL</label>
                    <div className="relative group">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                      <input 
                       type="text" 
                       value={url}
                       onChange={(e) => setUrl(e.target.value)}
                       className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                       placeholder="https://example.com"
                      />
                    </div>
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[11px] text-text-secondary">{getQRValue().length} characters</span>
                      <button className="text-[11px] text-primary font-semibold hover:underline" onClick={handleTestLink}>Test Link</button>
                    </div>
                  </motion.div>
                )}

                {activeType === 'Text' && (
                  <motion.div
                    key="Text"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="space-y-3 overflow-hidden"
                  >
                    <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Text Content</label>
                    <textarea
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[100px] resize-y"
                      placeholder="Enter any text to encode in the QR code..."
                      rows={4}
                    />
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[11px] text-text-secondary">{getQRValue().length} characters</span>
                      <button className="text-[11px] text-primary font-semibold hover:underline" onClick={handleTestLink}>Copy Text</button>
                    </div>
                  </motion.div>
                )}

                {activeType === 'WiFi' && (
                  <motion.div
                    key="WiFi"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-3">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Network SSID</label>
                      <input
                        type="text"
                        value={wifiSSID}
                        onChange={(e) => setWifiSSID(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Network name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Network password"
                      />
                    </div>
                    <div className="space-y-3 pb-1">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Encryption</label>
                      <div className="flex gap-2">
                        {['WPA', 'WEP', ''].map((enc) => (
                          <button
                            key={enc || 'none'}
                            onClick={() => setWifiEncryption(enc)}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all",
                              wifiEncryption === enc
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-border text-text-secondary hover:bg-hover"
                            )}
                          >
                            {enc || 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeType === 'vCard' && (
                  <motion.div
                    key="vCard"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-3">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="+1 555-0123"
                      />
                    </div>
                    <div className="space-y-3 pb-1">
                      <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px bg-border" />

            {/* Technical Specs */}
            <div className="space-y-6">
               <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest px-1">Technical Specs</h3>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-medium">Error Correction</label>
                    <span className="text-[11px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded">{ERROR_LABELS[config.errorCorrection]}</span>
                 </div>
                 <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  value={errorIndex}
                  onChange={(e) => updateConfig({ errorCorrection: INDEX_TO_LEVEL[Number(e.target.value)] })}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                 />
                 <div className="flex justify-between text-[10px] text-text-secondary font-medium px-1">
                    <span>L (7%)</span>
                    <span>M (15%)</span>
                    <span>Q (25%)</span>
                    <span>H (30%)</span>
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-medium">QR Version</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-text-secondary">{versionAuto ? 'Auto' : `v${qrVersion}`}</span>
                      <button
                        onClick={() => setVersionAuto(!versionAuto)}
                        className={cn(
                          "h-5 w-9 rounded-full relative transition-colors duration-200 focus:outline-none",
                          versionAuto ? "bg-primary" : "bg-text-secondary/30"
                        )}
                      >
                        <div className={cn(
                          "h-4 w-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200",
                          versionAuto ? "right-0.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                 </div>
                 <AnimatePresence>
                   {!versionAuto && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       transition={{ duration: 0.2, ease: 'easeInOut' }}
                       className="space-y-1.5 px-1 pt-1 overflow-hidden"
                     >
                       <div className="flex justify-between text-[10px] text-text-secondary font-mono">
                         <span>Min (v1)</span>
                         <span>Current: v{qrVersion}</span>
                         <span>Max (v40)</span>
                       </div>
                       <input 
                        type="range" 
                        min="1" 
                        max="40" 
                        value={qrVersion}
                        onChange={(e) => setQrVersion(Number(e.target.value))}
                        className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary mb-1"
                       />
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-medium">Quiet Zone (Padding)</label>
                    <span className="text-[11px] font-mono text-text-secondary">{config.padding} Modules</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="p-1.5 bg-surface border border-border rounded-lg">
                     <Maximize2 className="h-4 w-4 text-text-secondary" />
                   </div>
                   <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={config.padding}
                    onChange={(e) => updateConfig({ padding: Number(e.target.value) })}
                    className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                 </div>
               </div>
            </div>
          </div>
        </aside>

        {/* Center: Canvas Area */}
        <section className={cn(
          "flex-1 relative flex flex-col overflow-hidden transition-colors duration-300",
          darkCanvas ? "bg-[#0f172a]" : (gridVisible ? "bg-grid-pattern" : "bg-surface-container-low")
        )}>


          {/* Artboard Area */}
          <div className="flex-1 flex items-center justify-center p-12 overflow-auto">
             <div 
              style={{ transform: `scale(${zoom / 100})` }}
              className="transition-transform duration-300"
             >
               {!hasContent ? (
                 <div className={cn(
                   "p-12 rounded-3xl border transition-all duration-300 w-80 text-center flex flex-col items-center justify-center gap-6",
                   darkCanvas 
                     ? "bg-[#020617]/80 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md" 
                     : "bg-white/80 border-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md"
                 )}>
                   <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center relative animate-pulse">
                      <QrCode className="h-10 w-10 text-primary" />
                      <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-md" />
                   </div>
                   <div className="space-y-2">
                     <h3 className={cn(
                       "font-black tracking-tight text-xs uppercase",
                       darkCanvas ? "text-slate-300" : "text-text-primary"
                     )}>Preview Artboard</h3>
                     <p className={cn(
                       "text-xs leading-relaxed max-w-[200px] mx-auto",
                       darkCanvas ? "text-slate-500" : "text-text-secondary"
                     )}>
                       {activeType === 'URL' 
                         ? "Enter a destination URL on the left to generate your custom QR code preview."
                         : activeType === 'Text'
                         ? "Type some text content on the left to render your QR code preview."
                         : activeType === 'WiFi'
                         ? "Enter a Network SSID to render your QR code preview."
                         : "Specify a contact name to render your QR code preview."}
                     </p>
                   </div>
                 </div>
               ) : (
                 <motion.div 
                   animate={isGenerating ? {
                     scale: [1, 1.015, 0.99, 1.01, 1],
                     filter: ["brightness(1)", "brightness(1.03)", "brightness(0.98)", "brightness(1.02)", "brightness(1)"],
                   } : {
                     scale: 1,
                     filter: "brightness(1)",
                   }}
                   transition={isGenerating ? {
                     duration: 1.5,
                     repeat: Infinity,
                     ease: "easeInOut"
                   } : {
                     duration: 0.3
                   }}
                   className={cn(
                     "p-12 rounded-2xl border transition-all duration-300 relative group",
                     darkCanvas 
                       ? "bg-[#020617] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)]" 
                       : "bg-white border-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]"
                   )}
                 >
                   <div className="relative p-2 border-2 border-dashed border-transparent group-hover:border-primary/20 rounded-xl transition-colors">
                     <div id="qr-display-svg" className="relative">
                       {serverPng ? (
                         <div className={cn("transition-opacity duration-300", isGenerating ? "opacity-50" : "opacity-100")}>
                           <img src={serverPng} alt="QR Code" style={{ width: 256, height: 256 }} className="max-w-none" />
                         </div>
                       ) : (
                         <>
                           <QRCodeSVG 
                             value={getQRValue()}
                             size={256}
                             fgColor={(fillMode === 'gradient' || isAutoModeActive) ? '#000000' : config.foregroundColor}
                             bgColor={(fillMode === 'gradient' || isAutoModeActive) ? '#FFFFFF' : config.backgroundColor}
                             level={config.errorCorrection}
                             includeMargin={true}
                           />
                           {(fillMode === 'gradient' || isAutoModeActive) && (
                             <div
                               className="absolute inset-0 pointer-events-none"
                               style={{
                                 background: isAutoModeActive && extractedColors
                                   ? `linear-gradient(135deg, ${extractedColors.vibrant || extractedColors.primary}, ${extractedColors.secondary || '#8884d8'})`
                                   : `linear-gradient(135deg, ${config.foregroundColor}, ${config.gradientColor2})`,
                                 mixBlendMode: 'screen',
                                 WebkitMixBlendMode: 'screen',
                               } as React.CSSProperties}
                             />
                           )}
                         </>
                       )}
                     </div>
                     
                     {/* Hidden canvas for PNG export */}
                     <QRCodeCanvas
                       ref={exportCanvasRef}
                       value={getQRValue()}
                       size={256}
                       fgColor={config.foregroundColor}
                       bgColor={config.backgroundColor}
                       level={config.errorCorrection}
                       includeMargin={true}
                       style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}
                     />
                     
                     {/* Finder overlays */}
                     <div className="absolute top-2 left-2 w-16 h-16 border-2 border-primary/30 pointer-events-none" style={{ borderRadius: config.finder === 'dot' ? '9999px' : config.finder === 'extra-rounded' ? '12px' : '0px' }} />
                     <div className="absolute top-2 right-2 w-16 h-16 border-2 border-primary/30 pointer-events-none" style={{ borderRadius: config.finder === 'dot' ? '9999px' : config.finder === 'extra-rounded' ? '12px' : '0px' }} />
                     <div className="absolute bottom-2 left-2 w-16 h-16 border-2 border-primary/30 pointer-events-none" style={{ borderRadius: config.finder === 'dot' ? '9999px' : config.finder === 'extra-rounded' ? '12px' : '0px' }} />
                     
                     {/* Floating Center Badge */}
                     {!serverPng && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center p-3 border border-border overflow-hidden">
                         {logoImage ? (
                           <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-white">
                             <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                           </div>
                         ) : (
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm tracking-tight">
                             QR
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </motion.div>
               )}
           </div>
         </div>
      </section>

        {/* Right Sidebar: Design */}
        <aside className="w-80 border-l border-border bg-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="p-1.5 bg-primary/5 rounded-lg">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Design</h2>
          </div>

          <div className="flex border-b border-border relative">
            {(['Templates', 'Logo'] as DesignTab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveDesignTab(tab)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-all relative cursor-pointer",
                  activeDesignTab === tab ? "text-primary font-bold" : "text-text-secondary hover:text-primary"
                )}
              >
                {tab === 'Templates' && <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                {tab === 'Logo' && <ImageIcon className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                {tab}
                {activeDesignTab === tab && (
                  <motion.div 
                    layoutId="activeDesignTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>





           {activeDesignTab === 'Templates' && (
            <div className="p-4 space-y-8">


              {/* Color Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-text-primary">Color Style</label>
                  <div className="flex gap-1.5 p-1 bg-surface rounded-lg border border-border">
                    <button
                      className={cn(
                        "px-2.5 py-1.5 text-[11px] font-bold transition-all rounded-md",
                        fillMode === 'solid'
                          ? "bg-white shadow-sm border border-border text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                      onClick={() => setFillMode('solid')}
                    >Solid</button>
                    <button
                      className={cn(
                        "px-2.5 py-1.5 text-[11px] font-bold transition-all rounded-md",
                        fillMode === 'gradient'
                          ? "bg-white shadow-sm border border-border text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                      onClick={() => setFillMode('gradient')}
                    >Gradient</button>
                    <button
                      className={cn(
                        "px-2.5 py-1.5 text-[11px] font-bold transition-all rounded-md flex items-center gap-1",
                        fillMode === 'auto'
                          ? "bg-white shadow-sm border border-border text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                      onClick={() => setFillMode('auto')}
                    >
                      {isLoggedIn ? (
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      ) : (
                        <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                      )}
                      Auto
                    </button>
                  </div>
                </div>

                 {fillMode === 'solid' && (
                   <div className="space-y-4">
                     {extractedColors && (
                       <div className="space-y-2">
                         <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Fetched Logo Colors</label>
                         <div className="flex gap-2">
                           {Object.entries(extractedColors)
                             .filter(([key]) => key !== 'isDark' && key !== 'lightMuted' && key !== 'gradientStops')
                             .map(([key, val]) => (
                               <button
                                 key={key}
                                 onClick={() => updateConfig({ foregroundColor: val as string })}
                                 className={cn(
                                   "h-9 flex-1 rounded-xl transition-all border border-border/40 shadow-sm relative hover:scale-105 active:scale-95 cursor-pointer",
                                   config.foregroundColor.toLowerCase() === (val as string).toLowerCase() && "ring-2 ring-primary border-2 border-white scale-105"
                                 )}
                                 style={{ backgroundColor: val as string }}
                                 title={`${key}: ${val}`}
                               />
                             ))}
                         </div>
                       </div>
                     )}
                     <div className="flex flex-wrap gap-2.5">
                    {(() => {
                      const solidColors = [
                        // Neutral/Dark
                        '#000000', '#1E293B', '#475569', '#64748B',
                        // Red/Crimson
                        '#E11D48', '#DC2626', '#B91C1C', '#991B1B',
                        // Orange/Rust
                        '#F97316', '#EA580C', '#C2410C', '#9A3412',
                        // Amber/Gold
                        '#F59E0B', '#D97706', '#B45309', '#78350F',
                        // Emerald/Green
                        '#10B981', '#059669', '#047857', '#065F46',
                        // Teal/Forest
                        '#14B8A6', '#0D9488', '#0F766E', '#115E59',
                        // Blue/Indigo
                        '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
                        // Violet/Purple
                        '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
                        // Pink/Rose
                        '#EC4899', '#DB2777', '#C2185B', '#880E4F'
                      ];
                      const currentFg = config.foregroundColor.toUpperCase();
                      const isCustom = !solidColors.map(c => c.toUpperCase()).includes(currentFg);
                      
                      return (
                        <>
                          {solidColors.map((color) => (
                            <button 
                              key={color}
                              onClick={() => updateConfig({ foregroundColor: color })}
                              className={cn(
                                "w-9 h-9 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm",
                                config.foregroundColor.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary border-2 border-white scale-110"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          {isCustom && (
                            <button 
                              onClick={() => updateConfig({ foregroundColor: config.foregroundColor })}
                              className="w-9 h-9 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm ring-2 ring-primary border-2 border-white scale-110"
                              style={{ backgroundColor: config.foregroundColor }}
                              title={`Custom: ${config.foregroundColor}`}
                            />
                          )}
                        </>
                      );
                    })()}
                    <input 
                      type="color"
                      ref={colorInputRef}
                      className="sr-only"
                      value={config.foregroundColor}
                      onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                    />
                    <button 
                      onClick={() => colorInputRef.current?.click()}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-surface hover:bg-hover active:scale-95 transition-all shadow-sm"
                      title="Choose custom color"
                    >
                       <Plus className="h-4 w-4 text-text-secondary" />
                    </button>
                  </div>
                </div>
              )}

              {fillMode === 'gradient' && (
                <div className="space-y-6">
                  {/* Start Color Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Start Color</label>
                      <span className="text-[11px] font-mono text-text-secondary">{config.foregroundColor}</span>
                    </div>

                    {extractedColors && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-text-secondary/70">Fetched Logo Colors</label>
                        <div className="flex gap-2">
                          {Object.entries(extractedColors)
                            .filter(([key]) => key !== 'isDark' && key !== 'lightMuted' && key !== 'gradientStops')
                            .map(([key, val]) => (
                              <button
                                key={`start-${key}`}
                                onClick={() => updateConfig({ foregroundColor: val as string })}
                                className={cn(
                                  "h-8 flex-1 rounded-lg transition-all border border-border/40 shadow-sm relative hover:scale-105 active:scale-95 cursor-pointer",
                                  config.foregroundColor.toLowerCase() === (val as string).toLowerCase() && "ring-2 ring-primary border-2 border-white scale-105"
                                )}
                                style={{ backgroundColor: val as string }}
                                title={`${key}: ${val}`}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const startColors = [
                          '#000000', '#DC2626', '#EA580C', '#D97706',
                          '#059669', '#0D9488', '#2563EB', '#7C3AED', '#DB2777'
                        ];
                        const currentFg = config.foregroundColor.toUpperCase();
                        const isCustom = !startColors.map(c => c.toUpperCase()).includes(currentFg);
                        
                        return (
                          <>
                            {startColors.map((color) => (
                              <button 
                                key={`start-preset-${color}`}
                                onClick={() => updateConfig({ foregroundColor: color })}
                                className={cn(
                                  "w-8 h-8 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm",
                                  config.foregroundColor.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary border-2 border-white scale-110"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {isCustom && (
                              <button 
                                onClick={() => updateConfig({ foregroundColor: config.foregroundColor })}
                                className="w-8 h-8 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm ring-2 ring-primary border-2 border-white scale-110"
                                style={{ backgroundColor: config.foregroundColor }}
                                title={`Custom: ${config.foregroundColor}`}
                              />
                            )}
                          </>
                        );
                      })()}
                      <input 
                        type="color"
                        ref={gradientStartInputRef}
                        className="sr-only"
                        value={config.foregroundColor}
                        onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                      />
                      <button 
                        onClick={() => gradientStartInputRef.current?.click()}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center bg-surface hover:bg-hover active:scale-95 transition-all shadow-sm"
                        title="Choose custom start color"
                      >
                         <Plus className="h-3.5 w-3.5 text-text-secondary" />
                      </button>
                    </div>
                  </div>

                  {/* End Color Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">End Color</label>
                      <span className="text-[11px] font-mono text-text-secondary">{config.gradientColor2}</span>
                    </div>

                    {extractedColors && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-text-secondary/70">Fetched Logo Colors</label>
                        <div className="flex gap-2">
                          {Object.entries(extractedColors)
                            .filter(([key]) => key !== 'isDark' && key !== 'lightMuted' && key !== 'gradientStops')
                            .map(([key, val]) => (
                              <button
                                key={`end-${key}`}
                                onClick={() => updateConfig({ gradientColor2: val as string })}
                                className={cn(
                                  "h-8 flex-1 rounded-lg transition-all border border-border/40 shadow-sm relative hover:scale-105 active:scale-95 cursor-pointer",
                                  config.gradientColor2.toLowerCase() === (val as string).toLowerCase() && "ring-2 ring-primary border-2 border-white scale-105"
                                )}
                                style={{ backgroundColor: val as string }}
                                title={`${key}: ${val}`}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const endColors = [
                          '#8884d8', '#EC4899', '#DB2777', '#8B5CF6',
                          '#3B82F6', '#14B8A6', '#10B981', '#F59E0B', '#EA580C'
                        ];
                        const currentEnd = config.gradientColor2.toUpperCase();
                        const isCustom = !endColors.map(c => c.toUpperCase()).includes(currentEnd);
                        
                        return (
                          <>
                            {endColors.map((color) => (
                              <button 
                                key={`end-preset-${color}`}
                                onClick={() => updateConfig({ gradientColor2: color })}
                                className={cn(
                                  "w-8 h-8 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm",
                                  config.gradientColor2.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary border-2 border-white scale-110"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {isCustom && (
                              <button 
                                onClick={() => updateConfig({ gradientColor2: config.gradientColor2 })}
                                className="w-8 h-8 rounded-full transition-all ring-offset-2 hover:scale-110 shadow-sm ring-2 ring-primary border-2 border-white scale-110"
                                style={{ backgroundColor: config.gradientColor2 }}
                                title={`Custom: ${config.gradientColor2}`}
                              />
                            )}
                          </>
                        );
                      })()}
                      <input 
                        type="color"
                        ref={gradientEndInputRef}
                        className="sr-only"
                        value={config.gradientColor2}
                        onChange={(e) => updateConfig({ gradientColor2: e.target.value })}
                      />
                      <button 
                        onClick={() => gradientEndInputRef.current?.click()}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center bg-surface hover:bg-hover active:scale-95 transition-all shadow-sm"
                        title="Choose custom end color"
                      >
                         <Plus className="h-3.5 w-3.5 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {fillMode === 'auto' && (
                <div className="space-y-4">
                  {!isLoggedIn ? (
                    <div className="p-6 text-center bg-surface border border-border rounded-2xl space-y-4 relative overflow-hidden group shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
                      <div className="w-12 h-12 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 relative">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Lock className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-text-primary">Unlock Auto Color Mode</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed max-w-[200px] mx-auto">
                          Automatically scan your brand's logo and extract matching colors with one click.
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full font-bold shadow-sm"
                        onClick={() => navigate('/login')}
                      >
                        Log In to Unlock
                      </Button>
                    </div>
                  ) : extractedColors ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-primary">Auto Color Active</p>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            We've scanned your logo and automatically generated a matching color palette for your brand.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Extracted Brand Palette</label>
                        <div className="flex gap-2">
                          {Object.entries(extractedColors)
                            .filter(([key]) => key !== 'isDark' && key !== 'lightMuted' && key !== 'gradientStops')
                            .map(([key, val]) => (
                              <div
                                key={`auto-extracted-${key}`}
                                className="h-9 flex-1 rounded-xl border border-border/40 shadow-sm transition-all hover:scale-105"
                                style={{ backgroundColor: val as string }}
                                title={`${key}: ${val}`}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              </div>

              <div className="h-px bg-border/60" />

              {/* Shape Controls */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[13px] font-medium text-text-primary">Dot Patterns</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 1, icon: <Grid3X3 className="h-5 w-5" />, label: 'Square' },
                      { id: 2, icon: <Layout className="h-5 w-5" />, label: 'Rounded' },
                      { id: 3, icon: <Circle className="h-5 w-5 fill-current" />, label: 'Dots' },
                      { id: 4, icon: <Sparkles className="h-5 w-5" />, label: 'Liquid' },
                      { id: 5, icon: <Layers className="h-5 w-5" />, label: 'Network' },
                      { id: 6, icon: <Hexagon className="h-5 w-5" />, label: 'Crystal' },
                      { id: 7, icon: <Grid3X3 className="h-5 w-5" />, label: 'Columns' }
                    ].map((pattern) => (
                      <motion.button 
                        key={pattern.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setSelectedPattern(pattern.id);
                          updateConfig({ pattern: PATTERN_MAP[pattern.id] });
                          setSelectedTemplate(null);
                        }}
                        className={cn(
                          "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all gap-1 cursor-pointer",
                          selectedPattern === pattern.id 
                            ? "bg-primary/5 border-primary shadow-sm text-primary" 
                            : "bg-surface border-transparent hover:border-border/80 hover:bg-surface/50 text-text-secondary hover:text-text-primary"
                        )}
                        title={pattern.label}
                      >
                        {pattern.icon}
                        <span className="text-[9px] font-medium">{pattern.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <label className="text-[13px] font-medium text-text-primary">Corner Shapes</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'square', icon: <Grid3X3 className="h-5 w-5" />, label: 'Square' },
                      { id: 'extra-rounded', icon: <Layout className="h-5 w-5" />, label: 'Rounded' },
                      { id: 'dot', icon: <Circle className="h-5 w-5 fill-current" />, label: 'Dot' },
                      { id: 'bullseye', icon: <Target className="h-5 w-5" />, label: 'Bullseye' },
                      { id: 'orbital', icon: <Circle className="h-5 w-5" />, label: 'Orbital' },
                      { id: 'octagonal', icon: <Hexagon className="h-5 w-5" />, label: 'Octagon' },
                      { id: 'diamond', icon: <Layers className="h-5 w-5" />, label: 'Diamond' },
                      { id: 'leaf', icon: <Sparkles className="h-5 w-5" />, label: 'Leaf' }
                    ].map((finder) => (
                      <motion.button 
                        key={finder.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          updateConfig({ finder: finder.id as FinderStyle });
                          setSelectedTemplate(null);
                        }}
                        className={cn(
                          "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all gap-1 cursor-pointer",
                          config.finder === finder.id 
                            ? "bg-primary/5 border-primary shadow-sm text-primary" 
                            : "bg-surface border-transparent hover:border-border/80 hover:bg-surface/50 text-text-secondary hover:text-text-primary"
                        )}
                        title={finder.label}
                      >
                        {finder.icon}
                        <span className="text-[9px] font-medium">{finder.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-px bg-border/60" />

              {/* Predefined Templates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-text-primary">Featured Marketplace Styles</label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{templates.filter(t => t.qrConfig).length} Styles</span>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.filter(t => t.qrConfig).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        if (tpl.qrConfig) {
                          setSelectedTemplate(tpl.name);
                          updateConfig({
                            foregroundColor: tpl.qrConfig.foregroundColor,
                            backgroundColor: tpl.qrConfig.backgroundColor,
                            pattern: tpl.qrConfig.patternStyle as PatternStyle,
                            finder: tpl.qrConfig.finderStyle as FinderStyle,
                            errorCorrection: tpl.qrConfig.errorCorrection as ErrorLevel
                          });
                          
                          // Update pattern selection index
                          const patternEntries = Object.entries(PATTERN_MAP);
                          const entry = patternEntries.find(([_, v]) => v === tpl.qrConfig?.patternStyle);
                          if (entry) setSelectedPattern(Number(entry[0]));
                          
                          setFillMode('solid');
                        }
                      }}
                      className="group relative aspect-[4/3] rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary/40 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-full flex flex-col items-center justify-center p-3 gap-2">
                        <div className="w-10 h-10 border-2 border-primary/10 flex items-center justify-center p-1.5 rounded-xl bg-white transition-transform group-hover:scale-110">
                           <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-bold text-text-primary truncate w-full px-1">{tpl.name}</p>
                          <p className="text-[9px] text-text-secondary font-medium opacity-60">{tpl.category}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeDesignTab === 'Logo' && (
            <div className="p-4 space-y-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center space-y-4 hover:border-primary/40 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 mx-auto bg-surface rounded-2xl flex items-center justify-center border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                  <ImageIcon className="h-8 w-8 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Upload Logo</p>
                  <p className="text-xs text-text-secondary mt-1">SVG, PNG, or JPG (max 2MB)</p>
                </div>
                <Button variant="outline" size="sm" className="mt-2 pointer-events-none">Browse Files</Button>
              </div>

              {logoImage && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                    <img src={logoImage} alt="Preview" className="w-12 h-12 object-contain rounded-full border border-border bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">Logo uploaded</p>
                      <p className="text-[11px] text-text-secondary">Visible in QR center</p>
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="text-xs font-bold text-danger hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Export Bar */}
      <footer className="h-18 bg-white border-t border-border flex items-center justify-between px-8 shrink-0 z-20">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-text-secondary">Export Format:</span>
              <div className="flex bg-surface p-1 rounded-xl border border-border">
                {(['PNG', 'SVG', 'PDF'] as ExportFormat[]).map((f) => (
                  <button 
                    key={f}
                    onClick={() => setExportFormat(f)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                      exportFormat === f ? "bg-white text-primary shadow-sm border border-border" : "text-text-secondary hover:text-primary"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-border hidden lg:block" />

            <div className="hidden lg:flex items-center gap-3">
               <span className="text-[13px] font-medium text-text-secondary">Resolution:</span>
               <select
                 value={resolution}
                 onChange={(e) => setResolution(e.target.value)}
                 className="bg-transparent text-[13px] font-mono font-medium outline-none cursor-pointer"
               >
                 <option>512x512</option>
                 <option>1024x1024 (HD)</option>
                 <option>2048x2048 (Print)</option>
               </select>
            </div>

            <div className="h-6 w-px bg-border hidden lg:block" />

            {/* Validation Status */}
            <div className={cn(
              "hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[13px] transition-all",
              isGenerating ? "opacity-50" : "opacity-100",
              isValidScan
                ? "bg-success/5 border-success/30 text-success"
                : "bg-warning/5 border-warning/30 text-warning"
            )}>
              <CheckCircle2 className={cn("h-4 w-4", isValidScan ? "text-success" : "text-warning")} />
              <span className="font-semibold tracking-tight">Scan Validation: <span className="uppercase">{isValidScan ? 'Pass' : 'Low'}</span></span>
              <div className={cn("w-px h-3.5", isValidScan ? "bg-success/20" : "bg-warning/20")} />
              <span className="font-mono font-medium opacity-90">Readability: {isValidScan ? (Math.max(readability, 90)) : (readability < 70 ? readability : 65)}%</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2 px-6" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button className="gap-2 px-8 font-bold" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export QR
            </Button>
         </div>
      </footer>
    </div>
  );
}
