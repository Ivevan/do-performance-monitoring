import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.warn("Passwords do not match");
      return;
    }
    console.log("Signup submitted:", { fullName, email });
  };

  return (
    <div className="flex flex-col h-[100svh] overflow-hidden bg-background">
      <header aria-hidden="true" className="h-0 shrink-0" />
      <main className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* Left: Branding (desktop only) — identical to LandingPage */}
        <section className="hidden lg:flex relative overflow-hidden bg-dost-blue text-dost-blue-foreground p-16 items-center justify-center">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-dost-yellow blur-3xl" />
            <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-dost-red blur-3xl" />
          </div>
          <div className="absolute left-0 top-0 h-full w-1.5 bg-dost-yellow" aria-hidden="true" />

          <div className="relative flex flex-col items-center text-center space-y-6 max-w-md">
            <img
              src="/DOST_seal.ico.png"
              alt="DOST XI official seal"
              className="h-44 w-44 xl:h-52 xl:w-52 object-contain drop-shadow-2xl"
              loading="eager"
            />
            <div className="space-y-3">
              <h1 className="text-6xl xl:text-7xl font-extrabold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-white via-dost-yellow to-white bg-clip-text text-transparent drop-shadow-sm">
                  DOST XI
                </span>
              </h1>
              <p className="text-lg xl:text-xl font-medium tracking-wide text-dost-blue-foreground/90">
                <span className="inline-block border-b-2 border-dost-yellow/70 pb-1">
                  Do Performance Monitoring
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Mobile branding header — more compact so signup fits without scroll */}
        <section className="lg:hidden relative overflow-hidden bg-dost-blue text-dost-blue-foreground px-6 pt-6 pb-7">
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-dost-yellow blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-dost-red blur-3xl" />
          </div>
          <div className="absolute left-0 bottom-0 h-1.5 w-full bg-dost-yellow" aria-hidden="true" />

          <div className="relative flex flex-col items-center text-center space-y-2">
            <img
              src="/DOST_seal.ico.png"
              alt="DOST XI official seal"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-xl"
              loading="eager"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-white via-dost-yellow to-white bg-clip-text text-transparent">
                  DOST XI
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-dost-blue-foreground/90">
                <span className="inline-block border-b-2 border-dost-yellow/70 pb-0.5">
                  Do Performance Monitoring
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Right: Signup Form */}
        <section className="flex items-start lg:items-center justify-center px-5 py-6 sm:px-8 lg:p-16 overflow-y-auto">
          <div className="w-full max-w-md space-y-4 lg:space-y-6">
            <div className="space-y-1 hidden lg:block">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="text-muted-foreground">
                Join DOST XI Performance Monitoring.
              </p>
            </div>

            <Card className="p-4 sm:p-6 shadow-sm border-border/60">
              <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-10"
                  />
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-10"
                  />
                </div>

                <Button type="submit" className="w-full group h-10">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </Card>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-dost-red hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>
      <footer aria-hidden="true" className="h-0 shrink-0" />
    </div>
  );
};

export default SignupPage;
