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

export const DetailedBreakdown = ({ data = [] }: { data: any[] }) => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
        <CardDescription>
          Drill into each indicator for program-level tables and quarterly charts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 && <p className="text-sm text-muted-foreground">No breakdown data available.</p>}
        <Accordion type="single" collapsible defaultValue={data[0]?.indicator} className="w-full">
          {data.map((ind, index) => {
            // Group by quarter for the mini chart
            const chartDataObj: Record<string, number> = {};
            ind.data.forEach((row: any) => {
              chartDataObj[row.quarter] = (chartDataObj[row.quarter] || 0) + row.value;
            });
            const chartData = Object.keys(chartDataObj).map(q => ({
              label: q,
              value: chartDataObj[q]
            })).sort((a, b) => a.label.localeCompare(b.label));

            return (
              <AccordionItem key={ind.indicator} value={ind.indicator} className="border-border/60">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-dost-blue">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{ind.indicator}</div>
                      <div className="text-xs text-muted-foreground">
                        {ind.data.length} records • {ind.meta?.value_type || "count"}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 overflow-hidden rounded-md border border-border/60">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quarter</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ind.data.map((row: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium text-foreground">{row.quarter}</TableCell>
                              <TableCell>{row.program}</TableCell>
                              <TableCell className="text-right text-foreground">
                                {formatValue(row.value, row.value_type)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {ind.data.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">No data</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="rounded-md border border-border/60 p-3">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        Quarterly trend
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
      </CardContent>
    </Card>
  );
};
