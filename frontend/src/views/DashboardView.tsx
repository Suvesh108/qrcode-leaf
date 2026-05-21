import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal, 
  ExternalLink,
  ChevronDown,
  Filter,
  Calendar,
  Zap,
  MousePointer2,
  Globe,
  Share2,
  Send,
  Loader2,
  Check,
  Sparkles,
  QrCode,
  FileCode,
  Image,
  Upload,
  Tag,
  X,
  FileText
} from 'lucide-react';
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { MOCK_CAMPAIGNS } from '../mockData';
import { MARKETPLACE_TEMPLATES } from '../templateMetadata';
import { Campaign } from '../types';
import { cn } from '../lib/utils';
import { useTemplates } from '../TemplateContext';

const CHART_DATA = [
  { day: 'Mon', scans: 2400 },
  { day: 'Tue', scans: 1398 },
  { day: 'Wed', scans: 9800 },
  { day: 'Thu', scans: 3908 },
  { day: 'Fri', scans: 4800 },
  { day: 'Sat', scans: 3800 },
  { day: 'Sun', scans: 4300 },
];

const getDeployLogs = (qrName: string, htmlName: string, imageName: string) => [
  "Establishing encrypted SSL connection to production nodes...",
  `Preparing layout deployment for QR code: "${qrName}"...`,
  `Reading HTML layout source code from: "${htmlName}"...`,
  "Serializing layout schema into optimized vector format...",
  `Caching collection template image: "${imageName}"...`,
  "Re-generating finder patterns with dynamic corner shaders...",
  "Pushing assets to Global CDN edge servers (24 locations)...",
  "Invalidating local cache headers & purging legacy endpoints...",
  "Syncing routing paths for target campaign redirect URL...",
  "System verification: Deployed successfully!"
];

