import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email });
  };

  return (
    <main className="min-h-[100svh] grid lg:grid-cols-2 bg-background">
      {/* Left: Branding (desktop only) */}
      <section className="hidden lg:flex relative overflow-hidden bg-dost-blue text-dost-blue-foreground p-16 items-center justify-center">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-dost-yellow blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-dost-red blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center text-center space-y-6 max-w-md">
          <img
            src="/DOST_seal.ico.png"
            alt="DOST XI official seal"
            className="h-44 w-44 xl:h-52 xl:w-52 object-contain drop-shadow-2xl"
            loading="eager"
          />
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">DOST XI</h1>
            <p className="text-lg text-dost-blue-foreground/80">
              Do Performance Monitoring
            </p>
          </div>
        </div>
      </section>

      {/* Mobile branding header */}
      <section className="lg:hidden relative overflow-hidden bg-dost-blue text-dost-blue-foreground px-6 pt-10 pb-12">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-dost-yellow blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-dost-red blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center text-center space-y-3">
          <img
            src="/DOST_seal.ico.png"
            alt="DOST XI official seal"
            className="h-24 w-24 sm:h-28 sm:w-28 object-contain drop-shadow-xl"
            loading="eager"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">DOST XI</h1>
            <p className="text-sm text-dost-blue-foreground/80">
              Do Performance Monitoring
            </p>
          </div>
        </div>
      </section>

      {/* Right: Login Form */}
      <section className="flex items-start lg:items-center justify-center px-5 py-8 sm:px-8 lg:p-16">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          <div className="space-y-2 hidden lg:block">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue.
            </p>
          </div>

          <Card className="p-5 sm:p-6 shadow-sm border-border/60">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
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
                  className="h-11"
                />
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
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full group h-11">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </Card>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
