import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const TrainingPerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <Card className="border-border/50 bg-card shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Training Performance</CardTitle>
        <CardDescription className="text-xs">Trainings, Participants, Firms Assisted</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <RTooltip
              contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: "8px", color: "#fff" }}
              itemStyle={{ color: "#fff" }}
              cursor={{ fill: "hsl(0 0% 15%)", opacity: 0.4 }}
            />
            <Bar dataKey="Trainings" fill="hsl(180 100% 50%)" radius={[2, 2, 0, 0]} barSize={12} />
            <Bar dataKey="Participants" fill="hsl(260 100% 65%)" radius={[2, 2, 0, 0]} barSize={12} />
            <Bar dataKey="Firms" fill="hsl(44 100% 59%)" radius={[2, 2, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
