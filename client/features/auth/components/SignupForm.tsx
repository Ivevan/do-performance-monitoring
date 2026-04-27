import { useMemo, useState } from "react";
import { ArrowRight, Loader2, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useCapsLock } from "@/hooks/use-caps-lock";
import { signupSchema, scorePassword } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

export const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const capsPw = useCapsLock();
  const capsConfirm = useCapsLock();

  const strength = useMemo(() => scorePassword(password), [password]);
  const matches = confirmPassword.length > 0 && confirmPassword === password;

  const values = { fullName, email, password, confirmPassword };

  const validateField = (field: keyof Errors, value: string) => {
    const next = { ...values, [field]: value };
    const result = signupSchema.safeParse(next);
    if (result.success) {
      setErrors((e) => ({ ...e, [field]: undefined }));
      return;
    }
    const issue = result.error.issues.find((i) => i.path[0] === field);
    setErrors((e) => ({ ...e, [field]: issue?.message }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(values);
    if (!result.success) {
      const next: Errors = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0] as keyof Errors;
        if (!next[k]) next[k] = i.message;
      });
      setErrors(next);
      return;
    }
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 800);
  };

  return (
    <Card className="p-4 sm:p-6 border-border/60 shadow-elegant transition-shadow hover:shadow-glow">
      <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) validateField("fullName", e.target.value);
            }}
            onBlur={(e) => validateField("fullName", e.target.value)}
            aria-invalid={!!errors.fullName}
            className={cn(
              "h-10",
              errors.fullName && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
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
            className={cn(
              "h-10",
              errors.email && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) validateField("password", e.target.value);
            }}
            onBlur={(e) => validateField("password", e.target.value)}
            onKeyDown={capsPw.onKey}
            onKeyUp={capsPw.onKey}
            invalid={!!errors.password}
          />

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full bg-muted transition-colors",
                      i < strength.score && strength.colorClass
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Strength:{" "}
                <span className="font-medium text-foreground">{strength.label}</span>
              </p>
            </div>
          )}

          {capsPw.capsOn && (
            <p className="text-xs text-dost-red bg-dost-red/10 border border-dost-red/20 rounded px-2 py-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Caps Lock is on
            </p>
          )}
          {errors.password && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) validateField("confirmPassword", e.target.value);
            }}
            onBlur={(e) => validateField("confirmPassword", e.target.value)}
            onKeyDown={capsConfirm.onKey}
            onKeyUp={capsConfirm.onKey}
            invalid={!!errors.confirmPassword}
          />
          {confirmPassword.length > 0 && (
            <p
              className={cn(
                "text-xs flex items-center gap-1",
                matches ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}
            >
              {matches ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {matches ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
          {capsConfirm.capsOn && !capsPw.capsOn && (
            <p className="text-xs text-dost-red bg-dost-red/10 border border-dost-red/20 rounded px-2 py-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Caps Lock is on
            </p>
          )}
          {errors.confirmPassword && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full group h-10 bg-gradient-primary text-primary-foreground hover:opacity-95"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
