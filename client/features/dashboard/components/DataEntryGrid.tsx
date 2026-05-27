import React, { useState, useEffect, useMemo, useRef, useImperativeHandle } from "react";
import { ArrowLeft, Save, HelpCircle, Loader2, Trash2, Plus, ChevronDown, ChevronRight, RotateCcw, Search, ArrowRight, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DeleteConfirmDialog, RevertConfirmDialog, UnsavedChangesConfirmDialog } from "@/components/ui/ConfirmationDialogs";

interface GridRow {
  id: string; // unique ID for local state (can be composite key or temp ID)
  indicator_id?: string; // database UUID
  indicator: string;
  program: string | null;
  section: string;
  section_full_name: string | null;
  category: string;
  aggregation_type: string;
  unit: string | null;
  deliverable_type: string;
  
  q1_target: number;
  q1_actual: number;
  q2_target: number;
  q2_actual: number;
  q3_target: number;
  q3_actual: number;
  q4_target: number;
  q4_actual: number;
  
  annual_target: number;
  annual_actual: number;
}

export interface DataEntryGridRef {
  save: () => Promise<void>;
}

interface DataEntryGridProps {
  year: number;
  rawData: any[];
  onBack: () => void;
  onSave?: (updatedRows: any[]) => Promise<void>;
  onChangeDirty?: (isDirty: boolean) => void;
  activeQuarterTab: "ALL" | "Q1" | "Q2" | "Q3" | "Q4";
  setActiveQuarterTab: (tab: "ALL" | "Q1" | "Q2" | "Q3" | "Q4") => void;
  onSavingChange?: (saving: boolean) => void;
  readOnly?: boolean;
}

// Quarter column configuration — single source of truth for all Q1–Q4 rendering
const QUARTERS = [
  { key: "Q1" as const, targetField: "q1_target" as const, actualField: "q1_actual" as const },
  { key: "Q2" as const, targetField: "q2_target" as const, actualField: "q2_actual" as const },
  { key: "Q3" as const, targetField: "q3_target" as const, actualField: "q3_actual" as const },
  { key: "Q4" as const, targetField: "q4_target" as const, actualField: "q4_actual" as const },
] as const;

