import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NeonKpiCardProps {
  title: string;
  value: string;
  trend?: number;
  q1?: number; // percentage filled 0-100
  q2?: number;
  q3?: number;
  q4?: number;
}

export const NeonKpiCard = ({ title, value, trend, q1 = 0, q2 = 0, q3 = 0, q4 = 0 }: NeonKpiCardProps) => {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 flex flex-col justify-between min-h-[140px] shadow-sm hover:border-primary/40 transition-colors group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-primary' : 'text-muted-foreground'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
          {value}
        </div>
        
        {/* Progress Dashes */}
        <div className="grid grid-cols-4 gap-2 h-1 w-full mt-auto">
          <div className="h-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${q1}%` }} />
          </div>
          <div className="h-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${q2}%` }} />
          </div>
          <div className="h-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${q3}%` }} />
          </div>
          <div className="h-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${q4}%` }} />
          </div>
        </div>
      </div>
      
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/0 to-primary/0 group-hover:from-primary/5 transition-all pointer-events-none" />
    </motion.div>
  );
};
