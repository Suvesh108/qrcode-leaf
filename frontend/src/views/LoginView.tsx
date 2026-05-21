import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Chrome,
  Github
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate. Please check your credentials.');
      }

      if (data.token) {
        localStorage.setItem('leafqr_token', data.token);
        localStorage.setItem('leafqr_user', JSON.stringify(data.user));
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/generator'), 1200);
    } catch (err) {
      setIsLoading(false);
      const isConnectionError =
        err instanceof TypeError ||
        (err instanceof Error && err.message.toLowerCase().includes('failed to fetch'));
      if (isConnectionError) {
        setError('The LeafQR backend server is currently offline. Please ensure the backend is running to authenticate.');
      } else {
        setError(err instanceof Error ? err.message : 'A connection error occurred. Please try again.');
      }
    }
  };

  const handleSSOLogin = async (provider: 'Google' | 'GitHub') => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error();

      setIsLoading(false);
      setIsSuccess(true);
      localStorage.setItem('leafqr_token', `session_token_leafqr_sso_${provider.toLowerCase()}_2026`);
      localStorage.setItem('leafqr_user', JSON.stringify({
        name: `${provider} Creator`,
        email: `creator@${provider.toLowerCase()}.com`,
        role: 'user'
      }));
      setTimeout(() => navigate('/generator'), 1200);
    } catch {
      setIsLoading(false);
      setError('The LeafQR backend server is currently offline. Please ensure the backend is running to authenticate.');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative p-4">
      {/* Ambient glow */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-white rounded-3xl border border-border/60 shadow-[0_24px_60px_rgba(46,157,82,0.06)] p-8 relative overflow-hidden"
      >
        {/* Success overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4"
              >
                <Check className="h-8 w-8 stroke-[2.5]" />
              </motion.div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Welcome Back!</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Authentication successful. Preparing your workspace…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo + heading */}
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mx-auto">
            <img src="/icons/qrcodeleaf%20logo.svg" alt="QR Code Leaf Logo" className="h-10 w-10 object-contain" />
            <span className="font-sans text-lg font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">
              QR Code <span className="text-primary font-extrabold">Leaf</span>
            </span>
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Welcome back</h2>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Sign in to manage your branded QR campaigns.
            </p>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5 p-3 bg-danger/5 border border-danger/20 rounded-xl flex items-start gap-2.5 text-sm text-danger font-medium leading-normal"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-4 bg-surface rounded-xl border border-border/80 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/8 transition-all disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">
                Password
              </label>
              <Link to="#" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-10 bg-surface rounded-xl border border-border/80 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/8 transition-all disabled:opacity-50 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <label htmlFor="remember" className="text-xs font-semibold text-text-secondary select-none cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-sm font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/15 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in…</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              or continue with
            </span>
          </div>
        </div>

        {/* SSO buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSSOLogin('Google')}
            disabled={isLoading}
            className="h-11 border border-border/70 bg-surface hover:bg-hover rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-text-primary transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Chrome className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSSOLogin('GitHub')}
            disabled={isLoading}
            className="h-11 border border-border/70 bg-surface hover:bg-hover rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-text-primary transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-text-secondary mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Create one for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
