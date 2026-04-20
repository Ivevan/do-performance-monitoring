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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: Branding */}
      <section className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-16 items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center text-center space-y-6 max-w-md">
          <img
            src="/DOST_seal.ico.png"
            alt="DOST XI official seal"
            className="h-48 w-48 object-contain drop-shadow-2xl"
          />
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">DOST XI</h1>
            <p className="text-lg text-primary-foreground/80">
              Do Performance Monitoring
            </p>
          </div>
        </div>
      </section>

      {/* Right: Login Form */}
      <section className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden flex flex-col items-center text-center">
            <img src="/DOST_seal.ico.png" alt="DOST XI seal" className="h-20 w-20 object-contain" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">DOST XI</h1>
            <p className="text-sm text-muted-foreground">Do Performance Monitoring</p>
          </div>
          <div className="space-y-2 hidden lg:block">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue.
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
    </div>
  );
};

export default LandingPage;
