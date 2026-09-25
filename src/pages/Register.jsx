import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Lock,
  Loader2,
  MailCheck,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const returnTo = safeReturnTo();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = returnTo;
    }
  }, [isAuthenticated, returnTo]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.register({
        email,
        password,
        redirectTo: returnTo,
      });

      // If email confirmation is disabled in Supabase, user is immediately logged in
      if (result?.session) {
        window.location.href = returnTo;
        return;
      }

      setEmailSent(true);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError("");
    setResendLoading(true);
    try {
      await api.auth.resendOtp(email, returnTo);
      setResendCooldown(60);
      toast({
        title: "Verification link sent",
        description: `We've resent the verification link to ${email}.`,
      });
    } catch (err) {
      setError(err.message || "Failed to resend verification link");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await api.auth.loginWithProvider("google", returnTo);
    } catch (err) {
      setError(err.message || "Failed to initiate Google sign in");
      setGoogleLoading(false);
    }
  };

  const getEmailProviderInfo = (userEmail) => {
    const domain = userEmail?.split("@")[1]?.toLowerCase();
    if (!domain) return null;
    if (domain === "gmail.com") {
      return { name: "Gmail", url: "https://mail.google.com" };
    }
    if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain)) {
      return { name: "Outlook", url: "https://outlook.live.com" };
    }
    if (domain === "yahoo.com" || domain === "ymail.com") {
      return { name: "Yahoo Mail", url: "https://mail.yahoo.com" };
    }
    if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
      return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
    }
    return null;
  };

  if (emailSent) {
    const emailProvider = getEmailProviderInfo(email);

    return (
      <AuthLayout
        icon={MailCheck}
        title="Verify your email"
        subtitle="We sent a verification link to your email"
        footer={
          <>
            Already verified?{" "}
            <Link
              to={
                "/login" +
                (returnTo !== "/"
                  ? "?returnTo=" + encodeURIComponent(returnTo)
                  : "")
              }
              className="text-primary font-medium hover:underline"
            >
              Log in
            </Link>
          </>
        }
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-muted/60 border border-border/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs text-muted-foreground font-medium">
                Verification link sent to
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {email}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Click the link in the email to activate your account and access your Drivo profile.
          </p>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5 text-left">
            <span className="text-sm select-none">💡</span>
            <p className="leading-relaxed">
              Can't find the email? Check your <strong>Spam</strong> or{" "}
              <strong>Junk</strong> folder. It usually arrives within a minute.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {emailProvider && (
              <Button
                asChild
                className="w-full h-12 font-medium shadow-sm"
              >
                <a
                  href={emailProvider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open {emailProvider.name}
                </a>
              </Button>
            )}

            <Button
              type="button"
              variant={emailProvider ? "outline" : "default"}
              className="w-full h-12 font-medium"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending new link...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 opacity-50" />
                  Resend link in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend verification link
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setError("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Entered the wrong email? Change it
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={
              "/login" +
              (returnTo !== "/"
                ? "?returnTo=" + encodeURIComponent(returnTo)
                : "")
            }
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
      >
        {googleLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <GoogleIcon className="w-5 h-5 mr-2" />
        )}
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
