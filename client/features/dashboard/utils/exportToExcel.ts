import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ── Types ────────────────────────────────────────────────────────────────────
interface GridRow {
  indicator: string;
  program: string | null;
  section: string;
  category: string;
  deliverable_type: string;
  unit: string | null;
  aggregation_type: string;
  q1_target: number;
  q2_target: number;
  q3_target: number;
  q4_target: number;
  annual_target: number;
}

interface ExportOptions {
  year: number;
  preparedByName: string;
  preparedByTitle: string;
}

// ── Normalization function for robust string comparison ──────────────────────
function cleanString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove non-alphanumeric
    .trim();
}

// ── Parse raw data into GridRow[] (replicates DataEntryGrid logic) ────────────
function parseRawData(rawData: any[]): GridRow[] {
  if (!rawData || rawData.length === 0) return [];

  const groupedMap = new Map<string, GridRow>();

  rawData.forEach((item) => {
    const prog =
      item.program && item.program !== "N/A" ? item.program : null;
    const key = `${item.indicator}||${prog || "N/A"}`;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        indicator: item.indicator,
        program: prog,
        section: item.section,
        category: item.category || "Other",
        deliverable_type: item.deliverable_type || "Functional",
        unit: item.unit,
        aggregation_type: item.aggregation_type || "SUM",
        q1_target: item.q1_target ?? 0,
        q2_target: item.q2_target ?? 0,
        q3_target: item.q3_target ?? 0,
        q4_target: item.q4_target ?? 0,
        annual_target: item.annual_target ?? 0,
      });
    }
  });

  return Array.from(groupedMap.values()).map((row) => {
    const isLatest = row.aggregation_type === "LATEST";
    const isAverage = row.aggregation_type === "AVERAGE";
    if (isLatest) {
      row.annual_target =
        row.q4_target || row.q3_target || row.q2_target || row.q1_target || 0;
    } else if (isAverage) {
      row.annual_target =
        (row.q1_target + row.q2_target + row.q3_target + row.q4_target) / 4;
    } else {
      row.annual_target =
        row.q1_target + row.q2_target + row.q3_target + row.q4_target;
    }
    return row;
  });
}

// ── Scan upwards to find the closest parent indicator name in the sheet ──────
function getParentIndicator(ws: ExcelJS.Worksheet, rowIndex: number): string {
  const programNames = ["setup", "lgia", "lgus", "ifund"];
  
  const categoriesList = [
    "Technology Acquisition & Upgrading",
    "Innovation Fund",
    "Technology Trainings & Techno Fora",
    "Technical Consultancy Services",
    "Packaging and Labeling Design",
    "S&T Information and Referral",
    "Strategic Deliverables",
    "Non-Paying Laboratory Services",
    "S&T Promotion",
    "S&T Scholarship",
    "DATBED",
    "Networks/Linkages",
    "Functional Deliverables",
    "Support to Operations"
  ].map(cat => cleanString(cat));

  for (let r = rowIndex - 1; r >= 1; r--) {
    const val = ws.getRow(r).getCell(1).value;
    if (!val) continue;
    
    const text = String(val).trim();
    const textClean = cleanString(text);

    // Skip section headers
    if (/^[IVX]+\.\s+/i.test(text)) continue;
    
    // Skip deliverable type headers
    if (text.toUpperCase().includes("DELIVERABLES")) continue;

    // Skip categories
    if (categoriesList.includes(textClean)) continue;

    // Skip program names themselves
    if (programNames.includes(textClean)) continue;

    // Found it! This is the parent indicator row.
    return text;
  }
  return "";
}

