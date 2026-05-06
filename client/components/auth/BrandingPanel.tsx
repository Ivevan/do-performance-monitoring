import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const taglines = [
  "Science • Technology • Innovation",
  "Empowering Region XI through S&T",
  "Performance you can measure",
];

type Props = {
  variant?: "desktop" | "mobile";
};

/** Deep DOST Blue gradient — always consistent regardless of light/dark theme */
const PANEL_BG = "linear-gradient(150deg, #1e57c9 0%, #0c308f 50%, #071d6b 100%)";

export function BrandingPanel({ variant = "desktop" }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % taglines.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (variant === "mobile") {
    return (
      <section
        className="lg:hidden relative overflow-hidden px-6 pt-5 pb-6 text-white"
        style={{ background: PANEL_BG }}
      >
        {/* Texture */}
        <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
        {/* Ambient light blobs */}
        <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none">
          <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-blue-400 blur-3xl" />
        </div>
        {/* Bottom accent line */}
        <div
          className="absolute left-0 bottom-0 h-1 w-full"
          style={{ background: "linear-gradient(90deg, transparent, #fbbf24, transparent)" }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex items-center gap-4"
        >
          {/* Seal with glow ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-lg scale-150" />
            <img
              src="/DOST_seal.ico.png"
              alt="DOST XI official seal"
              className="relative h-14 w-14 sm:h-16 sm:w-16 object-contain drop-shadow-xl"
              loading="eager"
            />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-shimmer-brand">DOST Region XI</span>
            </h1>
            <p className="text-xs font-medium text-white/80 tracking-wide">
              Do Performance Monitoring
            </p>
            <p className="text-[10px] text-amber-300/80 tracking-wider uppercase font-semibold">
              Empowering Region XI through S&T
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      className="hidden lg:flex relative overflow-hidden p-16 items-center justify-center"
      style={{ background: PANEL_BG }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />

      {/* Ambient light blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="absolute top-1/4 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-96 w-96 rounded-full bg-blue-700/40 blur-3xl -translate-x-1/2" />
      </div>

      {/* Left accent stripe — amber gradient */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: "linear-gradient(to bottom, transparent, #fbbf24 30%, #fbbf24 70%, transparent)" }}
        aria-hidden="true"
      />

      {/* Decorative corner rings */}
      <div className="absolute top-8 right-8 h-28 w-28 rounded-full border border-white/10" />
      <div className="absolute top-14 right-14 h-16 w-16 rounded-full border border-white/6" />
      <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full border border-white/8" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center space-y-8 max-w-md"
      >
        {/* Seal with layered glow + float animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-150" />
          <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-xl scale-125" />
          <motion.img
            src="/DOST_seal.ico.png"
            alt="DOST XI official seal"
            className="relative h-44 w-44 xl:h-52 xl:w-52 object-contain drop-shadow-2xl"
            loading="eager"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -10, 0],
            }}
            transition={{
              scale: { duration: 0.6, delay: 0.15, ease: "easeOut" },
              opacity: { duration: 0.6, delay: 0.15 },
              y: { duration: 4.5, ease: "easeInOut", repeat: Infinity, delay: 0.8 },
            }}
          />
        </div>

        {/* Text block */}
        <div className="space-y-4 text-white">
          {/* Eyebrow */}
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300/85">
            Republic of the Philippines
          </p>

          {/* Main title */}
          <div className="space-y-1 leading-none">
            <h1 className="text-6xl xl:text-7xl font-extrabold tracking-tight">
              <span className="text-shimmer-brand">DOST</span>
            </h1>
            <p className="text-3xl xl:text-4xl font-bold tracking-[0.15em] text-white/90">
              REGION XI
            </p>
          </div>

          {/* Amber divider */}
          <div className="flex items-center gap-3 justify-center py-1">
            <div className="h-px w-12 bg-white/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-12 bg-white/20" />
          </div>

          {/* Sub-title */}
          <div className="space-y-2">
            <p className="text-lg xl:text-xl font-semibold tracking-wide text-white">
              Do Performance Monitoring
            </p>
            {/* Rotating tagline */}
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-sm text-white/55 italic font-light"
            >
              {taglines[idx]}
            </motion.p>
          </div>
        </div>

        {/* Bottom info badge */}
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-white/70 font-medium tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>Department of Science and Technology</span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
        </div>
      </motion.div>
    </section>
  );
}
