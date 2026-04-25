import { Activity, TrendingUp, Users, FileCheck, Cog, Sparkles, Shield, LifeBuoy } from "lucide-react";

export const stats = [
  { label: "Total Projects", actual: "156", target: "180", achievement: "87%", icon: Activity, accent: "text-dost-blue" },
  { label: "Total Funds", actual: "₱84.2M", target: "₱100M", achievement: "84%", icon: TrendingUp, accent: "text-emerald-500" },
  { label: "Total Trainings", actual: "48", target: "60", achievement: "80%", icon: Users, accent: "text-dost-red" },
  { label: "Overall Performance", actual: "94%", target: "100%", achievement: "94%", icon: FileCheck, accent: "text-violet-500" },
];

export const quarterlyData = [
  { quarter: "Q1", performance: 78, target: 80 },
  { quarter: "Q2", performance: 85, target: 85 },
  { quarter: "Q3", performance: 91, target: 88 },
  { quarter: "Q4", performance: 94, target: 92 },
];

export const fundingTrends = [
  { month: "Jan", funds: 5.2 },
  { month: "Feb", funds: 6.8 },
  { month: "Mar", funds: 7.4 },
  { month: "Apr", funds: 6.9 },
  { month: "May", funds: 8.1 },
  { month: "Jun", funds: 9.3 },
  { month: "Jul", funds: 8.7 },
  { month: "Aug", funds: 10.2 },
  { month: "Sep", funds: 11.4 },
  { month: "Oct", funds: 12.1 },
  { month: "Nov", funds: 13.6 },
  { month: "Dec", funds: 14.5 },
];

export const annualTargets = [
  { label: "Projects Delivered", value: 156, target: 180 },
  { label: "Funds Disbursed", value: 84, target: 100 },
  { label: "Trainings Conducted", value: 48, target: 60 },
  { label: "Beneficiaries Reached", value: 12400, target: 15000 },
];

export type BreakdownSection = {
  id: string;
  label: string;
  icon: typeof Cog;
  accent: string;
  summary: string;
  rows: { name: string; status: string; progress: number; budget: string }[];
  chart: { label: string; value: number }[];
  chartColor: string;
};

export const breakdownSections: BreakdownSection[] = [
  {
    id: "operations",
    label: "I. Operations",
    icon: Cog,
    accent: "text-dost-blue",
    summary:
      "Diffusion & transfer of knowledge and technologies — SETUP, GIA, i-Fund, trainings, consultancy.",
    rows: [
      { name: "SETUP Projects Approved", status: "On Track", progress: 100, budget: "₱4.21M" },
      { name: "LGIA Projects Approved", status: "On Track", progress: 100, budget: "₱3.48M" },
      { name: "i-Fund Technology Interventions", status: "On Track", progress: 100, budget: "15 / 15" },
      { name: "Technology Trainings Conducted", status: "On Track", progress: 100, budget: "53 / 53" },
      { name: "Technofora Conducted", status: "On Track", progress: 100, budget: "2 / 2" },
      { name: "Technical Consultancy Services", status: "On Track", progress: 100, budget: "16 / 16" },
      { name: "Packaging & Labeling Designs", status: "On Track", progress: 100, budget: "7 / 7" },
      { name: "S&T Information & Referral", status: "On Track", progress: 100, budget: "20 / 20" },
    ],
    chart: [
      { label: "Q1", value: 19 },
      { label: "Q2", value: 25 },
      { label: "Q3", value: 23 },
      { label: "Q4", value: 33 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
  {
    id: "enhancement",
    label: "II. Enhancement",
    icon: Sparkles,
    accent: "text-emerald-500",
    summary:
      "S&T promotion, scholarships, DATBED, networks/linkages and grassroots innovation engagement.",
    rows: [
      { name: "S&T Promotional Activities", status: "On Track", progress: 100, budget: "8 / 8" },
      { name: "Scholarship Applicants Facilitated", status: "On Track", progress: 100, budget: "115 / 115" },
      { name: "Scholarship Examinees", status: "On Track", progress: 100, budget: "80 / 80" },
      { name: "On-Going Scholars", status: "On Track", progress: 100, budget: "8 / 8" },
      { name: "Networks/Linkages Maintained", status: "On Track", progress: 100, budget: "30 / 30" },
      { name: "LGU Trainings/Fora Conducted", status: "On Track", progress: 100, budget: "20 / 20" },
      { name: "NGA-DOST Trainings", status: "On Track", progress: 100, budget: "4 / 4" },
      { name: "STARBOOKS Deployments", status: "On Track", progress: 100, budget: "3 / 3" },
    ],
    chart: [
      { label: "Q1", value: 16 },
      { label: "Q2", value: 18 },
      { label: "Q3", value: 36 },
      { label: "Q4", value: 113 },
    ],
    chartColor: "hsl(var(--dost-red))",
  },
  {
    id: "admin",
    label: "III. General Administration",
    icon: Shield,
    accent: "text-violet-500",
    summary:
      "Governance, finance and disbursement performance — obligation, disbursement and investment ratings.",
    rows: [
      { name: "Reports of Disbursement Submitted", status: "On Track", progress: 100, budget: "4 / 4" },
      { name: "Investment Increase from Cooperators", status: "On Track", progress: 58, budget: "58%" },
      { name: "Obligation / Allotment Rating", status: "On Track", progress: 96, budget: "96%" },
      { name: "Disbursement / Allotment Rating", status: "On Track", progress: 85, budget: "85%" },
      { name: "Disbursement / Obligation Rating", status: "On Track", progress: 88, budget: "88%" },
    ],
    chart: [
      { label: "Q1", value: 1 },
      { label: "Q2", value: 1 },
      { label: "Q3", value: 1 },
      { label: "Q4", value: 1 },
    ],
    chartColor: "#8b5cf6",
  },
  {
    id: "support",
    label: "IV. Support to Operations",
    icon: LifeBuoy,
    accent: "text-dost-red",
    summary:
      "HR development, QMS, 5S audits, customer satisfaction and project fund utilization.",
    rows: [
      { name: "Trainings Attended (Personnel)", status: "On Track", progress: 100, budget: "6 / 6" },
      { name: "Quality Management System", status: "On Track", progress: 100, budget: "1 / 1" },
      { name: "5S Audit Score", status: "On Track", progress: 88, budget: "3.5 / 4" },
      { name: "Personnel w/ Subject Matter Expertise", status: "On Track", progress: 69, budget: "69%" },
      { name: "Employee Morale Index ≥ 4.2", status: "On Track", progress: 100, budget: "100%" },
      { name: "Overall CSF Rating", status: "On Track", progress: 90, budget: "4.5 / 5" },
      { name: "Net Promoter Score", status: "On Track", progress: 90, budget: "90%" },
      { name: "Project Fund Utilization", status: "On Track", progress: 96, budget: "96%" },
    ],
    chart: [
      { label: "Q1", value: 1 },
      { label: "Q2", value: 2 },
      { label: "Q3", value: 2 },
      { label: "Q4", value: 2 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
];