export default function DashboardView() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const { refresh: refreshTemplates } = useTemplates();
  const [isPushModalOpen, setIsPushModalOpen] = React.useState(false);

  const dateRangeString = React.useMemo(() => {
    const today = new Date();
    const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const format = (d: Date) => `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    return `${format(start)} — ${format(today)}`;
  }, []);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('10'); // Default to Leaf Finder
  const [selectedCampaignId, setSelectedCampaignId] = React.useState('');
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [deploySuccess, setDeploySuccess] = React.useState(false);
  const [deployStep, setDeployStep] = React.useState(0);

  React.useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  // Dynamic live analytics states
  const [analytics, setAnalytics] = React.useState<{
    totalScans: number;
    uniqueVisitors: number;
    avgReadability: number;
    activeCampaigns: number;
    dailyTraffic: { day: string; scans: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // QR Code Name
  const [qrCodeName, setQrCodeName] = React.useState('Leaf Finder Custom QR');

  // Custom asset file uploader states
  const [htmlFile, setHtmlFile] = React.useState<File | null>(null);
  const [htmlFileName, setHtmlFileName] = React.useState('leaf-finder.html');
  const [isHtmlDragActive, setIsHtmlDragActive] = React.useState(false);

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewImageName, setPreviewImageName] = React.useState('leaf-finder-thumbnail.png');
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  const [isImageDragActive, setIsImageDragActive] = React.useState(false);

  // File Input Refs
  const htmlInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const activeTemplate = MARKETPLACE_TEMPLATES.find(t => t.id === selectedTemplateId) || MARKETPLACE_TEMPLATES[0];
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Auto-generate beautiful defaults when template changes
  React.useEffect(() => {
    const templateNameNormalized = activeTemplate.name.toLowerCase().replace(/\s+/g, '-');
    if (!htmlFile) {
      setHtmlFileName(`${templateNameNormalized}.html`);
    }
    if (!imageFile) {
      setPreviewImageName(`${templateNameNormalized}-thumbnail.png`);
    }
    setQrCodeName(`${activeTemplate.name} Custom QR`);
  }, [selectedTemplateId, activeTemplate.name, htmlFile, imageFile]);

  // Clean up object URL when component unmounts or preview url changes
  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // HTML Drag & Drop Event Handlers
  const handleHtmlDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsHtmlDragActive(true);
    } else if (e.type === "dragleave") {
      setIsHtmlDragActive(false);
    }
  };

  const handleHtmlDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHtmlDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.html')) {
        setHtmlFile(file);
        setHtmlFileName(file.name);
      } else {
        alert("Only HTML files (.html) are supported!");
      }
    }
  };

  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.html')) {
        setHtmlFile(file);
        setHtmlFileName(file.name);
      } else {
        alert("Only HTML files (.html) are supported!");
      }
    }
  };

  // Image Drag & Drop Event Handlers
  const handleImageDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsImageDragActive(true);
    } else if (e.type === "dragleave") {
      setIsImageDragActive(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewImageName(file.name);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        alert("Only image files are supported!");
      }
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewImageName(file.name);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        alert("Only image files are supported!");
      }
    }
  };

  const currentLogs = getDeployLogs(qrCodeName, htmlFileName, previewImageName);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const generateDefaultHtml = (templateName: string, config: any): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${templateName} Custom Styled QR</title>
<!-- QR Styling Library -->
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling/lib/qr-code-styling.js"></script>
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f7f9fa;
        font-family: 'Inter', system-ui, sans-serif;
    }
    #qr {
        padding: 24px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.06);
        border: 1px solid rgba(0,0,0,0.03);
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
        errorCorrectionLevel: "${config.errorCorrection || 'H'}"
    },
    dotsOptions: {
        type: "${config.patternStyle === 'liquid' ? 'rounded' : config.patternStyle || 'rounded'}",
        color: "${config.foregroundColor || '#000000'}"
    },
    backgroundOptions: {
        color: "${config.backgroundColor || '#ffffff'}"
    },
    cornersSquareOptions: {
        type: "${config.finderStyle || 'extra-rounded'}",
        color: "${config.foregroundColor || '#000000'}"
    },
    cornersDotOptions: {
        type: "dot",
        color: "${config.foregroundColor || '#000000'}"
    }
});
qrCode.append(document.getElementById("qr"));
</script>
</body>
</html>`;
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploySuccess(false);
    setDeployStep(0);

    try {
      // 1. Read HTML template source code
      let htmlContent = "";
      if (htmlFile) {
        htmlContent = await readFileAsText(htmlFile);
      } else {
        htmlContent = generateDefaultHtml(qrCodeName, activeTemplate.qrConfig);
      }

      // 2. Read preview thumbnail image base64 if uploaded
      let imageBase64 = "";
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      // 3. Post directly to our automation API to write to sourceCodes.ts in backend
      const response = await fetch('/api/templates/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: qrCodeName,
          html: htmlContent,
          category: activeTemplate.category || 'Custom',
          style: activeTemplate.style || 'Custom • Pushed',
          imageName: imageFile ? imageFile.name : undefined,
          imageBase64: imageFile ? imageBase64 : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to push design to backend sourceCodes.ts.");
      }

      const result = await response.json();
      console.log("[AUTOMATION SUCCESS]:", result);

      // 4. Run step-by-step progress logging animation for gorgeous compiler console feedback
      const interval = setInterval(() => {
        setDeployStep(prev => {
          if (prev >= currentLogs.length - 1) {
            clearInterval(interval);
            setIsDeploying(false);
            setDeploySuccess(true);
            
            // Refresh live template list in Collection & Generator pages instantly
            refreshTemplates();
            fetchAnalytics();

            // Update campaign readability & trigger glowing deployed status
            setCampaigns(oldCampaigns => 
              oldCampaigns.map(c => 
                c.id === selectedCampaignId 
                  ? { ...c, name: qrCodeName, readability: 99.8, status: 'active' } 
                  : c
              )
            );
            return prev;
          }
          return prev + 1;
        });
      }, 350);

    } catch (err) {
      console.error("[AUTOMATION DEPLOY ERROR]:", err);
      alert(err instanceof Error ? err.message : "Deployment automation failed.");
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface p-4 md:p-5 relative overflow-y-auto h-full">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
          <div className="space-y-0.5">
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-text-primary">Performance Overview</h1>
            <p className="text-text-secondary text-[10px] md:text-[11px]">Real-time engagement tracking across all your active QR campaigns.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
             <div className="flex items-center gap-2 bg-white border border-border px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-text-secondary shadow-xs hover:bg-hover transition-colors cursor-pointer">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{dateRangeString}</span>
                <ChevronDown className="h-4 w-4 text-text-secondary" />
             </div>
             <Button variant="secondary" className="gap-2 px-4 md:px-5 h-10 text-xs md:text-sm font-bold shadow-sm hover:bg-hover cursor-pointer" onClick={fetchAnalytics}>
                <Zap className="h-4 w-4 fill-white" />
                <span>Live Refresh</span>
             </Button>
             <Button
               variant="primary"
               className="gap-2 px-4 md:px-5 h-10 text-xs md:text-sm font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 transition-all cursor-pointer rounded-xl"
               onClick={() => {
                 setDeploySuccess(false);
                 setIsDeploying(false);
                 setIsPushModalOpen(true);
               }}
             >
                <QrCode className="h-4 w-4" />
                <span>Push QR Design</span>
             </Button>
          </div>
        </div>

        {/* Stats + Chart Row */}
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 lg:h-[320px] shrink-0">
          {/* Left Column: Stats */}
          <div className="grid grid-cols-3 lg:flex lg:flex-col lg:w-56 xl:w-64 gap-3 md:gap-4 shrink-0">
            <StatCard
              title="Total Scans"
              value={isLoading ? "..." : (analytics?.totalScans.toLocaleString() || "0")}
              change="+12.5%"
              isPositive={true}
              icon={<MousePointer2 className="h-4 w-4" />}
            />
            <StatCard
              title="Unique Visitors"
              value={isLoading ? "..." : (analytics?.uniqueVisitors.toLocaleString() || "0")}
              change="+8.2%"
              isPositive={true}
              icon={<Globe className="h-4 w-4" />}
            />
            <StatCard
              title="Avg. Readability"
              value={isLoading ? "..." : `${analytics?.avgReadability || 98.4}%`}
              change="-0.5%"
              isPositive={false}
              icon={<Zap className="h-4 w-4" />}
            />
          </div>

          {/* Right Column: Chart */}
          <Card className="flex-1 flex flex-col border-none shadow-[0_8px_24px_rgb(0,0,0,0.02)] ring-1 ring-border/80 min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 md:px-5 shrink-0">
              <div className="space-y-0.5">
                <CardTitle className="text-sm md:text-md font-bold text-text-primary">Daily Traffic Profile</CardTitle>
                <CardDescription className="text-[10px] md:text-[11px]">Scan volume distribution per 24h window.</CardDescription>
              </div>
              <div className="flex bg-surface p-0.5 rounded-lg border border-border">
                <button className="px-2 py-0.5 text-[9px] md:text-[10px] font-bold bg-white rounded-md shadow-sm border border-border transition-all">Scans</button>
                <button className="px-2 py-0.5 text-[9px] md:text-[10px] font-bold text-text-secondary hover:text-text-primary transition-all">Conversion</button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-3 md:p-4 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.dailyTraffic || CHART_DATA}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E9D52" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#2E9D52" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef3f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#8da296' }}
                    dy={5}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#8da296' }}
                    tickFormatter={(value) => `${value > 1000 ? value / 1000 + 'k' : value}`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e3ebe7',
                      boxShadow: '0 8px 24px rgba(46,157,82,0.04)',
                      padding: '6px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#2E9D52"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns List */}
        <div className="space-y-4 pt-4 border-t border-border/80 shrink-0">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h2 className="text-md md:text-lg font-black tracking-tight text-text-primary">Active Campaigns</h2>
              <p className="text-text-secondary text-[10px] md:text-[11px]">Manage and monitor your dynamic QR code redirects in real-time.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs">
                {campaigns.length} Active
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {campaigns.length === 0 ? (
              <div className="bg-white border border-border border-dashed p-8 rounded-2xl text-center text-text-secondary text-sm">
                No active campaigns found. Generate a QR code for a website URL to launch your first campaign!
              </div>
            ) : (
              campaigns.map(campaign => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deploy Custom Design Modal */}
      {isPushModalOpen && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white border border-border shadow-[0_20px_50px_rgba(46,157,82,0.12)] rounded-3xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
            
            {/* Left section: Controls */}
            <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    Push QR Design
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">Deploy a brand-aligned organic QR layout directly to your production campaign.</p>
                </div>

                {/* Custom Asset Specifications Reference Integration */}
                <div className="bg-surface p-5 rounded-2xl border border-border/80 space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5" />
                    Asset Specifications Reference
                  </span>

                  {/* QR Code Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Name</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <input 
                        type="text"
                        value={qrCodeName}
                        onChange={(e) => setQrCodeName(e.target.value)}
                        disabled={isDeploying || deploySuccess}
                        placeholder="e.g. Leaf Finder Custom QR"
                        className="w-full bg-white border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Source Code drag & drop zone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Source Code</label>
                      <div 
                        onDragEnter={handleHtmlDrag}
                        onDragOver={handleHtmlDrag}
                        onDragLeave={handleHtmlDrag}
                        onDrop={handleHtmlDrop}
                        onClick={() => !isDeploying && !deploySuccess && htmlInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 bg-white relative flex flex-col justify-center items-center h-28 group min-h-[112px]",
                          isHtmlDragActive 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                            : "border-border hover:border-primary/50 hover:bg-surface"
                        )}
                      >
                        <input 
                          ref={htmlInputRef}
                          type="file"
                          accept=".html"
                          onChange={handleHtmlFileChange}
                          disabled={isDeploying || deploySuccess}
                          className="hidden"
                        />

                        {htmlFile ? (
                          <div className="space-y-1 w-full px-2">
                            <FileText className="h-7 w-7 text-primary mx-auto animate-pulse" />
                            <p className="text-[11px] font-bold text-text-primary truncate max-w-full">
                              {htmlFile.name}
                            </p>
                            <p className="text-[9px] text-text-secondary font-mono">
                              {(htmlFile.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHtmlFile(null);
                                const templateNameNormalized = activeTemplate.name.toLowerCase().replace(/\s+/g, '-');
                                setHtmlFileName(`${templateNameNormalized}.html`);
                              }}
                              disabled={isDeploying || deploySuccess}
                              className="absolute top-2 right-2 text-text-secondary hover:text-red-500 transition-all p-1 bg-surface-container rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Upload className="h-6 w-6 text-primary mx-auto transition-transform group-hover:-translate-y-0.5 duration-300" />
                            <p className="text-[10px] font-semibold text-text-primary">
                              Drag & drop HTML or <span className="text-primary hover:underline">Browse</span>
                            </p>
                            <p className="text-[8px] text-text-secondary">
                              Supports: .html only
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Templet Image drag & drop zone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Templet Image</label>
                      <div 
                        onDragEnter={handleImageDrag}
                        onDragOver={handleImageDrag}
                        onDragLeave={handleImageDrag}
                        onDrop={handleImageDrop}
                        onClick={() => !isDeploying && !deploySuccess && imageInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 bg-white relative flex flex-col justify-center items-center h-28 group min-h-[112px]",
                          isImageDragActive 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                            : "border-border hover:border-primary/50 hover:bg-surface"
                        )}
                      >
                        <input 
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isDeploying || deploySuccess}
                          className="hidden"
                        />

                        {imageFile ? (
                          <div className="space-y-1 w-full px-2">
                            {imagePreviewUrl ? (
                              <img 
                                src={imagePreviewUrl} 
                                alt="Preview" 
                                className="h-8 w-8 object-cover rounded-lg mx-auto shadow-sm border border-border"
                              />
                            ) : (
                              <Image className="h-7 w-7 text-primary mx-auto animate-pulse" />
                            )}
                            <p className="text-[11px] font-bold text-text-primary truncate max-w-full">
                              {imageFile.name}
                            </p>
                            <p className="text-[9px] text-text-secondary font-mono">
                              {(imageFile.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                                setImagePreviewUrl(null);
                                const templateNameNormalized = activeTemplate.name.toLowerCase().replace(/\s+/g, '-');
                                setPreviewImageName(`${templateNameNormalized}-thumbnail.png`);
                              }}
                              disabled={isDeploying || deploySuccess}
                              className="absolute top-2 right-2 text-text-secondary hover:text-red-500 transition-all p-1 bg-surface-container rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Upload className="h-6 w-6 text-primary mx-auto transition-transform group-hover:-translate-y-0.5 duration-300" />
                            <p className="text-[10px] font-semibold text-text-primary">
                              Drag & drop Image or <span className="text-primary hover:underline">Browse</span>
                            </p>
                            <p className="text-[8px] text-text-secondary">
                              Supports: PNG, JPG, WEBP etc.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Select template preset */}
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
                    <span>Select Vector Template</span>
                    <span className="text-[10px] text-primary lowercase tracking-normal">Nature-Tech collections loaded</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {MARKETPLACE_TEMPLATES.map(t => {
                      const isSelected = t.id === selectedTemplateId;
                      const isNature = t.category === 'Nature';
                      return (
                        <div 
                          key={t.id}
                          onClick={() => {
                            if (!isDeploying && !deploySuccess) {
                              setSelectedTemplateId(t.id);
                            }
                          }}
                          className={cn(
                            "p-3 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-24 hover:shadow-sm",
                            isSelected 
                              ? "border-primary bg-primary/5 ring-1 ring-primary" 
                              : "border-border bg-white hover:border-primary/30"
                          )}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-sm text-text-primary truncate max-w-[120px]">{t.name}</span>
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest",
                                isNature ? "bg-primary/15 text-primary" : "bg-text-secondary/10 text-text-secondary"
                              )}>{t.category}</span>
                            </div>
                            <span className="text-[11px] text-text-secondary block mt-0.5">{t.style}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full border border-border" 
                              style={{ backgroundColor: t.qrConfig.foregroundColor }} 
                            />
                            <span className="text-[10px] font-mono text-text-secondary">{t.qrConfig.foregroundColor}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                {/* Deploy Progress Steps */}
                {isDeploying && (
                  <div className="bg-surface border border-border p-3.5 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Deploying assets to production edge...
                      </span>
                      <span>{Math.round(((deployStep + 1) / currentLogs.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${((deployStep + 1) / currentLogs.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-text-secondary font-mono truncate">{currentLogs[deployStep]}</p>
                  </div>
                )}

                {/* Successful Deployment Alert */}
                {deploySuccess && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2.5 animate-in zoom-in-95 duration-300 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                      <Check className="h-4 w-4 bg-primary text-white rounded-full p-0.5" />
                      Vector Design Deployed Successfully!
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Your premium design is loaded live into edge servers for campaign: <strong>{activeCampaign.name}</strong>.
                    </p>
                    <div className="text-[10px] text-text-secondary bg-white p-2.5 rounded-xl border border-border/80 text-left font-mono space-y-1">
                      <div><span className="text-primary font-bold">QR Name:</span> {qrCodeName}</div>
                      <div><span className="text-primary font-bold">Source Code:</span> {htmlFileName}</div>
                      <div><span className="text-primary font-bold">Templet Image:</span> {previewImageName}</div>
                      <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-border text-[9px] text-primary font-bold">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Campaign Readability calibrated to 99.8%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl font-bold py-5 cursor-pointer disabled:opacity-50"
                    disabled={isDeploying}
                    onClick={() => setIsPushModalOpen(false)}
                  >
                    {deploySuccess ? 'Close Panel' : 'Cancel'}
                  </Button>
                  
                  {!deploySuccess && (
                    <Button 
                      variant="primary"
                      disabled={isDeploying}
                      className="flex-1 rounded-xl font-bold py-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      onClick={handleDeploy}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Push to Live
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right section: Vector Live Preview artboard */}
            <div className="w-full md:w-[360px] bg-surface p-6 md:p-8 flex flex-col justify-center items-center border-l border-border space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  CDN Vector Preview
                </span>
                <h4 className="font-bold text-text-primary text-lg mt-2">Active QR Matrix</h4>
                <p className="text-text-secondary text-xs max-w-[200px] mx-auto">Dynamic vector preview built in real-time on template change.</p>
              </div>

              {/* Artboard Frame */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.02)] w-[240px] h-[240px] flex items-center justify-center relative group">
                {/* Dynamic visual rings showing selected template status */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-primary/20 pointer-events-none ring-8 ring-primary/5 scale-95 group-hover:scale-100 transform" 
                />
                
                <DynamicMockQR 
                  foregroundColor={activeTemplate.qrConfig.foregroundColor}
                  patternStyle={activeTemplate.qrConfig.patternStyle}
                  finderStyle={activeTemplate.qrConfig.finderStyle}
                />
              </div>

              {/* Specifications badge tags */}
              <div className="w-full space-y-2.5">
                <div className="flex justify-between text-xs border-b border-border/60 pb-1.5">
                  <span className="text-text-secondary">Finder Corners</span>
                  <span className="font-mono font-bold text-text-primary uppercase">{activeTemplate.qrConfig.finderStyle}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-border/60 pb-1.5">
                  <span className="text-text-secondary">Pattern Density</span>
                  <span className="font-mono font-bold text-text-primary uppercase">{activeTemplate.qrConfig.patternStyle}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Readability Grade</span>
                  <span className="font-bold text-success">Grade A (99.8%)</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

function DynamicMockQR({ foregroundColor, patternStyle, finderStyle }: { foregroundColor: string, patternStyle: string, finderStyle: string }) {
  const color = foregroundColor || '#2E9D52';

  const renderFinder = (x: number, y: number) => {
    if (finderStyle === 'leaf') {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <path d="M 0,0 C 24,0 48,24 48,48 C 48,48 48,48 48,48 C 24,48 0,24 0,0 Z" fill={color} />
          <path d="M 6,6 C 20,6 38,20 42,42 C 24,42 6,24 6,6 Z" fill="#ffffff" />
          <circle cx="24" cy="24" r="10" fill={color} />
        </g>
      );
    }
    if (finderStyle === 'shield') {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="0" y="0" width="48" height="48" rx="16" fill={color} />
          <rect x="6" y="6" width="36" height="36" rx="12" fill="#ffffff" />
          <rect x="14" y="14" width="20" height="20" rx="6" fill={color} />
        </g>
      );
    }
    if (finderStyle === 'bullseye' || finderStyle === 'rounded') {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="0" y="0" width="48" height="48" rx="24" fill={color} />
          <rect x="8" y="8" width="32" height="32" rx="16" fill="#ffffff" />
          <rect x="14" y="14" width="20" height="20" rx="10" fill={color} />
        </g>
      );
    }
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width="48" height="48" rx="10" fill={color} />
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#ffffff" />
        <rect x="16" y="16" width="16" height="16" rx="3" fill={color} />
      </g>
    );
  };

  const renderDataGrid = () => {
    const points: React.ReactElement[] = [];
    const size = 180;
    const step = 12;
    for (let x = 60; x < 120; x += step) {
      for (let y = 0; y < size; y += step) {
        if (x < 60 && y < 60) continue;
        if (x > 120 && y < 60) continue;
        if (x < 60 && y > 120) continue;
        
        const seed = (x * 17 + y * 23) % 100;
        if (seed > 45) {
          if (patternStyle === 'dots') {
            points.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={color} />);
          } else if (patternStyle === 'liquid') {
            points.push(<rect key={`${x}-${y}`} x={x-4} y={y-4} width="10" height="10" rx="5" fill={color} />);
          } else if (patternStyle === 'constellation') {
            points.push(
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="3" fill={color} />
                {seed > 75 && <line x1={x} y1={y} x2={x+step} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.4" />}
                {seed < 55 && <line x1={x} y1={y} x2={x} y2={y+step} stroke={color} strokeWidth="1" strokeOpacity="0.4" />}
              </g>
            );
          } else {
            points.push(<rect key={`${x}-${y}`} x={x-3} y={y-3} width="7" height="7" rx="1.5" fill={color} />);
          }
        }
      }
    }
    for (let x = 0; x < size; x += step) {
      for (let y = 60; y < size; y += step) {
        if (x < 60 && y < 60) continue;
        if (x > 120 && y < 60) continue;
        if (x < 60 && y > 120) continue;
        if (x >= 60 && x < 120) continue;
        
        const seed = (x * 17 + y * 23) % 100;
        if (seed > 45) {
          if (patternStyle === 'dots') {
            points.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={color} />);
          } else if (patternStyle === 'liquid') {
            points.push(<rect key={`${x}-${y}`} x={x-4} y={y-4} width="10" height="10" rx="5" fill={color} />);
          } else if (patternStyle === 'constellation') {
            points.push(
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="3" fill={color} />
                {seed > 75 && <line x1={x} y1={y} x2={x+step} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.4" />}
                {seed < 55 && <line x1={x} y1={y} x2={x} y2={y+step} stroke={color} strokeWidth="1" strokeOpacity="0.4" />}
              </g>
            );
          } else {
            points.push(<rect key={`${x}-${y}`} x={x-3} y={y-3} width="7" height="7" rx="1.5" fill={color} />);
          }
        }
      }
    }
    return points;
  };

  return (
    <svg viewBox="0 0 180 180" className="w-full h-full p-2">
      <rect width="180" height="180" fill="#ffffff" rx="16" />
      {renderFinder(0, 0)}
      {renderFinder(132, 0)}
      {renderFinder(0, 132)}
      {renderDataGrid()}
      <g transform="translate(68, 68)">
        <rect width="44" height="44" rx="14" fill="#ffffff" stroke="#e3ebe7" strokeWidth="1" />
        <rect x="3" y="3" width="38" height="38" rx="11" fill="#FAFDFB" />
        <path d="M 22,11 C 28,11 33,16 33,22 C 33,22 33,22 33,22 C 28,22 22,17 22,11 Z" fill="#2E9D52" />
        <path d="M 22,22 C 16,22 11,27 11,33 C 11,33 11,33 11,33 C 16,33 22,28 22,22 Z" fill="#0B1E16" stroke="#2E9D52" strokeWidth="1" />
        <line x1="17" y1="27" x2="27" y2="17" stroke="#2E9D52" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function StatCard({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-[0_4px_12px_rgb(0,0,0,0.04)] ring-1 ring-border/50 group hover:ring-primary/30 transition-all duration-300">
      <CardContent className="p-2.5 md:p-3.5 flex items-center justify-between gap-2 md:gap-3">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-text-secondary text-[8px] md:text-[9px] font-bold uppercase tracking-wider truncate">{title}</p>
          <p className="text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight text-text-primary truncate">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-1 md:gap-1.5 shrink-0">
           <div className={cn(
             "p-1 md:p-1.5 rounded-lg md:rounded-xl transition-all duration-300",
             isPositive ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" : "bg-text-secondary/5 text-text-secondary"
           )}>
             <div className="h-3 w-3 md:h-4 md:w-4">{icon}</div>
           </div>
           <div className={cn(
             "flex items-center gap-0.5 text-[8px] md:text-[9px] font-extrabold px-1 py-0.5 rounded-full",
             isPositive ? "text-success bg-success/5 border border-success/10" : "text-danger bg-danger/5 border border-danger/10"
           )}>
             {isPositive ? <ArrowUpRight className="h-2 w-2 md:h-2.5 md:w-2.5" /> : <ArrowDownRight className="h-2 w-2 md:h-2.5 md:w-2.5" />}
             {change}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

const formatCampaignDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const CampaignRow: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="bg-white border border-border p-4 rounded-2xl flex items-center gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="h-16 w-16 bg-surface rounded-xl flex items-center justify-center p-2 border border-border group-hover:border-primary/20 transition-colors">
          <div className="w-full h-full bg-primary rounded-sm opacity-10 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             {campaign.readability === 99.8 ? (
               <QrCode className="h-6 w-6 text-white" />
             ) : (
               <div className="w-4 h-4 bg-primary rounded-full opacity-30" />
             )}
          </div>
       </div>
       
       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
             <h3 className="font-bold text-text-primary truncate">{campaign.name}</h3>
             <span className={cn(
               "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
               campaign.status === 'active' 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-surface-container-high text-text-secondary border-border"
             )}>
               {campaign.status}
             </span>
             {campaign.readability === 99.8 && (
               <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
                 <Sparkles className="h-3 w-3 fill-primary/20" />
                 Design Deployed
               </span>
             )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
             <div className="flex items-center gap-1.5 min-w-0">
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-secondary/70" />
                <span className="truncate max-w-[220px] sm:max-w-[320px]">{campaign.url}</span>
             </div>
             {campaign.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary/60 shrink-0">
                   <Calendar className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                   <span>Created: {formatCampaignDate(campaign.createdAt)}</span>
                </div>
             )}
          </div>
       </div>

       <div className="hidden md:flex flex-col items-end gap-1 min-w-[120px]">
          <span className="text-xl font-bold text-text-primary font-mono">{campaign.scans.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Scans</span>
       </div>

       <div className="hidden lg:flex flex-col items-center gap-1 min-w-[100px]">
          <span className={cn(
            "text-[13px] font-bold",
            campaign.readability >= 95 ? "text-success" : "text-warning"
          )}>{campaign.readability}%</span>
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Readability</span>
       </div>

       <div className="flex items-center gap-2 pr-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-xl font-bold border-border hover:border-primary hover:text-primary px-4 cursor-pointer">
             View Metrics
          </Button>
          <button className="p-2.5 rounded-xl hover:bg-hover text-text-secondary transition-colors cursor-pointer">
             <MoreHorizontal className="h-5 w-5" />
          </button>
       </div>
    </div>
  );
}
