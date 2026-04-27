import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandingPanel } from "@/components/auth/BrandingPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "@/features/auth/components/LoginForm";

const LandingPage = () => {
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

            <LoginForm />

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
