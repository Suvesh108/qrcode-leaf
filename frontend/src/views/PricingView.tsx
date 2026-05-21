import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Heart, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Smile, 
  Globe,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function PricingView() {
  const navigate = useNavigate();

  const freeFeatures = [
    'Unlimited dynamic & static QR generation',
    'Full access to all 13+ premium brand templates',
    'Custom linear and radial multi-stop gradients',
    'Circular, rounded, dot, liquid, and column modules',
    'Custom branding logo center overlays',
    'Real-time scan decodability validation',
    'High-resolution exports (PNG, Lossless SVG, PDF)',
    'Precision grid overlays and dark mode artboard guides',
    'Full campaign analytics and scan metrics dashboards'
  ];

  // Motion variants for stagger reveal of features list
  const listContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 } as const
    }
  };

  // Motion variants for staggered ethos cards reveal
  const ethosContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const ethosItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 15 } as const
    }
  };

  return (
    <div className="min-h-screen bg-background relative pb-24 overflow-hidden">
      {/* Organic ambient background grid lines & glowing circles */}
      <div className="absolute inset-0 bg-organic-grid pointer-events-none opacity-40" />
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      {/* ─────────────── HEADER ─────────────── */}
      <div className="relative pt-20 pb-16 text-center space-y-6">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mx-auto w-fit border border-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5 fill-primary" />
            Pricing Plans
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight"
          >
            Completely <span className="text-primary font-black">Free</span>. Forever.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed"
          >
            No credit cards, no premium subscription limits, and no hidden charges. Every single professional QR design feature is open and free to everyone.
          </motion.p>
        </div>
      </div>

      {/* ─────────────── PRICING CARD ─────────────── */}
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Slowly rotating glowing ambient gradient aura */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            className="absolute -inset-10 rounded-[48px] bg-gradient-to-tr from-primary/25 via-emerald-500/15 to-primary/25 opacity-75 blur-3xl"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.05, 0.95, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-[32px] border border-primary/20 shadow-[0_24px_64px_rgba(46,157,82,0.06)] overflow-hidden relative"
        >
          {/* Top banner tag */}
          <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-primary/20 px-6 py-2 rounded-bl-2xl text-xs font-black uppercase tracking-wider">
            Active Forever
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Plan Card Body */}
            <div className="p-8 md:p-12 md:col-span-3 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-primary">All-Inclusive Plan</span>
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">QR Code Leaf Studio</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Get full enterprise-level capabilities to create, customize, organize, and monitor dynamic scan metrics.
                </p>
              </div>

              <div className="border-t border-border/50 my-6" />

              <div className="space-y-3.5">
                <span className="text-xs font-black uppercase tracking-widest text-text-secondary">What's Included:</span>
                <motion.ul 
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-3"
                >
                  {freeFeatures.map((f, i) => (
                    <motion.li 
                      key={i} 
                      variants={listItemVariants}
                      className="flex items-start gap-3 text-sm text-text-secondary"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-normal">{f}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>

            {/* Plan Card Side (Action) */}
            <div className="p-8 md:p-12 md:col-span-2 bg-surface-container-low border-t md:border-t-0 md:border-l border-border/60 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Monthly Cost</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl md:text-6xl font-black text-text-primary tracking-tight">$0</span>
                  <span className="text-sm font-semibold text-text-secondary">/ forever</span>
                </div>
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex gap-3">
                  <Smile className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary font-medium leading-relaxed">
                    Enjoy unrestricted visual building, custom template layouts, overlays, and detailed analytics dashboards.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  asChild
                  size="lg" 
                  className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 cursor-pointer"
                >
                  <motion.button 
                    whileHover="hover"
                    onClick={() => navigate('/generator')}
                  >
                    Start Building Now
                    <motion.span
                      variants={{
                        hover: { x: 5 }
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="inline-flex shrink-0"
                    >
                      <ArrowRight className="h-4.5 w-4.5 ml-2" />
                    </motion.span>
                  </motion.button>
                </Button>
                <p className="text-[11px] text-center text-text-secondary font-medium">
                  No sign-up forms or credit cards required.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─────────────── ETHOS & VALUES GRID ─────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-24">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-extrabold text-text-primary">Why is it completely free?</h3>
          <p className="text-sm text-text-secondary mt-2">We designed QR Code Leaf with an open-source, community-first startup ethos.</p>
        </div>

        <motion.div 
          variants={ethosContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={ethosItemVariants}
            className="bg-white rounded-2xl border border-border/70 p-6 space-y-4 hover:shadow-xl hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-bold text-text-primary text-base">Community Hearted</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              We believe creators, designers, and sustainable modern startup brands deserve to build beautiful, customizable identity products without paywall locks.
            </p>
          </motion.div>

          <motion.div
            variants={ethosItemVariants}
            className="bg-white rounded-2xl border border-border/70 p-6 space-y-4 hover:shadow-xl hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-bold text-text-primary text-base">Data Privacy & Security</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Static campaigns process data ambiently and dynamic ones are strictly indexed. Zero tracking, zero ad cookies, and absolute data trust.
            </p>
          </motion.div>

          <motion.div
            variants={ethosItemVariants}
            className="bg-white rounded-2xl border border-border/70 p-6 space-y-4 hover:shadow-xl hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-bold text-text-primary text-base">Green Tech Initiative</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Supporting sustainable technology ecosystems. Eco-friendly branding templates engineered with carbon-efficient backend validations.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
