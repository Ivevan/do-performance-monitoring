import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: Login Form */}
      <section className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold tracking-tight">Acme</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue your journey.
            </p>
          </div>

          <Card className="p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full group">
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

      {/* Right: Hero/Marketing */}
      <section className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-16 items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>

        <div className="relative space-y-10 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Build faster. Ship smarter.
            </h2>
            <p className="text-lg text-primary-foreground/80">
              The all-in-one platform trusted by thousands of teams to bring
              ideas to life — beautifully.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Zap, title: "Lightning fast", desc: "Optimized for performance from day one." },
              { icon: Shield, title: "Secure by default", desc: "Enterprise-grade security built-in." },
              { icon: Sparkles, title: "Delightful UX", desc: "Crafted with attention to every detail." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-primary-foreground/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
