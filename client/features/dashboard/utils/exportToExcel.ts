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
  value_type?: string | null;
  aggregation_type: string;
  q1_target: number;
  q2_target: number;
  q3_target: number;
  q4_target: number;
  annual_target: number;
  q1_actual?: number;
  q2_actual?: number;
  q3_actual?: number;
  q4_actual?: number;
}

interface ExportOptions {
  year: number;
  preparedByName: string;
  preparedByTitle: string;
  sheetOption?: "all" | "targets" | "q1_kpis";
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
        value_type: item.value_type || null,
        aggregation_type: item.aggregation_type || "SUM",
        q1_target: Number(item.q1_target ?? 0),
        q2_target: Number(item.q2_target ?? 0),
        q3_target: Number(item.q3_target ?? 0),
        q4_target: Number(item.q4_target ?? 0),
        annual_target: Number(item.annual_target ?? 0),
        q1_actual: 0,
        q2_actual: 0,
        q3_actual: 0,
        q4_actual: 0,
      });
    }

    const entry = groupedMap.get(key)!;
    if (item.label === "Q1") entry.q1_actual = (entry.q1_actual || 0) + Number(item.value ?? 0);
    if (item.label === "Q2") entry.q2_actual = (entry.q2_actual || 0) + Number(item.value ?? 0);
    if (item.label === "Q3") entry.q3_actual = (entry.q3_actual || 0) + Number(item.value ?? 0);
    if (item.label === "Q4") entry.q4_actual = (entry.q4_actual || 0) + Number(item.value ?? 0);
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

// ── Helper to check if a row represents a percentage ────────────────────────
function isPercentageRow(row: GridRow): boolean {
  const name = row.indicator.toLowerCase();
  const unit = row.unit ? row.unit.toLowerCase() : "";
  const vt = row.value_type ? row.value_type.toLowerCase() : "";
  return name.includes("%") || name.includes("percentage") || unit === "%" || vt === "percentage";
}

