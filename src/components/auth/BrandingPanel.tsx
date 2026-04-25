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

export function BrandingPanel({ variant = "desktop" }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % taglines.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (variant === "mobile") {
    return (
      <section className="lg:hidden relative overflow-hidden bg-dost-blue text-dost-blue-foreground px-6 pt-6 pb-7">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-dost-yellow blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-dost-red blur-3xl" />
        </div>
        <div className="absolute left-0 bottom-0 h-1.5 w-full bg-dost-yellow" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex flex-col items-center text-center space-y-2"
        >
          <img
            src="/DOST_seal.ico.png"
            alt="DOST XI official seal"
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-xl"
            loading="eager"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
              <span className="text-shimmer">DOST XI</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium tracking-wide text-dost-blue-foreground/90">
              <span className="inline-block border-b-2 border-dost-yellow/70 pb-0.5">
                Do Performance Monitoring
              </span>
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="hidden lg:flex relative overflow-hidden bg-dost-blue text-dost-blue-foreground p-16 items-center justify-center">
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-dost-yellow blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-dost-red blur-3xl" />
      </div>
      <div className="absolute left-0 top-0 h-full w-1.5 bg-dost-yellow" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center space-y-6 max-w-md"
      >
        <motion.img
          src="/DOST_seal.ico.png"
          alt="DOST XI official seal"
          className="h-44 w-44 xl:h-52 xl:w-52 object-contain drop-shadow-2xl"
          loading="eager"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        />
        <div className="space-y-3">
          <h1 className="text-6xl xl:text-7xl font-extrabold tracking-tight leading-none">
            <span className="text-shimmer drop-shadow-sm">DOST REGION XI</span>
          </h1>
          <p className="text-lg xl:text-xl font-medium tracking-wide text-dost-blue-foreground/90">
            <span className="inline-block border-b-2 border-dost-yellow/70 pb-1">
              Do Performance Monitoring
            </span>
          </p>
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-dost-blue-foreground/75 italic"
          >
            {taglines[idx]}
          </motion.p>
        </div>

        <div className="pt-6 flex items-center gap-2 text-xs text-dost-blue-foreground/70">
          <span>Republic of the Philippines</span>
          <span className="h-1.5 w-1.5 rounded-full bg-dost-yellow" />
          <span>Region XI</span>
        </div>
      </motion.div>
    </section>
  );
}
