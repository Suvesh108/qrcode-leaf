import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  const checkAuth = () => {
    const userStr = localStorage.getItem('leafqr_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user?.name || 'User');
        setIsAdmin(user?.role === 'admin');
      } catch (e) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // Listen for storage events (e.g. from other tabs or local state updates)
    window.addEventListener('storage', checkAuth);
    // Add custom listener for local navigation/route changes in SPA
    window.addEventListener('popstate', checkAuth);
    
    // Create an interval to poll for changes in auth status to keep UI immediately synced
    const authInterval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('popstate', checkAuth);
      clearInterval(authInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('leafqr_user');
    localStorage.removeItem('leafqr_token');
    setIsAdmin(false);
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background relative overflow-hidden ${isAuthPage ? 'h-screen max-h-screen' : ''}`}>
      {/* Organic ambient background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_2px_20px_0_rgba(46,157,82,0.02)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img src="/icons/qrcodeleaf%20logo.svg" alt="QR Code Leaf Logo" className="h-[55px] w-[55px] object-contain relative" />
            </div>
            <span className="font-sans text-xl font-extrabold text-text-primary tracking-tight group-hover:text-primary transition-colors duration-300">
              QR Code <span className="text-primary font-black">Leaf</span>
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/generator" className={({ isActive }) => `text-sm font-semibold tracking-wide transition-all ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary hover:-translate-y-[1px]'}`}>QR Builder</NavLink>
            <NavLink to="/docs" className={({ isActive }) => `text-sm font-semibold tracking-wide transition-all ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary hover:-translate-y-[1px]'}`}>Features</NavLink>
            <NavLink to="/pricing" className={({ isActive }) => `text-sm font-semibold tracking-wide transition-all ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary hover:-translate-y-[1px]'}`}>Pricing</NavLink>
            {isAdmin && (
              <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-semibold tracking-wide transition-all ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary hover:-translate-y-[1px]'}`}>Dashboard</NavLink>
            )}
          </div>

          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <span className="text-sm font-semibold text-text-secondary hidden sm:inline-block">Hi, {userName}</span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors duration-300"
                >
                  Log In
                </button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 rounded-xl"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`flex-1 pt-20 ${isAuthPage ? 'flex items-center justify-center overflow-hidden' : ''}`}>
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
      </div>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="bg-primary-container text-white/90 border-t border-primary/10 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-organic-grid" />
          <div className="absolute top-0 left-[20%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
            <div className="flex flex-col gap-5 max-w-sm">
               <div className="flex items-center gap-2">
                <img src="/icons/qrcodeleaf%20logo.svg" alt="QR Code Leaf Logo" className="h-[60px] w-[60px] object-contain brightness-110 filter" />
                <span className="font-sans text-xl font-bold tracking-tight text-white">
                  QR Code <span className="text-primary font-black">Leaf</span>
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Enterprise-grade nature-inspired QR code generation and management platform for modern, green-thinking brands.
              </p>
            </div>
            
            <div className="flex gap-16 font-medium">
               <div className="flex flex-col gap-4">
                <div className="text-xs text-primary font-black uppercase tracking-widest mb-1">Company</div>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">About Us</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Features</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Pricing</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Blog</NavLink>
              </div>
              
               <div className="flex flex-col gap-4">
                <div className="text-xs text-primary font-black uppercase tracking-widest mb-1">Resources</div>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Developer API</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Help Center</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">Security</NavLink>
                <NavLink to="#" className="text-sm text-text-secondary hover:text-white transition-colors">System Status</NavLink>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 text-sm text-text-secondary w-full md:w-auto">
               <div className="flex gap-6 mb-2">
                 <NavLink to="#" className="hover:text-primary transition-colors">Privacy Policy</NavLink>
                 <NavLink to="#" className="hover:text-primary transition-colors">Terms of Service</NavLink>
               </div>
               <div>
                © 2026 QR Code Leaf. All rights reserved.
               </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