// ── Helper to format cells with/without decimals based on the numeric value ──
function applyNumberFormatting(
  cell: ExcelJS.Cell,
  scaledVal: number,
  factor: number,
  isPercent: boolean
): void {
  const originalVal = scaledVal * factor;
  const isWholeNumber = Math.abs(originalVal - Math.round(originalVal)) < 0.0001;
  let currentFmt = cell.numFmt && typeof cell.numFmt === "string" ? cell.numFmt : "";

  if (!currentFmt) {
    currentFmt = isPercent ? "#,##0.00%" : "#,##0.00";
  }

  if (isWholeNumber) {
    // Whole number: strip decimals from the formatting if present
    cell.numFmt = currentFmt.replace(/\.0+/g, "");
  } else {
    // Has decimal: ensure it has decimal formatting
    if (!currentFmt.includes(".")) {
      if (isPercent) {
        cell.numFmt = currentFmt.includes("0%") 
          ? currentFmt.replace("0%", "0.00%") 
          : "#,##0.00%";
      } else {
        cell.numFmt = currentFmt.includes("0") 
          ? currentFmt.replace(/0(?![^0]*0)/, "0.00") // Replace last zero with 0.00
          : "#,##0.00";
      }
    } else {
      cell.numFmt = currentFmt;
    }
  }
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
  const { year, preparedByName, preparedByTitle, sheetOption = "all" } = options;

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

      const isPercentRowVal = isPercentageRow(matchedRow);
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
        const isPercent = isPercentRowVal || (cell.numFmt && String(cell.numFmt).includes("%"));
        const factor = isPercent ? 100 : 1;
        const scaledVal = val / factor;

        if (scaledVal === 0 && keepBlank) {
          cell.value = null; // Keep blank for Projects Approved & Amount Funded
        } else {
          cell.value = scaledVal;
          applyNumberFormatting(cell, scaledVal, factor, isPercent);
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

  // 4b. Fill in PSTO-DO 1stQ KPIs worksheet if it exists
  const q1Sheet = workbook.getWorksheet("PSTO-DO 1stQ KPIs");
  if (q1Sheet) {
    for (let i = 1; i <= q1Sheet.rowCount; i++) {
      const row = q1Sheet.getRow(i);
      const colAVal = row.getCell(1).value;
      const colAStr = colAVal ? String(colAVal).trim() : "";

      // Read the Tag from Column J (Cell 10)
      const tagVal = row.getCell(10).value;
      const tagStr = tagVal ? String(tagVal).trim() : "";

      let matchedRow: GridRow | undefined = undefined;

      if (tagStr) {
        const lowerTag = tagStr.toLowerCase();
        if (lowerTag === "skip" || lowerTag === "ignore" || lowerTag === "blank") {
          row.getCell(10).value = null;
          continue;
        }

        const tagClean = cleanString(tagStr);
        matchedRow = dbRows.find((dbRow) => {
          const dbKeyClean = cleanString(dbRow.indicator + (dbRow.program || ""));
          return tagClean === dbKeyClean;
        });
        
        row.getCell(10).value = null; // Clear tag
      }

      if (!matchedRow && colAStr) {
        if (/^[IVX]+\.\s+/i.test(colAStr) || colAStr.toUpperCase().includes("DELIVERABLES")) {
          continue;
        }

        const isCategoryHeader =
          row.getCell(2).value === null &&
          row.getCell(3).value === null &&
          row.getCell(7).value === null;

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

        const parentIndicator = getParentIndicator(q1Sheet, i);
        matchedRow = dbRows.find((dbRow) =>
          isMatch(dbRow, colAStr, parentIndicator)
        );
      }

      if (matchedRow) {
        const isPercent = isPercentageRow(matchedRow) || 
                          (row.getCell(2).numFmt && String(row.getCell(2).numFmt).includes("%"));
        const factor = isPercent ? 100 : 1;

        // Column B: 1st Q Targets
        const q1TargetVal = matchedRow.q1_target / factor;
        row.getCell(2).value = q1TargetVal;
        applyNumberFormatting(row.getCell(2), q1TargetVal, factor, isPercent);

        // Column C: 1st Q Accomplishments
        const q1ActualVal = (matchedRow.q1_actual ?? 0) / factor;
        row.getCell(3).value = q1ActualVal;
        applyNumberFormatting(row.getCell(3), q1ActualVal, factor, isPercent);

        // Column G: Annual Target
        const annualTargetVal = matchedRow.annual_target / factor;
        row.getCell(7).value = annualTargetVal;
        applyNumberFormatting(row.getCell(7), annualTargetVal, factor, isPercent);

        // Force normal font style
        [row.getCell(2), row.getCell(3), row.getCell(7)].forEach((cell) => {
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

    // Update signature block for q1Sheet dynamically
    const q1NameCell = q1Sheet.getCell(121, 1);
    q1NameCell.value = preparedByName.toUpperCase();
    q1NameCell.font = {
      ...(q1NameCell.font || {}),
      bold: true,
      italic: false
    };
    q1NameCell.alignment = {
      horizontal: "left",
      vertical: "middle"
    };

    if (preparedByTitle) {
      const q1TitleCell = q1Sheet.getCell(122, 1);
      q1TitleCell.value = preparedByTitle;
      q1TitleCell.font = {
        ...(q1TitleCell.font || {}),
        bold: false,
        italic: false
      };
      q1TitleCell.alignment = {
        horizontal: "left",
        vertical: "middle"
      };
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

  // Remove unwanted worksheets based on selection
  if (sheetOption === "targets") {
    const q1SheetToDelete = workbook.getWorksheet("PSTO-DO 1stQ KPIs");
    if (q1SheetToDelete) {
      workbook.removeWorksheet(q1SheetToDelete.id);
    }
  } else if (sheetOption === "q1_kpis") {
    const wsToDelete = workbook.worksheets[0];
    if (wsToDelete) {
      workbook.removeWorksheet(wsToDelete.id);
    }
  }

  // 6. Generate workbook and save to user
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const filename = sheetOption === "q1_kpis" 
    ? `DOST_CY${year}_Q1_KPIs.xlsx` 
    : `DOST_CY${year}_Performance_Targets.xlsx`;

  saveAs(blob, filename);
}
