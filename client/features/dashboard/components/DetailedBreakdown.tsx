import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

function formatValue(val: number, type?: string) {
  if (type === 'currency') return `₱${val.toLocaleString()}`;
  if (type === 'percentage') return `${val}%`;
  return val.toLocaleString();
}

const CellValue = ({ actual, target, type }: { actual: number | null, target: number, type?: string }) => {
  return (
    <div className="flex flex-col items-end justify-center">
      <span className="font-semibold text-foreground">
        {actual !== null ? formatValue(actual, type) : "—"}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        Target: {formatValue(target, type)}
      </span>
    </div>
  );
};

export const DetailedBreakdown = ({ data = [] }: { data: any[] }) => {
  return (
    <div className="w-full">
      {data.length === 0 && <p className="text-sm text-muted-foreground">No metrics available.</p>}
      <Accordion type="single" collapsible className="w-full space-y-2">
        {data.map((ind, index) => {
          
          const chartData = [
            { label: "Q1", value: ind.data.reduce((sum: number, r: any) => sum + (r.q1_actual || 0), 0) },
            { label: "Q2", value: ind.data.reduce((sum: number, r: any) => sum + (r.q2_actual || 0), 0) },
            { label: "Q3", value: ind.data.reduce((sum: number, r: any) => sum + (r.q3_actual || 0), 0) },
            { label: "Q4", value: ind.data.reduce((sum: number, r: any) => sum + (r.q4_actual || 0), 0) },
          ];

          return (
            <AccordionItem key={ind.indicator} value={ind.indicator} className="border border-border/50 bg-card/40 rounded-lg overflow-hidden px-1">
              <AccordionTrigger className="hover:no-underline px-4 py-4 transition-colors hover:bg-card/80 group">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {ind.indicator}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {ind.data.length} program(s)
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="grid gap-4 xl:grid-cols-4">
                  <div className="xl:col-span-3 overflow-x-auto rounded-md border border-border/50 bg-background/50">
                    <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="whitespace-nowrap">Program</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Q1</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Q2</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Q3</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Q4</TableHead>
                            <TableHead className="text-right whitespace-nowrap border-l border-border/60 bg-muted/50">Annual</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ind.data.map((row: any, i: number) => (
                            <TableRow key={i} className="hover:bg-muted/10 transition-colors">
                              <TableCell className="font-medium text-foreground whitespace-nowrap">
                                {row.program === "N/A" ? "Agency-wide" : row.program}
                              </TableCell>
                              <TableCell className="text-right">
                                <CellValue actual={row.q1_actual} target={row.q1_target} type={ind.meta?.value_type} />
                              </TableCell>
                              <TableCell className="text-right">
                                <CellValue actual={row.q2_actual} target={row.q2_target} type={ind.meta?.value_type} />
                              </TableCell>
                              <TableCell className="text-right">
                                <CellValue actual={row.q3_actual} target={row.q3_target} type={ind.meta?.value_type} />
                              </TableCell>
                              <TableCell className="text-right">
                                <CellValue actual={row.q4_actual} target={row.q4_target} type={ind.meta?.value_type} />
                              </TableCell>
                              <TableCell className="text-right border-l border-border/60 bg-muted/20">
                                <CellValue actual={row.annual_actual} target={row.annual_target} type={ind.meta?.value_type} />
                              </TableCell>
                            </TableRow>
                          ))}
                          {ind.data.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">No data</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="rounded-md border border-border/60 p-3 h-full">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        Quarterly actuals trend
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <RTooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "0.5rem",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Bar dataKey="value" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
    </div>
  );
};
