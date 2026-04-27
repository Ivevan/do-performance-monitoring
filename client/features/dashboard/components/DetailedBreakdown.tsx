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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { breakdownSections } from "@/features/dashboard/data/mock-data";
import { statusVariant } from "@/features/dashboard/utils";

export const DetailedBreakdown = () => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
        <CardDescription>
          Drill into each program category for tables and mini charts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="operations" className="w-full">
          {breakdownSections.map((section) => (
            <AccordionItem key={section.id} value={section.id} className="border-border/60">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted ${section.accent}`}>
                    <section.icon className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">{section.label}</div>
                    <div className="text-xs text-muted-foreground">{section.summary}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 overflow-hidden rounded-md border border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Budget</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusVariant(row.status)}>
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={row.progress} className="h-1.5 w-24" />
                                <span className="text-xs text-muted-foreground">{row.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-foreground">{row.budget}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded-md border border-border/60 p-3">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Quarterly trend
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={section.chart}>
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
                        <Bar dataKey="value" fill={section.chartColor} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
