import { Search, Sparkles, Layers, ChevronRight, Info, Tag, Scan } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useTemplates } from '../TemplateContext';
import { Template } from '../types';
import { cn } from '../lib/utils';

export default function TemplatesView() {
  const navigate = useNavigate();
  const { templates, isLoading } = useTemplates();

  const handleSelect = (template: Template) => {
    navigate('/generator', { state: { template } });
  };

  // Motion variants for stagger reveal of grid items
  const gridContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-10">
           <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-primary bg-primary/10 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                 <Sparkles className="h-3 w-3 fill-primary" />
                 Marketplace
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-text-primary">QR Design Templates</h1>
               <p className="text-text-secondary text-lg leading-relaxed">
                 Choose from professionally crafted designs for your brand.
               </p>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                 <input 
                  type="text" 
                  placeholder="Search templates..." 
                  className="w-full md:w-72 bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                 />
              </div>
           </div>
        </div>

        {/* Grid Section */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Layers className="h-6 w-6 text-primary" />
                Featured Styles
              </h3>
              <button className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                 View All Style Guidelines
                 <ChevronRight className="h-4 w-4" />
              </button>
           </div>

         <motion.div 
            variants={gridContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {isLoading ? (
              <div className="col-span-4 flex items-center justify-center py-20 text-text-secondary">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading templates...</span>
                </div>
              </div>
            ) : (
              templates.map((template) => (
                <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
              ))
            )}
         </motion.div>
        </div>
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 } as const
  }
};

const overlayVariants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  hover: { 
    opacity: 1, 
    backdropFilter: 'blur(4px)',
    transition: { duration: 0.3 }
  }
};

const buttonGroupVariants = {
  initial: { opacity: 0, y: 15 },
  hover: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 15 } as const
  }
};

const TemplateCard: React.FC<{ template: Template; onSelect: (t: Template) => void }> = ({ template, onSelect }) => {
  return (
    <motion.div 
      variants={cardVariants}
      className="border-none shadow-none group bg-transparent cursor-pointer"
    >
      <Card className="border-none shadow-none group bg-transparent">
         <CardContent className="p-0 space-y-4">
            <motion.div 
              whileHover="hover"
              initial="initial"
              className="aspect-[4/5] rounded-2xl overflow-hidden relative border border-border bg-white shadow-sm ring-1 ring-transparent group-hover:ring-primary/20 transition-all duration-300"
            >
               {template.image ? (
                 <motion.img 
                   src={template.image} 
                   alt={template.name} 
                   variants={{
                     initial: { scale: 1 },
                     hover: { scale: 1.08, transition: { duration: 0.4 } }
                   }}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low transition-colors group-hover:bg-surface-container-high">
                   <div className="w-16 h-16 bg-white rounded-2xl border border-border flex items-center justify-center mb-3 group-hover:border-primary/20 transition-colors shadow-sm">
                     <Scan className="h-8 w-8 text-text-secondary/30 group-hover:text-primary/40 transition-colors" />
                   </div>
                   <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Coming Soon</span>
                 </div>
               )}
               
               <motion.div 
                 variants={overlayVariants}
                 className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
               >
                  <motion.div 
                    variants={buttonGroupVariants}
                    className="flex items-center gap-3"
                  >
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="rounded-full px-6 font-bold hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(template);
                        }}
                      >
                         Select
                     </Button>
                     <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full bg-white/20 border-white/40 text-white backdrop-blur-md hover:bg-white/30 hover:scale-105 transition-all"
                     >
                        <Info className="h-4 w-4" />
                     </Button>
                  </motion.div>
               </motion.div>
               
               <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-border/50 text-[10px] font-bold text-text-primary uppercase tracking-widest shadow-sm">
                  NEW RELEASE
               </div>
            </motion.div>
            
            <div className="space-y-1.5 px-1">
               <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">{template.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary font-semibold">
                     <Tag className="h-3 w-3" />
                     Premium
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-text-secondary">{template.style}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[12px] font-mono font-medium text-primary/80">8.2k Uses</span>
               </div>
            </div>
         </CardContent>
      </Card>
    </motion.div>
  );
}