export const DataEntryGrid = React.forwardRef<DataEntryGridRef, DataEntryGridProps>(
  ({ year, rawData, onBack, onSave, onChangeDirty, activeQuarterTab, setActiveQuarterTab, onSavingChange, readOnly = false }, ref) => {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [initialRows, setInitialRows] = useState<GridRow[]>([]);
  const [deletedIndicatorIds, setDeletedIndicatorIds] = useState<string[]>([]);
  const [deletedRows, setDeletedRows] = useState<GridRow[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [reviewFilter, setReviewFilter] = useState<"all" | "added" | "removed" | "modified">("all");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewQuarter, setReviewQuarter] = useState<"all" | "q1" | "q2" | "q3" | "q4">("all");
  const [reviewFieldType, setReviewFieldType] = useState<"all" | "target" | "actual">("all");

  useEffect(() => {
    if (!showReviewDialog) {
      setReviewFilter("all");
      setReviewSearch("");
      setReviewQuarter("all");
      setReviewFieldType("all");
    }
  }, [showReviewDialog]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  // Sync saving state back to parent
  useEffect(() => {
    if (onSavingChange) {
      onSavingChange(saving);
    }
  }, [saving, onSavingChange]);

  // Sync dirty status back to parent component
  useEffect(() => {
    if (onChangeDirty) {
      onChangeDirty(isDirty);
    }
  }, [isDirty, onChangeDirty]);

  // Guard unsaved changes on window unload/reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  };

  // Shared parsing function to build rows
  const parseRawData = (data: any[]) => {
    if (!data || data.length === 0) return [];

    const groupedMap = new Map<string, GridRow>();

    data.forEach((item) => {
      const prog = item.program && item.program !== "N/A" ? item.program : null;
      const key = `${item.indicator}||${prog || "N/A"}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: key,
          indicator_id: item.indicator_id,
          indicator: item.indicator,
          program: prog,
          section: item.section,
          section_full_name: item.section_full_name || null,
          category: item.category || "Other",
          aggregation_type: item.aggregation_type || "SUM",
          unit: item.unit,
          deliverable_type: item.deliverable_type || "Functional",
          q1_target: item.q1_target ?? 0,
          q1_actual: 0,
          q2_target: item.q2_target ?? 0,
          q2_actual: 0,
          q3_target: item.q3_target ?? 0,
          q3_actual: 0,
          q4_target: item.q4_target ?? 0,
          q4_actual: 0,
          annual_target: item.annual_target ?? 0,
          annual_actual: 0,
        });
      }

      const row = groupedMap.get(key)!;
      if (item.label === "Q1") row.q1_actual = item.value ?? 0;
      if (item.label === "Q2") row.q2_actual = item.value ?? 0;
      if (item.label === "Q3") row.q3_actual = item.value ?? 0;
      if (item.label === "Q4") row.q4_actual = item.value ?? 0;
    });

    return Array.from(groupedMap.values()).map((row) => {
      const isLatest = row.aggregation_type === "LATEST";
      const isAverage = row.aggregation_type === "AVERAGE";
      if (isLatest) {
        row.annual_target = row.q4_target || row.q3_target || row.q2_target || row.q1_target || 0;
        row.annual_actual = row.q4_actual || row.q3_actual || row.q2_actual || row.q1_actual || 0;
      } else if (isAverage) {
        row.annual_target = (row.q1_target + row.q2_target + row.q3_target + row.q4_target) / 4;
        row.annual_actual = (row.q1_actual + row.q2_actual + row.q3_actual + row.q4_actual) / 4;
      } else {
        row.annual_target = row.q1_target + row.q2_target + row.q3_target + row.q4_target;
        row.annual_actual = row.q1_actual + row.q2_actual + row.q3_actual + row.q4_actual;
      }
      return row;
    });
  };

  // Parse raw data on mount or data changes
  useEffect(() => {
    const parsed = parseRawData(rawData);
    setRows(parsed);
    setInitialRows(JSON.parse(JSON.stringify(parsed)));
  }, [rawData]);

  const handleRevert = () => {
    setShowRevertDialog(true);
  };

  const executeRevert = () => {
    setRows(JSON.parse(JSON.stringify(initialRows)));
    setDeletedIndicatorIds([]);
    setDeletedRows([]);
    setIsDirty(false);
    setShowRevertDialog(false);
    toast.info("All changes reverted back to saved state.");
  };

  const isRowModified = (currentRow: GridRow) => {
    if (currentRow.id.startsWith("temp-")) return true;
    const original = initialRows.find((r) => r.id === currentRow.id);
    if (!original) return false;
    return (
      currentRow.indicator !== original.indicator ||
      currentRow.program !== original.program ||
      currentRow.q1_target !== original.q1_target ||
      currentRow.q1_actual !== original.q1_actual ||
      currentRow.q2_target !== original.q2_target ||
      currentRow.q2_actual !== original.q2_actual ||
      currentRow.q3_target !== original.q3_target ||
      currentRow.q3_actual !== original.q3_actual ||
      currentRow.q4_target !== original.q4_target ||
      currentRow.q4_actual !== original.q4_actual
    );
  };

  // Handle cell input change (both numeric targets/actuals and text indicator/program names)
  const handleCellChange = (
    rowId: string,
    field: "q1_target" | "q1_actual" | "q2_target" | "q2_actual" | "q3_target" | "q3_actual" | "q4_target" | "q4_actual" | "indicator" | "program",
    valStr: string
  ) => {
    setIsDirty(true);
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== rowId) return row;

        const updated = { ...row };
        if (field === "indicator" || field === "program") {
          updated[field] = valStr;
        } else {
          const cleanStr = valStr.replace(/[^0-9.-]/g, "");
          const val = cleanStr === "" ? 0 : parseFloat(cleanStr);
          if (isNaN(val)) return row;
          updated[field] = val;

          const isLatest = updated.aggregation_type === "LATEST";
          const isAverage = updated.aggregation_type === "AVERAGE";
          if (isLatest) {
            updated.annual_target =
              updated.q4_target || updated.q3_target || updated.q2_target || updated.q1_target || 0;
            updated.annual_actual =
              updated.q4_actual || updated.q3_actual || updated.q2_actual || updated.q1_actual || 0;
          } else if (isAverage) {
            updated.annual_target =
              (updated.q1_target + updated.q2_target + updated.q3_target + updated.q4_target) / 4;
            updated.annual_actual =
              (updated.q1_actual + updated.q2_actual + updated.q3_actual + updated.q4_actual) / 4;
          } else {
            updated.annual_target =
              updated.q1_target + updated.q2_target + updated.q3_target + updated.q4_target;
            updated.annual_actual =
              updated.q1_actual + updated.q2_actual + updated.q3_actual + updated.q4_actual;
          }
        }

        return updated;
      })
    );
  };

  const handleAddRow = (sectionName: string, categoryName: string) => {
    const newRowId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const existingRow = rows.find((r) => r.section === sectionName);
    const newRow: GridRow = {
      id: newRowId,
      indicator: "New Strategic Indicator",
      program: "",
      section: sectionName,
      section_full_name: existingRow ? existingRow.section_full_name : null,
      category: categoryName,
      aggregation_type: "SUM",
      unit: null,
      deliverable_type: "Strategic",
      q1_target: 0,
      q1_actual: 0,
      q2_target: 0,
      q2_actual: 0,
      q3_target: 0,
      q3_actual: 0,
      q4_target: 0,
      q4_actual: 0,
      annual_target: 0,
      annual_actual: 0,
    };
    setRows((prev) => [...prev, newRow]);
    setIsDirty(true);
    toast.success("Added new Strategic Deliverable row!");
  };

  const handleDeleteRow = (id: string) => {
    const target = rows.find((r) => r.id === id);
    if (target) {
      if (target.indicator_id && !id.startsWith("temp-")) {
        setDeletedIndicatorIds((prev) => [...prev, target.indicator_id!]);
      }
      setDeletedRows((prev) => [...prev, target]);
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setIsDirty(true);
    toast.info("Removed Strategic Deliverable row.");
  };

  // Group rows hierarchically for rendering: Section -> Category -> Rows
  const sectionsData = useMemo(() => {
    const sections: Record<string, Record<string, GridRow[]>> = {};

    rows.forEach((row) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesIndicator = row.indicator.toLowerCase().includes(query);
        const matchesProgram = (row.program || "").toLowerCase().includes(query);
        const matchesCategory = (row.category || "").toLowerCase().includes(query);
        if (!matchesIndicator && !matchesProgram && !matchesCategory) {
          return;
        }
      }

      if (!sections[row.section]) sections[row.section] = {};
      if (!sections[row.section][row.category]) sections[row.section][row.category] = [];
      sections[row.section][row.category].push(row);
    });

    return sections;
  }, [rows, searchQuery]);

  const sectionNames = useMemo(() => {
    return Object.keys(sectionsData).sort();
  }, [sectionsData]);

  useEffect(() => {
    if (sectionNames.length > 0 && !activeSection) {
      setActiveSection(sectionNames[0]);
    }
  }, [sectionNames, activeSection]);

  const toggleCategory = (section: string, category: string) => {
    const key = `${section}||${category}`;
    setCollapsedCategories((prev) => {
      const categories = Object.keys(sectionsData[section] || {});
      const isFirst = categories[0] === category;
      const defaultCollapsed = !isFirst;
      const current = prev[key] ?? defaultCollapsed;
      return {
        ...prev,
        [key]: !current,
      };
    });
  };

  const handleCollapseAll = () => {
    if (!activeSection) return;
    const categories = Object.keys(sectionsData[activeSection] || {});
    const newCollapsed = { ...collapsedCategories };
    categories.forEach((catName) => {
      newCollapsed[`${activeSection}||${catName}`] = true;
    });
    setCollapsedCategories(newCollapsed);
  };

  const handleExpandAll = () => {
    if (!activeSection) return;
    const categories = Object.keys(sectionsData[activeSection] || {});
    const newCollapsed = { ...collapsedCategories };
    categories.forEach((catName) => {
      newCollapsed[`${activeSection}||${catName}`] = false;
    });
    setCollapsedCategories(newCollapsed);
  };

  // Order columns list for arrow navigation:
  const COL_FIELDS = useMemo(() => {
    if (activeQuarterTab === "Q1") return ["q1_actual"];
    if (activeQuarterTab === "Q2") return ["q2_actual"];
    if (activeQuarterTab === "Q3") return ["q3_actual"];
    if (activeQuarterTab === "Q4") return ["q4_actual"];
    return [
      "q1_target",
      "q2_target",
      "q3_target",
      "q4_target",
    ];
  }, [activeQuarterTab]);

  // Handle cell navigation (Arrow Keys & Enter)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentRowIndex: number,
    currentColIndex: number,
    sectionRows: GridRow[]
  ) => {
    let targetRowIndex = currentRowIndex;
    let targetColIndex = currentColIndex;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIdx = currentRowIndex - 1;
      if (nextIdx >= 0) targetRowIndex = nextIdx;
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      const nextIdx = currentRowIndex + 1;
      if (nextIdx < sectionRows.length) targetRowIndex = nextIdx;
    } else if (e.key === "ArrowLeft") {
      // Navigate left if caret is at the beginning of the input
      const selectionStart = e.currentTarget.selectionStart;
      if (selectionStart === 0) {
        e.preventDefault();
        targetColIndex = Math.max(0, currentColIndex - 1);
      }
    } else if (e.key === "ArrowRight") {
      // Navigate right if caret is at the end of the input
      const selectionEnd = e.currentTarget.selectionEnd;
      if (selectionEnd === e.currentTarget.value.length) {
        e.preventDefault();
        targetColIndex = Math.min(COL_FIELDS.length - 1, currentColIndex + 1);
      }
    } else {
      return; // Do nothing for other keys
    }

    const nextRow = sectionRows[targetRowIndex];
    if (nextRow) {
      const nextField = COL_FIELDS[targetColIndex];
      const nextRefKey = `${nextRow.id}-${nextField}`;
      const nextInput = inputRefs.current[nextRefKey];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const getRowDiff = (currentRow: GridRow) => {
    const original = initialRows.find((r) => r.id === currentRow.id);
    if (!original) return [];
    const diffs: { 
      field: string; 
      oldVal: string | number; 
      newVal: string | number;
      quarter: "q1" | "q2" | "q3" | "q4" | "all";
      type: "target" | "actual" | "name" | "program" | "all";
      targetVal?: number;
    }[] = [];

    if (currentRow.indicator !== original.indicator) {
      diffs.push({ 
        field: "Name", 
        oldVal: original.indicator, 
        newVal: currentRow.indicator, 
        quarter: "all", 
        type: "name" 
      });
    }
    if (currentRow.program !== original.program) {
      diffs.push({ 
        field: "Program", 
        oldVal: original.program || "N/A", 
        newVal: currentRow.program || "N/A", 
        quarter: "all", 
        type: "program" 
      });
    }
    
    const checkField = (
      field: "q1_target" | "q1_actual" | "q2_target" | "q2_actual" | "q3_target" | "q3_actual" | "q4_target" | "q4_actual", 
      label: string,
      quarter: "q1" | "q2" | "q3" | "q4",
      type: "target" | "actual"
    ) => {
      if (currentRow[field] !== original[field]) {
        let targetVal: number | undefined = undefined;
        if (type === "actual") {
          const targetField = `${quarter}_target` as "q1_target" | "q2_target" | "q3_target" | "q4_target";
          targetVal = currentRow[targetField];
        }

        diffs.push({ 
          field: label, 
          oldVal: original[field] ?? 0, 
          newVal: currentRow[field] ?? 0,
          quarter,
          type,
          targetVal
        });
      }
    };

    checkField("q1_target", "Q1 Target", "q1", "target");
    checkField("q1_actual", "Q1 Accomplishment", "q1", "actual");
    checkField("q2_target", "Q2 Target", "q2", "target");
    checkField("q2_actual", "Q2 Accomplishment", "q2", "actual");
    checkField("q3_target", "Q3 Target", "q3", "target");
    checkField("q3_actual", "Q3 Accomplishment", "q3", "actual");
    checkField("q4_target", "Q4 Target", "q4", "target");
    checkField("q4_actual", "Q4 Accomplishment", "q4", "actual");

    return diffs;
  };

  const modifiedRowsList = useMemo(() => {
    return rows.filter((r) => isRowModified(r) && !r.id.startsWith("temp-"));
  }, [rows, initialRows]);

  const newRowsList = useMemo(() => {
    return rows.filter((r) => r.id.startsWith("temp-"));
  }, [rows]);

  const deletedRowsList = useMemo(() => {
    return deletedRows;
  }, [deletedRows]);

  const filteredNewRowsList = useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    if (!query) return newRowsList;
    return newRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );
  }, [newRowsList, reviewSearch]);

  const filteredDeletedRowsList = useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    if (!query) return deletedRowsList;
    return deletedRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );
  }, [deletedRowsList, reviewSearch]);

  const filteredModifiedRowsList = useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    
    // First filter by search query
    const searchFiltered = modifiedRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );

    // If reviewQuarter or reviewFieldType is not 'all', we further filter out indicators
    // that don't have any diffs matching the filters
    if (reviewQuarter === 'all' && reviewFieldType === 'all') {
      return searchFiltered;
    }

    return searchFiltered.filter((row) => {
      const diffs = getRowDiff(row);
      return diffs.some((diff) => {
        if (reviewQuarter !== 'all' && diff.quarter !== 'all' && diff.quarter !== reviewQuarter) {
          return false;
        }
        if (reviewFieldType !== 'all' && diff.type !== 'all' && diff.type !== reviewFieldType) {
          return false;
        }
        return true;
      });
    });
  }, [modifiedRowsList, reviewSearch, reviewQuarter, reviewFieldType, initialRows]);

  const executeSave = async () => {
    const modifiedRows = rows.filter(isRowModified);
    try {
      setSaving(true);
      await (onSave as any)(modifiedRows, deletedIndicatorIds);
      toast.success("Grid accomplishments and targets saved successfully!");
      setIsDirty(false);
      setDeletedIndicatorIds([]);
      setDeletedRows([]);
      setShowReviewDialog(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save data entry grid changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const hasNegative = rows.some((row) => 
      row.q1_target < 0 || row.q1_actual < 0 ||
      row.q2_target < 0 || row.q2_actual < 0 ||
      row.q3_target < 0 || row.q3_actual < 0 ||
      row.q4_target < 0 || row.q4_actual < 0
    );

    if (hasNegative) {
      toast.error("Cannot save: Negative values are not allowed in targets or accomplishments.");
      return;
    }

    const modifiedRows = rows.filter(isRowModified);

    // If nothing changed and nothing was deleted, we can succeed immediately!
    if (modifiedRows.length === 0 && deletedIndicatorIds.length === 0) {
      toast.success("No changes detected. Everything is up to date!");
      setIsDirty(false);
      return;
    }

    if (!onSave) {
      toast.success("UI Demo Mode: Simulated save changes successfully!");
      setIsDirty(false);
      return;
    }

    setShowReviewDialog(true);
  };

  // Helper function to resolve visual class name of input fields including validation states
  const getInputClass = (val: number) => {
    if (val < 0) {
      return "w-full h-8 px-2 text-right bg-destructive/15 text-destructive border-2 border-destructive focus:ring-destructive focus:outline-none font-extrabold text-xs transition-colors";
    }
    return "w-full h-8 px-2 text-right bg-transparent hover:bg-muted/15 focus:bg-background border-0 focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all duration-150 font-semibold text-foreground text-xs";
  };

  const renderCategoryBlock = (sectionName: string, categoryName: string, categoryRows: any[], isFirstCategory: boolean) => {
    const isStrategicCategory = categoryRows[0]?.deliverable_type === "Strategic";
    const isCollapsed = collapsedCategories[`${sectionName}||${categoryName}`] ?? !isFirstCategory;
    const displayCategoryName = categoryName.toLowerCase() === "strategic deliverables"
      ? "Stratefic Delievrables"
      : categoryName;

    return (
      <div key={categoryName} className="group/category">
        {/* Category Header */}
        <div 
          className={`${
            isStrategicCategory
              ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] hover:bg-indigo-500/[0.09] border-b border-indigo-500/15"
              : "bg-muted/30 hover:bg-muted/50 border-b border-border/60"
          } px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors`}
          onClick={() => toggleCategory(sectionName, categoryName)}
        >
          <div className="flex items-center gap-2">
            <span className={`${
              isStrategicCategory ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground"
            } transition-transform duration-200`}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
            <h4 className={`text-sm font-extrabold uppercase tracking-wide ${
              isStrategicCategory ? "text-indigo-600 dark:text-indigo-450 font-black" : "text-foreground"
            }`}>{displayCategoryName}</h4>
            {isStrategicCategory && (
              <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider ml-2 shrink-0 select-none">
                Editable
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3.5" onClick={(e) => e.stopPropagation()}>
            <span className={`text-xs font-medium ${
              isStrategicCategory ? "text-indigo-500/80 dark:text-indigo-400/80" : "text-muted-foreground"
            }`}>
              {categoryRows.length} indicator{categoryRows.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Category Table Body */}
        {!isCollapsed && (
          <div className="overflow-x-auto p-3 bg-muted/5">
            <table className="w-full text-xs border-separate [border-spacing:0_6px] table-fixed">
              <thead>
                <tr className="text-primary-foreground text-[10px] uppercase tracking-wider bg-primary font-bold text-left">
                  <th className={`py-1.5 px-3 font-extrabold text-primary-foreground border border-black dark:border-zinc-600 rounded-l-md ${activeQuarterTab === "ALL" ? "w-[26%]" : "w-[36%]"}`}>Performance Indicator</th>
                  <th className="py-1.5 px-3 w-[6%] font-extrabold text-primary-foreground border border-black dark:border-zinc-600 text-center">Prog.</th>
                  
                  {QUARTERS.map(({ key }) => (
                    (activeQuarterTab === "ALL" || activeQuarterTab === key) && (
                      <React.Fragment key={key}>
                        <th className={`py-1 px-2 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground ${activeQuarterTab === "ALL" ? "w-[10%]" : "w-[20%]"}`}>{key} Target</th>
                        {activeQuarterTab === key && (
                          <th className="py-1 px-2 w-[20%] font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-red/90 text-primary-foreground">{key} Accomplishment</th>
                        )}
                      </React.Fragment>
                    )
                  ))}
                  
                  <th className="py-1 px-2 w-[14%] font-black text-center border border-black dark:border-zinc-600 bg-primary-foreground/10 text-primary-foreground">Annual Target</th>
                  <th className="py-1 px-2 w-[4%] font-extrabold text-center border border-black dark:border-zinc-600 rounded-r-md"></th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row, idx) => {
                  const isEditable = row.deliverable_type === "Strategic";
                  const isFocused = focusedRowId === row.id;
                  const isModified = isRowModified(row);
                  return (
                    <tr
                      key={row.id}
                      onFocus={() => setFocusedRowId(row.id)}
                      onBlur={() => setFocusedRowId(null)}
                      className={`transition-all duration-200 group ${
                        isFocused
                          ? "bg-primary/[0.06] dark:bg-primary/[0.08]"
                          : isModified
                            ? "bg-orange-500/[0.07] dark:bg-orange-500/[0.12] hover:bg-orange-500/[0.15]"
                            : isStrategicCategory
                              ? "odd:bg-indigo-500/[0.02] even:bg-indigo-500/[0.06] dark:odd:bg-slate-900/30 dark:even:bg-indigo-950/20 hover:bg-indigo-500/10 dark:hover:bg-indigo-950/40"
                              : "odd:bg-blue-50/50 even:bg-blue-100/60 dark:odd:bg-slate-900/40 dark:even:bg-blue-950/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/30"
                      }`}
                    >
                      {/* Performance Indicator */}
                      <td 
                        title={isModified ? "Unsaved Changes" : undefined}
                        className={`p-1 font-medium text-foreground rounded-l-md max-w-[200px] border-y border-r border-black dark:border-zinc-600 ${
                          isModified 
                            ? "border-l-4 border-l-orange-500 pl-1.5" 
                            : "border-l border-l-black dark:border-l-zinc-600"
                        }`}
                      >
                        {isEditable ? (
                          <input
                            type="text"
                            className="w-full h-8 px-2 text-left bg-transparent focus:bg-background border-0 focus:ring-1 focus:ring-primary focus:outline-none rounded transition-colors font-medium text-foreground text-xs disabled:opacity-85"
                            value={row.indicator}
                            onChange={(e) => handleCellChange(row.id, "indicator", e.target.value)}
                            placeholder="Enter indicator name..."
                            disabled={readOnly}
                          />
                        ) : (
                          <div className="px-2 py-1 truncate font-medium text-foreground text-xs" title={row.indicator}>
                            {row.indicator}
                          </div>
                        )}
                      </td>
                      {/* Program */}
                      <td className="p-1 text-center border border-black dark:border-zinc-600">
                        {isEditable ? (
                          <input
                            type="text"
                            className="w-full h-8 px-2 text-center bg-transparent focus:bg-background border-0 focus:ring-1 focus:ring-primary focus:outline-none rounded transition-colors font-bold text-muted-foreground text-xs disabled:opacity-85"
                            value={row.program || ""}
                            onChange={(e) => handleCellChange(row.id, "program", e.target.value)}
                            placeholder="N/A"
                            disabled={readOnly}
                          />
                        ) : (
                          <div className="px-2 py-1 font-bold text-muted-foreground text-xs">
                            {row.program || "-"}
                          </div>
                        )}
                      </td>

                      {/* Quarterly Target & Actual Columns */}
                      {QUARTERS.map(({ key, targetField, actualField }) => (
                        (activeQuarterTab === "ALL" || activeQuarterTab === key) && (
                          <React.Fragment key={key}>
                            {activeQuarterTab === "ALL" ? (
                              <td className="p-0 border border-black dark:border-zinc-600 bg-dost-blue/5 hover:bg-dost-blue/10">
                                <input
                                  ref={(el) => (inputRefs.current[`${row.id}-${targetField}`] = el)}
                                  type="number"
                                  className={getInputClass(row[targetField])}
                                  value={row[targetField] || ""}
                                  onChange={(e) => handleCellChange(row.id, targetField, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, idx, COL_FIELDS.indexOf(targetField), categoryRows)}
                                  placeholder="0"
                                  disabled={readOnly}
                                />
                              </td>
                            ) : (
                              <td className="py-1.5 px-3 text-right border border-black dark:border-zinc-600 bg-muted/10 text-muted-foreground select-none font-semibold">
                                {row[targetField].toLocaleString()}
                              </td>
                            )}
                            {activeQuarterTab === key && (
                              <td className="p-0 border border-black dark:border-zinc-600 bg-dost-red/5 hover:bg-dost-red/10">
                                <input
                                  ref={(el) => (inputRefs.current[`${row.id}-${actualField}`] = el)}
                                  type="number"
                                  className={getInputClass(row[actualField])}
                                  value={row[actualField] || ""}
                                  onChange={(e) => handleCellChange(row.id, actualField, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, idx, COL_FIELDS.indexOf(actualField), categoryRows)}
                                  placeholder="0"
                                  disabled={readOnly}
                                />
                              </td>
                            )}
                          </React.Fragment>
                        )
                      ))}

                      {/* Annual Target Formula with Muted Zeros logic */}
                      <td className={`py-1.5 px-3 text-right border border-black dark:border-zinc-600 bg-blue-200/30 dark:bg-blue-900/20 select-none ${
                        row.annual_target === 0 ? "text-muted-foreground/35 font-medium" : "text-foreground font-extrabold"
                      }`}>
                        {row.annual_target.toLocaleString()}
                      </td>
                      {/* Actions Column (Delete button for Strategic rows) */}
                      <td className="p-1 text-center border border-black dark:border-zinc-600 rounded-r-md">
                        {isEditable && !readOnly && (
                          <button
                            onClick={() => setDeleteConfirmId(row.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Strategic Indicator"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {isStrategicCategory && !readOnly && (
                  <tr>
                    <td 
                      colSpan={activeQuarterTab === "ALL" ? 8 : 6} 
                      className="p-2 border border-black dark:border-zinc-600 rounded-b-md bg-transparent text-center"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddRow(sectionName, categoryName);
                        }}
                        className="mx-auto w-fit px-6 h-8 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all duration-200 shadow-md shadow-emerald-600/10 border border-emerald-700/30"
                      >
                        <Plus className="h-4 w-4 text-white" /> Add Strategic Indicator
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isDirty ? "pb-36" : "pb-12"}`}>
      {/* Section Navigation Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
        {sectionNames.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {sectionNames.map((secName) => {
              const isActive = activeSection === secName;
              return (
                <button
                  key={secName}
                  onClick={() => setActiveSection(secName)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-card border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {secName}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Indicators Search Input */}
        <div className="relative w-full md:w-72 shrink-0 md:ml-auto flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Search indicators or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-10 text-xs bg-card border border-border/60 rounded-lg placeholder-muted-foreground/60 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 hover:text-foreground text-[10px] text-muted-foreground font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Status Helper Description & Help Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Helper Banner */}
        <div className="md:col-span-2 text-[11px] font-bold text-muted-foreground/80 bg-muted/20 border border-border/30 rounded-xl p-3 flex flex-col gap-1 justify-center">
          <div>
            {activeQuarterTab === "ALL"
              ? "All Quarters Planning Mode: Edit target values across the entire year. Select Q1-Q4 to report accomplishments."
              : `${activeQuarterTab} Accomplishment Mode: Input accomplishments achieved. Target fields remain editable.`}
          </div>
          <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-amber-500/70" />
            <span>Directly input targets and accomplishments. Formulas recalculate automatically. Use Arrow keys / Enter to navigate cells.</span>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="text-[10px] font-semibold text-muted-foreground bg-muted/25 border border-border/35 rounded-xl p-3 flex items-center justify-around gap-2">
          <div className="flex items-center gap-1.5">
            <span><strong>Functional:</strong> Standard Metrics (Locked)</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-border/40 pl-3">
            <span><strong>Strategic:</strong> Custom Metrics (Editable)</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Tables */}
      <div className="space-y-8">
        {Object.entries(sectionsData)
          .filter(([sectionName]) => !activeSection || sectionName === activeSection)
          .map(([sectionName, categories]) => {
            const categoriesList = Object.entries(categories);
            const firstStrategicIdx = categoriesList.findIndex(([_, rows]) => rows[0]?.deliverable_type === "Strategic");
            
            // Resolve the section's full name from database row data dynamically
            const firstCategoryRows = categoriesList[0]?.[1] || [];
            const subHeader = firstCategoryRows[0]?.section_full_name || sectionName;

            return (
              <div key={sectionName} className="space-y-4">
                {/* Redesigned Section Subheader Banner - Removes redundant Section title label */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border/40">
                  <div className="space-y-0.5">
                    {subHeader ? (
                      <div className="text-[11px] font-extrabold text-black dark:text-white uppercase tracking-wide leading-relaxed max-w-4xl">
                        {subHeader}
                      </div>
                    ) : (
                      <div className="text-[11px] font-extrabold text-black dark:text-white uppercase tracking-wide">
                        {sectionName}
                      </div>
                    )}
                  </div>
                  
                  {/* Global Expand/Collapse for active section */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      onClick={handleExpandAll}
                    >
                      Expand All
                    </Button>
                    <span className="text-muted-foreground/30 text-xs">|</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      onClick={handleCollapseAll}
                    >
                      Collapse All
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {categoriesList.length > 0 && (
                    <Card className="bg-card border-border overflow-hidden shadow-sm">
                      <div className="divide-y divide-border">
                        {categoriesList.map(([categoryName, categoryRows], index) => 
                          renderCategoryBlock(sectionName, categoryName, categoryRows, index === 0)
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Floating Save Banner */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg bg-background/95 dark:bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-foreground">
              You have unsaved changes on this sheet.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 gap-1"
              onClick={handleRevert}
            >
              <RotateCcw className="h-3 w-3" /> Revert
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Review Changes Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-3xl border-border bg-card shadow-2xl rounded-xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b border-border/40 pb-3 flex-shrink-0">
            <DialogTitle className="text-lg font-black tracking-wide uppercase text-foreground flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Review Unsaved Changes
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Please inspect the changes you made to this performance sheet before updating the database.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-muted/10 border border-border/30 rounded-xl p-3 flex-shrink-0 mt-3">
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setReviewFilter('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  reviewFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                All
                <span className={`px-1.5 py-0.25 text-[9px] rounded-full font-black ${
                  reviewFilter === 'all'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted-foreground/15 text-muted-foreground'
                }`}>
                  {newRowsList.length + deletedRowsList.length + modifiedRowsList.length}
                </span>
              </button>

              <button
                onClick={() => setReviewFilter('added')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  reviewFilter === 'added'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'hover:bg-emerald-500/10 text-emerald-500'
                }`}
              >
                Added
                <span className={`px-1.5 py-0.25 text-[9px] rounded-full font-black ${
                  reviewFilter === 'added'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  {newRowsList.length}
                </span>
              </button>

              <button
                onClick={() => setReviewFilter('removed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  reviewFilter === 'removed'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'hover:bg-rose-500/10 text-rose-500'
                }`}
              >
                Removed
                <span className={`px-1.5 py-0.25 text-[9px] rounded-full font-black ${
                  reviewFilter === 'removed'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-500/15 text-rose-500'
                }`}>
                  {deletedRowsList.length}
                </span>
              </button>

              <button
                onClick={() => setReviewFilter('modified')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  reviewFilter === 'modified'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'hover:bg-sky-500/10 text-sky-500'
                }`}
              >
                Modified
                <span className={`px-1.5 py-0.25 text-[9px] rounded-full font-black ${
                  reviewFilter === 'modified'
                    ? 'bg-white/20 text-white'
                    : 'bg-sky-500/15 text-sky-500'
                }`}>
                  {modifiedRowsList.length}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
              <select
                value={reviewQuarter}
                onChange={(e) => setReviewQuarter(e.target.value as any)}
                className="bg-card border border-border/80 hover:border-border rounded-lg text-xs text-foreground px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer font-bold h-9"
              >
                <option value="all">All Quarters</option>
                <option value="q1">Q1 Changes</option>
                <option value="q2">Q2 Changes</option>
                <option value="q3">Q3 Changes</option>
                <option value="q4">Q4 Changes</option>
              </select>

              <select
                value={reviewFieldType}
                onChange={(e) => setReviewFieldType(e.target.value as any)}
                className="bg-card border border-border/80 hover:border-border rounded-lg text-xs text-foreground px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer font-bold h-9"
              >
                <option value="all">All Fields</option>
                <option value="target">Targets Only</option>
                <option value="actual">Accomplishments</option>
              </select>

              <div className="relative w-full sm:w-40 shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Search indicator..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-card border border-border/80 hover:border-border rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-9"
                />
              </div>
            </div>
          </div>

          {/* Change List */}
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-5 my-2 max-h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sky-500/25 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-sky-500/45">
            {/* Added Indicators */}
            {(reviewFilter === 'all' || reviewFilter === 'added') && filteredNewRowsList.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md inline-block">
                  Added Indicators ({filteredNewRowsList.length})
                </h5>
                <ul className="divide-y divide-border/30 bg-muted/10 border border-border/30 rounded-lg overflow-hidden">
                  {filteredNewRowsList.map((row) => (
                    <li key={row.id} className="p-3 text-xs flex justify-between items-center gap-4">
                      <div>
                        <span className="font-extrabold text-foreground">{row.indicator}</span>
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                          {row.section} • {row.category}
                        </div>
                      </div>
                      {row.program && (
                        <span className="text-[9px] font-black uppercase bg-card border border-border/80 px-2 py-0.5 rounded text-muted-foreground shrink-0">
                          {row.program}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Removed Indicators */}
            {(reviewFilter === 'all' || reviewFilter === 'removed') && filteredDeletedRowsList.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-md inline-block">
                  Removed Indicators ({filteredDeletedRowsList.length})
                </h5>
                <ul className="divide-y divide-border/30 bg-muted/10 border border-border/30 rounded-lg overflow-hidden">
                  {filteredDeletedRowsList.map((row) => (
                    <li key={row.id} className="p-3 text-xs flex justify-between items-center gap-4">
                      <div>
                        <span className="font-bold text-muted-foreground line-through">{row.indicator}</span>
                        <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {row.section} • {row.category}
                        </div>
                      </div>
                      {row.program && (
                        <span className="text-[9px] font-bold bg-card border border-border/40 px-2 py-0.5 rounded text-muted-foreground/60 line-through shrink-0">
                          {row.program}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modified Values */}
            {(reviewFilter === 'all' || reviewFilter === 'modified') && filteredModifiedRowsList.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-md inline-block">
                  Modified Values ({filteredModifiedRowsList.length})
                </h5>
                <div className="border border-border/40 rounded-lg overflow-hidden bg-card shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="p-3 w-[50%]">Performance Indicator</th>
                          <th className="p-3 w-[20%]">Field</th>
                          <th className="p-3 w-[15%] text-right">Before</th>
                          <th className="p-3 w-[15%] text-right">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 text-xs">
                        {filteredModifiedRowsList.map((row) => {
                          const rawDiffs = getRowDiff(row);
                          const diffs = rawDiffs.filter((diff) => {
                            if (reviewQuarter !== 'all' && diff.quarter !== 'all' && diff.quarter !== reviewQuarter) {
                              return false;
                            }
                            if (reviewFieldType !== 'all' && diff.type !== 'all' && diff.type !== reviewFieldType) {
                              return false;
                            }
                            return true;
                          });
                          if (diffs.length === 0) return null;
                          return diffs.map((diff, idx) => (
                            <tr key={`${row.id}-${idx}`} className="hover:bg-muted/5">
                              {idx === 0 && (
                                <td 
                                  className="p-3 align-top font-semibold text-foreground border-r border-border/20" 
                                  rowSpan={diffs.length}
                                >
                                  <div className="font-extrabold text-foreground text-xs leading-normal">
                                    {row.indicator}
                                  </div>
                                  <div className="flex gap-1.5 mt-1 items-center">
                                    <span className="text-[8px] font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/40">
                                      {row.deliverable_type}
                                    </span>
                                    {row.program && (
                                      <span className="text-[8px] font-extrabold uppercase bg-card border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground">
                                        {row.program}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="p-3 font-medium text-muted-foreground align-middle border-r border-border/20">
                                <div className="flex flex-col">
                                  <span>{diff.field}</span>
                                  {diff.targetVal !== undefined && (
                                    <span className="text-[10px] text-muted-foreground/60 mt-0.5 font-bold">
                                      Target: {diff.targetVal}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right text-rose-400 font-mono font-medium line-through bg-rose-500/5 align-middle border-r border-border/20">
                                {diff.oldVal}
                              </td>
                              <td className="p-3 text-right text-emerald-400 font-mono font-semibold bg-emerald-500/5 align-middle">
                                {diff.newVal}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {((reviewFilter === 'all' && filteredNewRowsList.length === 0 && filteredDeletedRowsList.length === 0 && filteredModifiedRowsList.length === 0) ||
              (reviewFilter === 'added' && filteredNewRowsList.length === 0) ||
              (reviewFilter === 'removed' && filteredDeletedRowsList.length === 0) ||
              (reviewFilter === 'modified' && filteredModifiedRowsList.length === 0)) && (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border/50 rounded-xl bg-muted/5 text-center">
                <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-bold text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                  {reviewSearch ? `We couldn't find any changes matching "${reviewSearch}"` : "No changes recorded in this category"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 flex-shrink-0 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewDialog(false)}
              className="h-9 px-4 text-xs font-bold border-border/60 hover:bg-muted/50 text-foreground"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={executeSave}
              className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-md shadow-primary/10"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Confirm & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog for Strategic Metrics */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
        indicatorTitle={rows.find((r) => r.id === deleteConfirmId)?.indicator || ""}
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDeleteRow(deleteConfirmId);
          }
        }}
      />

      {/* Revert Confirmation Dialog */}
      <RevertConfirmDialog
        isOpen={showRevertDialog}
        onOpenChange={setShowRevertDialog}
        onConfirm={executeRevert}
      />

      {/* Discard & Go Back Confirmation Dialog */}
      <UnsavedChangesConfirmDialog
        isOpen={showBackDialog}
        onOpenChange={setShowBackDialog}
        onConfirm={onBack}
      />
    </div>
  );
});

DataEntryGrid.displayName = "DataEntryGrid";

