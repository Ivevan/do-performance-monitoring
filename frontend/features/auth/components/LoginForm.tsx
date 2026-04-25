import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useCapsLock } from "@/hooks/use-caps-lock";
import { loginSchema } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export const LoginForm = () => {
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
  );
};
