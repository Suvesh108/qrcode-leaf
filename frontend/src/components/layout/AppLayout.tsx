import { 
  Plus, 
  LayoutDashboard, 
  QrCode, 
  FolderOpen, 
  HelpCircle, 
  Code2,
  ChevronRight
} from 'lucide-react';
import React from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = () => {
      const userStr = localStorage.getItem('leafqr_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user?.role === 'admin');
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  const navItems = [
    ...(isAdmin ? [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] : []),
    { name: 'Generator', icon: QrCode, path: '/generator' },
    { name: 'Collections', icon: FolderOpen, path: '/collections' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation */}
      <header className="h-20 border-b border-border/40 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 shadow-[0_2px_15px_0_rgba(46,157,82,0.02)]">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/10 blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img src="/icons/qrcodeleaf%20logo.svg" alt="LeafQR Logo" className="h-[55px] w-[55px] object-contain relative" />
            </div>
            <h1 className="font-sans text-lg font-bold tracking-tight text-text-primary hidden md:block group-hover:text-primary transition-colors">
                QR Code <span className="text-primary font-black">Leaf</span> Pro
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 justify-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-[0.5px]",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[0_2px_10px_0_rgba(46,157,82,0.04)]" 
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <Button 
            variant="primary"
            size="sm"
            className="hidden sm:flex gap-2 rounded-xl shadow-md shadow-primary/5 hover:shadow-primary/15 hover:-translate-y-[0.5px] transition-all" 
            onClick={() => navigate('/generator')}
          >
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