// ── Match database rows to template cells ─────────────────────────────────────
function isMatch(
  dbRow: GridRow,
  excelText: string,
  parentIndicator: string
): boolean {
  const dbIndClean = cleanString(dbRow.indicator);
  const dbProgClean = dbRow.program ? cleanString(dbRow.program) : "";
  const excelTextClean = cleanString(excelText);
  const parentClean = cleanString(parentIndicator);

  // Identify program sub-rows in the Excel sheet (like SETUP, LGIA, LGUs)
  const excelIsProgramRow = ["setup", "lgia", "lgus"].includes(excelTextClean);

  if (excelIsProgramRow) {
    const programMatches =
      dbProgClean === excelTextClean ||
      (dbProgClean === "lgia" && excelTextClean === "lgus") ||
      (dbProgClean === "lgus" && excelTextClean === "lgia");

    const parentMatches =
      parentClean === dbIndClean ||
      parentClean.includes(dbIndClean) ||
      dbIndClean.includes(parentClean);

    return programMatches && parentMatches;
  }

  // General indicator row (not a sub-program row in Excel)
  // If the database row is program-specific (SETUP or LGIA), it must only match program sub-rows.
  // We do not let it match general/parent rows here.
  if (dbProgClean === "setup" || dbProgClean === "lgia" || dbProgClean === "lgus") {
    return false;
  }

  const exactMatch = excelTextClean === dbIndClean;
  const prefixMatch =
    excelTextClean.length > 5 &&
    (excelTextClean.startsWith(dbIndClean) || dbIndClean.startsWith(excelTextClean));

  return exactMatch || prefixMatch;
}

// ── Helper to check if indicator represents a percentage ────────────────────
function isPercentageIndicator(indicatorName: string): boolean {
  const name = indicatorName.toLowerCase();
  return name.includes("%") || name.includes("percentage");
}

// ── Helper to check if row is part of Technology Acquisition & Upgrading ───
function shouldKeepBlankForZero(categoryName: string): boolean {
  return cleanString(categoryName) === cleanString("Technology Acquisition & Upgrading");
}

