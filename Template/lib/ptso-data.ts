export type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | "Annual";

export interface MetricData {
  name: string;
  Q1: number | string;
  Q2: number | string;
  Q3: number | string;
  Q4: number | string;
  Annual: number | string;
  unit?: string;
}

export interface CategoryData {
  title: string;
  subcategories: {
    name: string;
    metrics: MetricData[];
  }[];
}

export const ptsoData: CategoryData[] = [
  {
    title: "Operations",
    subcategories: [
      {
        name: "Technology Acquisition & Upgrading",
        metrics: [
          { name: "Projects Approved (SETUP)", Q1: 2, Q2: 1, Q3: 1, Q4: 0, Annual: 4 },
          { name: "Projects Approved (LGIA)", Q1: 0, Q2: 1, Q3: 0, Q4: 0, Annual: 1 },
          { name: "Amount Funded - SETUP", Q1: 1200000, Q2: 2200000, Q3: 809216.11, Q4: 0, Annual: 4209216, unit: "PHP" },
          { name: "Amount Funded - LGIA", Q1: 153377, Q2: 2452260.43, Q3: 417257.34, Q4: 457257.33, Annual: 3480152, unit: "PHP" },
        ],
      },
      {
        name: "Innovation Fund (i-Fund)",
        metrics: [
          { name: "Technology Interventions", Q1: 1, Q2: 5, Q3: 5, Q4: 4, Annual: 15 },
          { name: "Customers Assisted", Q1: 1, Q2: 5, Q3: 5, Q4: 3, Annual: 14 },
          { name: "Start-up Firms Assisted", Q1: 0, Q2: 0, Q3: 0, Q4: 0, Annual: 0 },
        ],
      },
      {
        name: "Economic Impact",
        metrics: [
          { name: "Gross Sales", Q1: 1350, Q2: 1400, Q3: 1400, Q4: 1400, Annual: 5550, unit: "PHP '000" },
          { name: "New Jobs Generated", Q1: 3, Q2: 0, Q3: 0, Q4: 3, Annual: 6 },
          { name: "Employment (Person-Months)", Q1: 120, Q2: 100, Q3: 100, Q4: 85, Annual: 405 },
          { name: "% Increase Productivity", Q1: 0, Q2: 0, Q3: 0, Q4: 25, Annual: 25, unit: "%" },
          { name: "% Increase Employment", Q1: 0, Q2: 0, Q3: 0, Q4: 2, Annual: 2, unit: "%" },
        ],
      },
      {
        name: "Technology Trainings",
        metrics: [
          { name: "Trainings Conducted", Q1: 10, Q2: 15, Q3: 14, Q4: 14, Annual: 53 },
          { name: "Firms Assisted", Q1: 30, Q2: 50, Q3: 50, Q4: 59, Annual: 189 },
          { name: "Participants", Q1: 200, Q2: 350, Q3: 350, Q4: 283, Annual: 1183 },
        ],
      },
      {
        name: "Technofora",
        metrics: [
          { name: "Forums Conducted", Q1: 0, Q2: 1, Q3: 1, Q4: 0, Annual: 2 },
          { name: "Firms Assisted", Q1: 0, Q2: 5, Q3: 5, Q4: 0, Annual: 10 },
          { name: "Participants", Q1: 0, Q2: 25, Q3: 25, Q4: 0, Annual: 50 },
        ],
      },
      {
        name: "Technical Consultancy Services",
        metrics: [
          { name: "MPEX", Q1: 0, Q2: 0, Q3: 0, Q4: 4, Annual: 4 },
          { name: "CPT", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
          { name: "Food Safety", Q1: 1, Q2: 1, Q3: 2, Q4: 0, Annual: 4 },
          { name: "Energy Audit", Q1: 0, Q2: 0, Q3: 1, Q4: 0, Annual: 1 },
          { name: "Halal Training", Q1: 0, Q2: 0, Q3: 1, Q4: 0, Annual: 1 },
          { name: "Halal Assessment", Q1: 0, Q2: 0, Q3: 1, Q4: 0, Annual: 1 },
          { name: "BOSH", Q1: 1, Q2: 0, Q3: 0, Q4: 0, Annual: 1 },
          { name: "Digitalization", Q1: 1, Q2: 0, Q3: 0, Q4: 0, Annual: 1 },
          { name: "R&D Shopfloor", Q1: 1, Q2: 0, Q3: 0, Q4: 0, Annual: 1 },
          { name: "Biocircular Tech", Q1: 1, Q2: 0, Q3: 0, Q4: 0, Annual: 1 },
        ],
      },
      {
        name: "Packaging & Labeling",
        metrics: [
          { name: "Design Briefs Submitted", Q1: 2, Q2: 2, Q3: 3, Q4: 0, Annual: 7 },
          { name: "Firms Assisted", Q1: 2, Q2: 2, Q3: 2, Q4: 0, Annual: 6 },
        ],
      },
      {
        name: "S&T Information and Referral",
        metrics: [
          { name: "Information Provided", Q1: 6, Q2: 6, Q3: 5, Q4: 3, Annual: 20 },
          { name: "Customers Assisted", Q1: 6, Q2: 6, Q3: 5, Q4: 3, Annual: 20 },
        ],
      },
    ],
  },
  {
    title: "Strategic Deliverables",
    subcategories: [
      {
        name: "SETUP & GIA Coverage",
        metrics: [
          { name: "% Municipalities availed SETUP", Q1: 0, Q2: 50, Q3: 0, Q4: 50, Annual: 50, unit: "%" },
          { name: "% Municipalities availed GIA", Q1: 0, Q2: 50, Q3: 0, Q4: 50, Annual: 50, unit: "%" },
          { name: "% SETUP Refund Rate", Q1: 0, Q2: 88.5, Q3: 0, Q4: 88.5, Annual: 88.5, unit: "%" },
        ],
      },
      {
        name: "Digital & Innovation Adoption",
        metrics: [
          { name: "% SMART SETI Adoption", Q1: 0, Q2: 31, Q3: 0, Q4: 31, Annual: 31, unit: "%" },
          { name: "% Communities of Practice", Q1: 0, Q2: 32, Q3: 0, Q4: 32, Annual: 32, unit: "%" },
          { name: "% Certified SETUP Cooperators", Q1: 0, Q2: 9, Q3: 0, Q4: 9, Annual: 9, unit: "%" },
          { name: "MSMEs using Digital Tech", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
          { name: "MSMEs assisted in OHS", Q1: 0, Q2: 0, Q3: 1, Q4: 0, Annual: 1 },
          { name: "MSMEs using Circular Economy", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
        ],
      },
      {
        name: "SETI Performance",
        metrics: [
          { name: "% SETI Scorecards Deployed", Q1: 0, Q2: 100, Q3: 0, Q4: 100, Annual: 100, unit: "%" },
          { name: "% Projects translated to 7Ps", Q1: 0, Q2: 50, Q3: 0, Q4: 50, Annual: 50, unit: "%" },
          { name: "SETI Partnerships", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
        ],
      },
    ],
  },
  {
    title: "S&T Projects Enhancement",
    subcategories: [
      {
        name: "Promotional Activities",
        metrics: [
          { name: "S&T Promotional Activities", Q1: 2, Q2: 2, Q3: 2, Q4: 2, Annual: 8 },
        ],
      },
      {
        name: "S&T Scholarship",
        metrics: [
          { name: "Applicants", Q1: 0, Q2: 0, Q3: 15, Q4: 100, Annual: 115 },
          { name: "Examinees", Q1: 0, Q2: 80, Q3: 0, Q4: 0, Annual: 80 },
          { name: "Qualifiers", Q1: 0, Q2: 0, Q3: 5, Q4: 0, Annual: 5 },
          { name: "Scholars", Q1: 0, Q2: 0, Q3: 8, Q4: 0, Annual: 8 },
          { name: "Graduates", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
          { name: "% Municipal Coverage", Q1: 0, Q2: 0, Q3: 0, Q4: 70, Annual: 70, unit: "%" },
        ],
      },
      {
        name: "Networks/Linkages",
        metrics: [
          { name: "Networks Established", Q1: 10, Q2: 10, Q3: 5, Q4: 5, Annual: 30 },
          { name: "LGU Trainings", Q1: 5, Q2: 5, Q3: 5, Q4: 5, Annual: 20 },
          { name: "NGA Trainings", Q1: 1, Q2: 1, Q3: 1, Q4: 1, Annual: 4 },
        ],
      },
    ],
  },
  {
    title: "Support & Administration",
    subcategories: [
      {
        name: "General Administrative Services",
        metrics: [
          { name: "Reports Submitted", Q1: 1, Q2: 1, Q3: 1, Q4: 1, Annual: 4 },
        ],
      },
      {
        name: "Support to Operations",
        metrics: [
          { name: "Trainings Attended", Q1: 1, Q2: 2, Q3: 2, Q4: 1, Annual: 6 },
          { name: "QMS Maintained", Q1: 0, Q2: 0, Q3: 0, Q4: 1, Annual: 1 },
          { name: "5S Score", Q1: 0, Q2: 0, Q3: 0, Q4: 4, Annual: 3.5 },
        ],
      },
      {
        name: "Final Strategic Metrics",
        metrics: [
          { name: "Personnel SME", Q1: 0, Q2: 0, Q3: 0, Q4: 69, Annual: 69, unit: "%" },
          { name: "Employee Morale ≥4.2", Q1: 0, Q2: 0, Q3: 0, Q4: 100, Annual: 100, unit: "%" },
          { name: "IQA Rating (5S)", Q1: 0, Q2: 0, Q3: 0, Q4: 3.5, Annual: 3.5 },
          { name: "CSF Rating", Q1: 4.5, Q2: 4.5, Q3: 4.5, Q4: 4.5, Annual: 4.5 },
          { name: "Net Promoter Score", Q1: 0, Q2: 0, Q3: 0, Q4: 90, Annual: 90, unit: "%" },
          { name: "Fund Utilization", Q1: 0, Q2: 0, Q3: 0, Q4: 96, Annual: 96, unit: "%" },
        ],
      },
    ],
  },
];

// Key metrics for the overview cards
export const keyMetrics = [
  { 
    label: "Total Funding", 
    value: 7689368, 
    unit: "PHP",
    breakdown: { Q1: 1353377, Q2: 4652260.43, Q3: 1226473.45, Q4: 457257.33 },
    trend: "+12%",
    trendUp: true
  },
  { 
    label: "Trainings Conducted", 
    value: 53, 
    breakdown: { Q1: 10, Q2: 15, Q3: 14, Q4: 14 },
    trend: "+8%",
    trendUp: true
  },
  { 
    label: "Firms Assisted", 
    value: 189, 
    breakdown: { Q1: 30, Q2: 50, Q3: 50, Q4: 59 },
    trend: "+15%",
    trendUp: true
  },
  { 
    label: "Participants Trained", 
    value: 1183, 
    breakdown: { Q1: 200, Q2: 350, Q3: 350, Q4: 283 },
    trend: "+5%",
    trendUp: true
  },
  { 
    label: "Gross Sales", 
    value: 5550, 
    unit: "PHP '000",
    breakdown: { Q1: 1350, Q2: 1400, Q3: 1400, Q4: 1400 },
    trend: "+10%",
    trendUp: true
  },
  { 
    label: "Jobs Generated", 
    value: 6, 
    breakdown: { Q1: 3, Q2: 0, Q3: 0, Q4: 3 },
    trend: "0%",
    trendUp: false
  },
];

// Chart data for quarterly trends
export const quarterlyFundingData = [
  { quarter: "Q1", SETUP: 1200000, LGIA: 153377 },
  { quarter: "Q2", SETUP: 2200000, LGIA: 2452260.43 },
  { quarter: "Q3", SETUP: 809216.11, LGIA: 417257.34 },
  { quarter: "Q4", SETUP: 0, LGIA: 457257.33 },
];

export const trainingTrendData = [
  { quarter: "Q1", trainings: 10, participants: 200, firms: 30 },
  { quarter: "Q2", trainings: 15, participants: 350, firms: 50 },
  { quarter: "Q3", trainings: 14, participants: 350, firms: 50 },
  { quarter: "Q4", trainings: 14, participants: 283, firms: 59 },
];

export const economicImpactData = [
  { quarter: "Q1", grossSales: 1350, employment: 120 },
  { quarter: "Q2", grossSales: 1400, employment: 100 },
  { quarter: "Q3", grossSales: 1400, employment: 100 },
  { quarter: "Q4", grossSales: 1400, employment: 85 },
];

export const strategicMetricsData = [
  { name: "SETUP Coverage", value: 50, target: 100 },
  { name: "GIA Coverage", value: 50, target: 100 },
  { name: "Refund Rate", value: 88.5, target: 100 },
  { name: "SMART SETI", value: 31, target: 100 },
  { name: "Fund Utilization", value: 96, target: 100 },
  { name: "Net Promoter", value: 90, target: 100 },
];
