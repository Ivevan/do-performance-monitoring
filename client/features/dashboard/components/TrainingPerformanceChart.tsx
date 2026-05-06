import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface TrainingData {
  quarter: string;
  Trainings: number;
  Participants: number;
  Firms: number;
}

interface TrainingPerformanceChartProps {
  data: TrainingData[];
}

export function TrainingPerformanceChart({ data }: TrainingPerformanceChartProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Training Targets</h3>
        <p className="text-xs text-muted-foreground">Trainings, Participants & Firms Assisted</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
            <Bar dataKey="Trainings"    fill="hsl(var(--dost-blue))"   radius={[4, 4, 0, 0]} />
            <Bar dataKey="Firms"        fill="hsl(var(--dost-red))"    radius={[4, 4, 0, 0]} />
            <Bar dataKey="Participants" fill="hsl(var(--dost-yellow))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
