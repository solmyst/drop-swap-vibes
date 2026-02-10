import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowLeft, AlertCircle, CheckCircle, MapPin } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";
import { supabase } from "@/integrations/supabase/client";
import AtmosphericLayer from "@/components/AtmosphericLayer";
import { indiaStates, indiaCities } from "@/data/indiaLocations";

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Check if we're in reset password mode from URL
  useEffect(() => {
    const checkRecoveryMode = async () => {
      // Check for recovery token in URL hash (Supabase format)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');
      
      // Also check query params as fallback
      const queryType = searchParams.get('type');
      const queryMode = searchParams.get('mode');
      
      console.log('Auth URL check:', { 
        type, 
        queryType, 
        queryMode,
        accessToken: !!accessToken, 
        error,
        errorCode,
        hash: window.location.hash 
      });
      
      // Handle errors from Supabase
      if (error || errorCode) {
        if (errorCode === 'otp_expired' || error === 'access_denied') {
          toast.error('Password reset link has expired. Please request a new one.');
          setMode('forgot-password');
        } else {
          toast.error(errorDescription || 'An error occurred. Please try again.');
        }
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      
      if (type === 'recovery' && accessToken) {
        console.log('Recovery mode detected, setting reset-password mode');
        setMode('reset-password');
        // Clear the hash to clean up URL but keep the session
        window.history.replaceState(null, '', window.location.pathname);
      } else if (queryType === 'recovery' || queryMode === 'reset-password') {
        console.log('Query param recovery mode detected');
        setMode('reset-password');
      }
    };
    
    checkRecoveryMode();
  }, [searchParams]);

  // Password validation
  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Username validation
  const validateUsername = (username: string) => {
    const minLength = username.length >= 3;
    const maxLength = username.length <= 20;
    const validChars = /^[a-zA-Z0-9_]+$/.test(username);
    
    return {
      minLength,
      maxLength,
      validChars,
      isValid: minLength && maxLength && validChars
    };
  };

  const passwordValidation = validatePassword(password);
  const usernameValidation = validateUsername(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!validateEmail(email)) {
          toast.error("Please enter a valid email address");
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          // Handle specific Supabase auth errors
          if (error.message.includes('Invalid login credentials')) {
            toast.error("Invalid email or password. Please check your credentials.");
          } else if (error.message.includes('Too many requests')) {
            toast.error("Too many login attempts. Please wait a few minutes and try again.");
          } else {
            toast.error("Login failed. Please try again.");
          }
          setLoading(false);
          return;
        }
        toast.success("Welcome back! 🎉");
        navigate("/");

      } else if (mode === 'signup') {
        // Validation checks
        if (!validateEmail(email)) {
          toast.error("Please enter a valid email address");
          setLoading(false);
          return;
        }

        if (!fullName.trim()) {
          toast.error("Please enter your full name");
          setLoading(false);
          return;
        }

        if (!usernameValidation.isValid) {
          if (!usernameValidation.minLength) {
            toast.error("Username must be at least 3 characters long");
          } else if (!usernameValidation.maxLength) {
            toast.error("Username must be less than 20 characters");
          } else if (!usernameValidation.validChars) {
            toast.error("Username can only contain letters, numbers, and underscores");
          }
          setLoading(false);
          return;
        }

        if (!state) {
          toast.error("Please select your state");
          setLoading(false);
          return;
        }

        if (!city) {
          toast.error("Please select your city");
          setLoading(false);
          return;
        }

        if (!passwordValidation.isValid) {
          toast.error("Password doesn't meet security requirements");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }

        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .single();

        if (existingUser) {
          toast.error("Username already taken. Please choose a different one.");
          setLoading(false);
          return;
        }

        const location = `${city}, ${state}`;
        const { error } = await signUp(email, password, username, fullName, location);
        if (error) {
          // Handle specific Supabase auth errors
          if (error.message.includes('User already registered')) {
            toast.error("An account with this email already exists. Try signing in instead.");
          } else if (error.message.includes('Password should be at least')) {
            toast.error("Password is too weak. Please use a stronger password.");
          } else if (error.message.includes('Unable to validate email address')) {
            toast.error("Invalid email address. Please check and try again.");
          } else {
            toast.error("Account creation failed. Please try again.");
          }
          setLoading(false);
          return;
        }
        
        // Email confirmation disabled - instant login
        toast.success("Account created successfully! Welcome to रीवस्त्र! 🎉");
        navigate("/");

      } else if (mode === 'forgot-password') {
        if (!validateEmail(email)) {
          toast.error("Please enter a valid email address");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast.error("Failed to send reset email. Please try again.");
        } else {
          toast.success("Password reset email sent! Check your inbox. 📧");
          setEmailSent(true);
        }

      } else if (mode === 'reset-password') {
        if (!passwordValidation.isValid) {
          toast.error("Password doesn't meet security requirements");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) {
          toast.error("Failed to reset password. Please try again or request a new reset link.");
          setLoading(false);
          return;
        }

        toast.success("Password reset successfully! You can now sign in with your new password. 🎉");
        setMode('login');
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const validation = validatePassword(password);
    
    if (!password) return null;

    return (
      <div className="mt-2 space-y-1">
        <div className="text-xs text-muted-foreground">Password requirements:</div>
        <div className="space-y-1">
          <div className={`flex items-center gap-2 text-xs ${validation.minLength ? 'text-green-600' : 'text-red-500'}`}>
            {validation.minLength ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            At least 8 characters
          </div>
          <div className={`flex items-center gap-2 text-xs ${validation.hasUpper ? 'text-green-600' : 'text-red-500'}`}>
            {validation.hasUpper ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            One uppercase letter
          </div>
          <div className={`flex items-center gap-2 text-xs ${validation.hasLower ? 'text-green-600' : 'text-red-500'}`}>
            {validation.hasLower ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            One lowercase letter
          </div>
          <div className={`flex items-center gap-2 text-xs ${validation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
            {validation.hasNumber ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            One number
          </div>
          <div className={`flex items-center gap-2 text-xs ${validation.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
            {validation.hasSpecial ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            One special character
          </div>
        </div>
      </div>
    );
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="glass rounded-3xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-6">
              {mode === 'signup' 
                ? "We've sent a confirmation link to your email. Please click it to activate your account."
                : "We've sent a password reset link to your email. Click it to reset your password."
              }
            </p>
            <Button
              onClick={() => {
                setEmailSent(false);
                setMode('login');
              }}
              variant="outline"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      {/* Atmospheric layer */}
      <AtmosphericLayer variant="minimal" />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${mode === 'signup' ? 'max-w-4xl' : 'max-w-md'} relative z-10`}
      >
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img 
              src={ASSETS.logo} 
              alt="रीवस्त्र Logo" 
              className="w-10 h-10"
            />
          </div>
          <span className="font-display font-bold text-xl">
            <span className="text-gradient">रीवस्त्र</span>
          </span>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold mb-2">
              {mode === 'login' && "Welcome back"}
              {mode === 'signup' && "Join the movement"}
              {mode === 'forgot-password' && "Reset password"}
              {mode === 'reset-password' && "Create new password"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'login' && "Sign in to continue thrifting"}
              {mode === 'signup' && "Start your sustainable fashion journey"}
              {mode === 'forgot-password' && "Enter your email to reset your password"}
              {mode === 'reset-password' && "Enter your new password below"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="grid md:grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-10 pl-10 bg-muted border-0 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="reevastra_user"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="h-10 pl-10 bg-muted border-0 rounded-xl text-sm"
                        required
                      />
                    </div>
                    {username && !usernameValidation.isValid && (
                      <div className="text-xs text-red-500">
                        {!usernameValidation.minLength && "Min 3 characters"}
                        {!usernameValidation.maxLength && "Max 20 characters"}
                        {!usernameValidation.validChars && "Letters, numbers, _ only"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm">State</Label>
                    <Select value={state} onValueChange={(value) => { setState(value); setCity(""); }}>
                      <SelectTrigger className="h-10 bg-muted border-0 rounded-xl text-sm">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indiaStates.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <Select value={city} onValueChange={setCity} disabled={!state}>
                      <SelectTrigger className="h-10 bg-muted border-0 rounded-xl text-sm">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {state && indiaCities[state]?.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 pl-10 bg-muted border-0 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pl-10 pr-10 bg-muted border-0 rounded-xl text-sm"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 pl-10 pr-10 bg-muted border-0 rounded-xl text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <div className="text-xs text-red-500">Passwords don't match</div>
                    )}
                  </div>

                  {password && (
                    <div className="text-xs space-y-1">
                      <div className={passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ 8+ characters
                      </div>
                      <div className={passwordValidation.hasUpper && passwordValidation.hasLower ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Upper & lowercase
                      </div>
                      <div className={passwordValidation.hasNumber && passwordValidation.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Number & special char
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode !== 'signup' && (
              <>
                {mode === 'forgot-password' && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 pl-10 bg-muted border-0 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 pl-10 bg-muted border-0 rounded-xl text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10 pl-10 pr-10 bg-muted border-0 rounded-xl text-sm"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {mode === 'reset-password' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10 pl-10 pr-10 bg-muted border-0 rounded-xl text-sm"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-10 pl-10 pr-10 bg-muted border-0 rounded-xl text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <div className="text-xs text-red-500">Passwords don't match</div>
                      )}
                    </div>

                    <PasswordStrengthIndicator password={password} />
                  </>
                )}
              </>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {mode === 'login' && "Sign In"}
                  {mode === 'signup' && "Create Account"}
                  {mode === 'forgot-password' && "Send Reset Email"}
                  {mode === 'reset-password' && "Reset Password"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === 'login' && (
              <p className="text-muted-foreground">
                New to रीवस्त्र?{" "}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot-password' && (
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset-password' && (
              <p className="text-muted-foreground">
                Password reset successful?{" "}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in now
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