// ── Main export function using the template ──────────────────────────────────
export async function exportToExcel(
  rawData: any[],
  options: ExportOptions
): Promise<void> {
  const { year, preparedByName, preparedByTitle } = options;

  // 1. Fetch the Excel template file
  const templateUrl = "/DOST_Performance_Template.xlsx";
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Excel template at ${templateUrl}. Please ensure the file is present in the public directory.`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  // 2. Load it into exceljs
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const ws = workbook.worksheets[0];
  if (!ws) {
    throw new Error("No worksheet found in the template Excel file.");
  }

  // 3. Parse target data from database
  const dbRows = parseRawData(rawData);

  // 4. Fill in cells based on indicator matching
  const matchedDbRows = new Set<string>();

  for (let i = 1; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    const colAVal = row.getCell(1).value;
    const colAStr = colAVal ? String(colAVal).trim() : "";

    // Read the Tag from Column G (Cell 7)
    const tagVal = row.getCell(7).value;
    const tagStr = tagVal ? String(tagVal).trim() : "";

    let matchedRow: GridRow | undefined = undefined;

    if (tagStr) {
      const lowerTag = tagStr.toLowerCase();
      if (lowerTag === "skip" || lowerTag === "ignore" || lowerTag === "blank") {
        // Explicitly leave this row blank and clear the tag
        row.getCell(7).value = null;
        continue;
      }

      // Prioritize Column G Tag mapping
      const tagClean = cleanString(tagStr);
      matchedRow = dbRows.find((dbRow) => {
        const dbKeyClean = cleanString(dbRow.indicator + (dbRow.program || ""));
        return tagClean === dbKeyClean;
      });
      
      // Clear the tag cell so it does not appear in the final downloaded file
      row.getCell(7).value = null;
    }

    // Fallback to name-based fuzzy matching if no tag was found or matched
    if (!matchedRow && colAStr) {
      // Detect if this row is a Section Header or Deliverables Header (skip data matching)
      if (/^[IVX]+\.\s+/i.test(colAStr) || colAStr.toUpperCase().includes("DELIVERABLES")) {
        continue;
      }

      // Detect Category headers (skip data matching)
      const isCategoryHeader =
        row.getCell(2).value === null &&
        row.getCell(3).value === null &&
        row.getCell(4).value === null &&
        row.getCell(5).value === null &&
        row.getCell(6).value === null;

      const categoriesList = [
        "Technology Acquisition & Upgrading",
        "Innovation Fund",
        "Technology Trainings & Techno Fora",
        "Technical Consultancy Services",
        "Packaging and Labeling Design",
        "S&T Information and Referral",
        "Strategic Deliverables",
        "Non-Paying Laboratory Services",
        "S&T Promotion",
        "S&T Scholarship",
        "DATBED",
        "Networks/Linkages",
        "Functional Deliverables",
        "Support to Operations"
      ].map(cat => cleanString(cat));

      if (
        isCategoryHeader &&
        categoriesList.includes(cleanString(colAStr))
      ) {
        continue;
      }

      // Determine parent indicator for sub-program rows
      const parentIndicator = getParentIndicator(ws, i);

      // Try fuzzy matching
      matchedRow = dbRows.find((dbRow) =>
        isMatch(dbRow, colAStr, parentIndicator)
      );
    }

    if (matchedRow) {
      const matchKey = `${matchedRow.indicator}||${matchedRow.program || "N/A"}`;
      matchedDbRows.add(matchKey);

      const isPercentIndicator = isPercentageIndicator(matchedRow.indicator);
      const keepBlank = shouldKeepBlankForZero(matchedRow.category);

      const cells = [
        row.getCell(2),
        row.getCell(3),
        row.getCell(4),
        row.getCell(5),
        row.getCell(6)
      ];

      const vals = [
        matchedRow.q1_target,
        matchedRow.q2_target,
        matchedRow.q3_target,
        matchedRow.q4_target,
        matchedRow.annual_target
      ];

      cells.forEach((cell, idx) => {
        const val = vals[idx];
        
        // A cell is a percentage if the indicator name implies it, OR if the template cell itself is pre-formatted with '%'
        const isPercent = isPercentIndicator || (cell.numFmt && String(cell.numFmt).includes("%"));
        const factor = isPercent ? 100 : 1;
        const scaledVal = val / factor;

        if (scaledVal === 0 && keepBlank) {
          cell.value = null; // Keep blank for Projects Approved & Amount Funded
        } else {
          cell.value = scaledVal;
        }

        // Force font style to be non-italic (normal)
        if (cell.font) {
          cell.font = {
            ...cell.font,
            italic: false
          };
        } else {
          cell.font = { italic: false };
        }
      });
    }
  }

  // 5. Update signature block dynamically
  // Place Name exactly in Row 121, Column A (1)
  const nameCell = ws.getCell(121, 1);
  nameCell.value = preparedByName.toUpperCase();
  nameCell.font = {
    ...(nameCell.font || {}),
    bold: true,
    italic: false
  };
  nameCell.alignment = {
    horizontal: "left",
    vertical: "middle"
  };

  // Place Title exactly in Row 122, Column A (1)
  if (preparedByTitle) {
    const titleCell = ws.getCell(122, 1);
    titleCell.value = preparedByTitle;
    titleCell.font = {
      ...(titleCell.font || {}),
      bold: false,
      italic: false
    };
    titleCell.alignment = {
      horizontal: "left",
      vertical: "middle"
    };
  }

  // Debug log to browser console for verification
  console.log("Excel template mapping results:");
  console.log(`Total database rows loaded: ${dbRows.length}`);
  console.log(`Successfully matched and filled: ${matchedDbRows.size}`);
  
  if (dbRows.length > matchedDbRows.size) {
    const unmatched = dbRows.filter(
      (r) => !matchedDbRows.has(`${r.indicator}||${r.program || "N/A"}`)
    );
    console.warn("Unmatched database indicators (not found in Excel template):", unmatched);
  }

  // 6. Generate workbook and save to user
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, `DOST_CY${year}_Performance_Targets.xlsx`);
}
