import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BrandingPanel } from "@/components/auth/BrandingPanel";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCapsLock } from "@/hooks/use-caps-lock";
import { loginSchema } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const caps = useCapsLock();
  const navigate = useNavigate();

  const validateField = (field: "email" | "password", value: string) => {
    const result = loginSchema.safeParse({
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
    });
    if (result.success) {
      setErrors((e) => ({ ...e, [field]: undefined }));
      return;
    }
    const issue = result.error.issues.find((i) => i.path[0] === field);
    setErrors((e) => ({ ...e, [field]: issue?.message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const next: typeof errors = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0] as "email" | "password";
        if (!next[k]) next[k] = i.message;
      });
      setErrors(next);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="flex flex-col h-[100svh] overflow-hidden bg-background">
      <header aria-hidden="true" className="h-0 shrink-0" />
      <main className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        <BrandingPanel variant="desktop" />
        <BrandingPanel variant="mobile" />

        {/* Right: Login Form */}
        <section className="relative flex items-start lg:items-center justify-center px-5 py-8 sm:px-8 lg:p-16 overflow-y-auto">
          <ThemeToggle className="absolute top-4 right-4 z-10" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="w-full max-w-md space-y-6 lg:space-y-8"
          >
            <div className="space-y-2 hidden lg:block">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue.</p>
            </div>

            <Card className="p-5 sm:p-6 border-border/60 shadow-elegant transition-shadow hover:shadow-glow">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validateField("email", e.target.value);
                    }}
                    onBlur={(e) => validateField("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={cn(
                      "h-11",
                      errors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot?
                    </a>
                  </div>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    onKeyDown={caps.onKey}
                    onKeyUp={caps.onKey}
                    invalid={!!errors.password}
                    className="h-11"
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {caps.capsOn && (
                    <p className="text-xs text-dost-red bg-dost-red/10 border border-dost-red/20 rounded px-2 py-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Caps Lock is on
                    </p>
                  )}
                  {errors.password && (
                    <p id="password-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full group h-11 bg-gradient-primary text-primary-foreground hover:opacity-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-dost-red hover:underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </section>
      </main>
      <footer aria-hidden="true" className="h-0 shrink-0" />
    </div>
  );
};

export default LandingPage;
