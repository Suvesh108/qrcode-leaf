import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Chrome,
  Github,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function SignupView() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password requirements calculation
  const hasEightChars = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
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
      setError('Please set a secure password.');
      return;
    }
    if (!hasEightChars || !hasLetter || !hasNumber) {
      setError('Please satisfy all password complexity rules.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create your account. Please try again.');
      }

      // Save user session details
      if (data.token) {
        localStorage.setItem('leafqr_token', data.token);
        localStorage.setItem('leafqr_user', JSON.stringify(data.user));
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/generator');
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      // Determine if network connection failed (e.g., backend server down)
      const isConnectionError = err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('failed to fetch'));
      if (isConnectionError) {
        setError('The LeafQR backend server is currently offline. Please ensure the backend is running to authenticate.');
      } else {
        setError(err instanceof Error ? err.message : 'A connection error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-background px-6 relative py-12">
      {/* Ambient background glowing circles */}
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] bg-white rounded-3xl border border-border/70 shadow-[0_20px_50px_rgba(46,157,82,0.04)] p-8 md:p-10 relative overflow-hidden"
      >
        {/* Onboarding success animation overlay */}
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
                <Check className="h-8 w-8 stroke-[3]" />
              </motion.div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Account Created!</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed max-w-sm">
                Welcome aboard! Setting up your dynamic vector dashboard and styling toolboxes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mx-auto">
            <img src="/icons/qrcodeleaf%20logo.svg" alt="QR Code Leaf Logo" className="h-10 w-10 object-contain" />
            <span className="font-sans text-lg font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">
              QR Code <span className="text-primary font-extrabold">Leaf</span>
            </span>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Create Free Account</h2>
            <p className="text-xs text-text-secondary leading-normal">
              100% Free. No credit cards required, active forever.
            </p>
          </div>
        </div>

        {/* Validation Errors */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-danger/5 border border-danger/20 rounded-xl flex items-start gap-3 text-xs text-danger font-medium leading-relaxed"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name input field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <User className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Suvesh"
                disabled={isLoading}
                className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-border/80 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          {/* Email input field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-border/80 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block">Set Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                disabled={isLoading}
                className="w-full h-11 pl-11 pr-11 bg-surface rounded-xl border border-border/80 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-50 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Micro-interaction password validation indicators */}
            <div className="pt-1.5 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                {hasEightChars ? (
                  <Check className="h-3.5 w-3.5 text-primary stroke-[3.5]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-text-secondary/40 stroke-[3.5]" />
                )}
                <span className={hasEightChars ? 'text-primary' : 'text-text-secondary'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                {hasLetter && hasNumber ? (
                  <Check className="h-3.5 w-3.5 text-primary stroke-[3.5]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-text-secondary/40 stroke-[3.5]" />
                )}
                <span className={hasLetter && hasNumber ? 'text-primary' : 'text-text-secondary'}>Contains both letters & numbers</span>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary shrink-0 mt-0.5"
            />
            <label htmlFor="terms" className="text-xs font-semibold text-text-secondary select-none cursor-pointer leading-normal">
              I agree to the{' '}
              <Link to="#" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-sm font-bold rounded-xl shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating credentials...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <span>Create Free Account</span>
                <ArrowRight className="h-4.5 w-4.5 ml-1" />
              </div>
            )}
          </Button>
        </form>

        {/* SSO division line */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-text-secondary"><span className="bg-white px-3">or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(true);
                setTimeout(() => navigate('/generator'), 1200);
              }, 1200);
            }}
            className="h-10 border border-border/70 bg-surface hover:bg-hover rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text-primary transition-all hover:-translate-y-0.5"
          >
            <Chrome className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(true);
                setTimeout(() => navigate('/generator'), 1200);
              }, 1200);
            }}
            className="h-10 border border-border/70 bg-surface hover:bg-hover rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text-primary transition-all hover:-translate-y-0.5"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        {/* Link back to Login */}
        <div className="text-center text-xs text-text-secondary mt-8 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log In here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
