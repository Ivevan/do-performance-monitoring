import React from "react";
import { Trash2, RotateCcw, Edit3, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  indicatorTitle: string;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  indicatorTitle,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-2xl rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-black text-base uppercase tracking-wider">
            <Trash2 className="h-5 w-5 text-destructive" />
            Confirm Delete Metric
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs pt-1.5 leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground">"{indicatorTitle}"</strong>? This will remove the indicator and all its accomplishments and targets from this sheet.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold border-border/60 hover:bg-muted/50 h-9 px-4 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground h-9 px-4 rounded-lg gap-1.5 shadow-md shadow-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Metric
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RevertConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RevertConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: RevertConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-2xl rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500 dark:text-orange-450 font-black text-base uppercase tracking-wider">
            <RotateCcw className="h-5 w-5 text-orange-500 dark:text-orange-450" />
            Discard Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs pt-1.5 leading-relaxed">
            Are you sure you want to discard all your unsaved changes? Any edits you made in the table will be lost and reset to the original values.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold border-border/60 hover:bg-muted/50 h-9 px-4 rounded-lg"
          >
            Keep Editing
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-xs font-bold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white h-9 px-4 rounded-lg gap-1.5 shadow-md shadow-orange-500/15"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UnsavedChangesConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UnsavedChangesConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: UnsavedChangesConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-2xl rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500 dark:text-orange-450 font-black text-base uppercase tracking-wider">
            <RotateCcw className="h-5 w-5 text-orange-500 dark:text-orange-450" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs pt-1.5 leading-relaxed">
            You have unsaved changes. Are you sure you want to go back and discard them?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold border-border/60 hover:bg-muted/50 h-9 px-4 rounded-lg"
          >
            Keep Editing
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-xs font-bold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white h-9 px-4 rounded-lg gap-1.5 shadow-md shadow-orange-500/15"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard & Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReviewChangesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  saving: boolean;
  newRowsList: any[];
  deletedRowsList: any[];
  modifiedRowsList: any[];
  getRowDiff: (row: any) => {
    field: string;
    oldVal: string | number;
    newVal: string | number;
    quarter: "q1" | "q2" | "q3" | "q4" | "all";
    type: "target" | "actual" | "name" | "program" | "all";
    targetVal?: number;
  }[];
}

export function ReviewChangesDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  saving,
  newRowsList,
  deletedRowsList,
  modifiedRowsList,
  getRowDiff,
}: ReviewChangesDialogProps) {
  // Compute visible rows that actually have diffs
  const visibleModifiedRows = React.useMemo(() => {
    return modifiedRowsList.filter(row => {
      const diffs = getRowDiff(row);
      return diffs.length > 0;
    });
  }, [modifiedRowsList, getRowDiff]);

  // Group visible modified rows by section / category
  const groupedModifiedRows = React.useMemo(() => {
    const groups: { [key: string]: { section: string; category: string; rows: typeof modifiedRowsList } } = {};
    
    visibleModifiedRows.forEach(row => {
      const key = `${row.section || ""}|${row.category || ""}`;
      if (!groups[key]) {
        groups[key] = {
          section: row.section || "",
          category: row.category || "",
          rows: []
        };
      }
      groups[key].rows.push(row);
    });

    return Object.values(groups).sort((a, b) => {
      const secCompare = a.section.localeCompare(b.section);
      if (secCompare !== 0) return secCompare;
      return a.category.localeCompare(b.category);
    });
  }, [visibleModifiedRows]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-border bg-card shadow-2xl rounded-xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-border/40 pb-3 flex-shrink-0">
          <DialogTitle className="text-lg font-black tracking-wide uppercase text-foreground">
            Review Unsaved Changes
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Please review the modifications to the performance sheet before saving.
          </DialogDescription>
        </DialogHeader>

        {/* Change List */}
        <div className="flex-1 overflow-y-auto pr-2 pt-1 pb-4 space-y-5 my-0 max-h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sky-500/25 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-sky-500/45">
          {/* Added Indicators */}
          {newRowsList.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-450">
                Added Indicators ({newRowsList.length})
              </h5>
              <ul className="divide-y divide-black dark:divide-zinc-600 bg-muted/10 border border-black dark:border-zinc-600 rounded-lg overflow-hidden">
                {newRowsList.map((row) => (
                  <li key={row.id} className="p-3 text-xs flex justify-between items-center gap-4 bg-muted/5 hover:bg-muted/10">
                    <div>
                      <span className="font-extrabold text-foreground">{row.indicator}</span>
                      <div className="text-[10px] text-foreground/80 mt-0.5 font-medium">
                        {row.section} • {row.category}
                      </div>
                    </div>
                    {row.program && (
                      <span className="text-[9px] font-black uppercase bg-card border border-black dark:border-zinc-600 px-2 py-0.5 rounded text-foreground shrink-0">
                        {row.program}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Removed Indicators */}
          {deletedRowsList.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-450">
                Removed Indicators ({deletedRowsList.length})
              </h5>
              <ul className="divide-y divide-black dark:divide-zinc-600 bg-muted/10 border border-black dark:border-zinc-600 rounded-lg overflow-hidden">
                {deletedRowsList.map((row) => (
                  <li key={row.id} className="p-3 text-xs flex justify-between items-center gap-4 bg-muted/5 hover:bg-muted/10">
                    <div>
                      <span className="font-bold text-foreground/80 line-through">{row.indicator}</span>
                      <div className="text-[10px] text-foreground/60 mt-0.5 font-medium">
                        {row.section} • {row.category}
                      </div>
                    </div>
                    {row.program && (
                      <span className="text-[9px] font-bold bg-card border border-black dark:border-zinc-600 px-2 py-0.5 rounded text-foreground/60 line-through shrink-0">
                        {row.program}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modified Values */}
          {visibleModifiedRows.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                Modified Values ({visibleModifiedRows.length})
              </h5>
              <div className="border border-black dark:border-zinc-600 rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider border-b border-black dark:border-zinc-600">
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[50%] font-extrabold">Performance Indicator</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[20%] font-extrabold">Field</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[15%] text-right font-extrabold">Before</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[15%] text-right font-extrabold">After</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {groupedModifiedRows.map((group) => {
                        const sectionShort = group.section ? group.section.split(";")[0] : "";
                        const isStrategic = group.rows.some(
                          row => row.deliverable_type === "Strategic" || row.deliverable_type?.toLowerCase() === "strategic"
                        );
                        
                        return (
                          <React.Fragment key={`${group.section}-${group.category}`}>
                            {/* Group Header Row */}
                            <tr className={`border-b border-black dark:border-zinc-600 ${
                              isStrategic 
                                ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07]" 
                                : "bg-muted/40"
                            }`}>
                              <td colSpan={4} className="p-2.5 font-extrabold text-[10px] tracking-wide uppercase text-foreground bg-muted/30">
                                <span className={isStrategic ? "text-indigo-600 dark:text-indigo-400 font-black" : ""}>
                                  {group.category || "General Metric"}
                                </span>
                                {isStrategic && (
                                  <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded ml-2">
                                    Strategic
                                  </span>
                                )}
                                {sectionShort && (
                                  <span className="text-[9px] text-foreground/60 font-semibold normal-case ml-2">
                                    — {sectionShort}
                                  </span>
                                )}
                              </td>
                            </tr>
                            
                            {/* Group Rows */}
                            {group.rows.map((row, rowIdx) => {
                              const diffs = getRowDiff(row);
                              
                              // Determine zebra striping background exactly like DataTable.tsx
                              const zebraBg = isStrategic
                                ? (rowIdx % 2 === 0
                                    ? "bg-indigo-500/[0.02] dark:bg-slate-900/30"
                                    : "bg-indigo-500/[0.06] dark:bg-indigo-950/20")
                                : (rowIdx % 2 === 0
                                    ? "bg-blue-50/50 dark:bg-slate-900/40"
                                    : "bg-blue-100/60 dark:bg-blue-950/50");

                              const hoverBg = isStrategic
                                ? "hover:bg-indigo-500/10 dark:hover:bg-indigo-950/40"
                                : "hover:bg-amber-100/50 dark:hover:bg-amber-950/30";

                              return diffs.map((diff, idx) => (
                                <tr 
                                  key={`${row.id}-${idx}`} 
                                  className={`${zebraBg} ${hoverBg} transition-colors`}
                                >
                                  {idx === 0 && (
                                    <td 
                                      className={`p-2.5 align-top font-semibold text-foreground border-x border-b border-black dark:border-zinc-600 ${zebraBg}`}
                                      rowSpan={diffs.length}
                                    >
                                      <div className="font-extrabold text-foreground text-xs leading-normal">
                                        {row.indicator}
                                      </div>
                                      <div className="flex gap-1.5 mt-1 items-center">
                                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-black dark:border-zinc-600 ${
                                          isStrategic ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-muted text-foreground"
                                        }`}>
                                          {row.deliverable_type}
                                        </span>
                                        {row.program && (
                                          <span className="text-[8px] font-extrabold uppercase bg-card border border-black dark:border-zinc-600 px-1.5 py-0.5 rounded text-foreground">
                                            {row.program}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                  <td className={`p-2.5 font-bold text-foreground/90 align-middle border-r border-b border-black dark:border-zinc-600 ${zebraBg}`}>
                                    <div className="flex flex-col">
                                      <span>{diff.field}</span>
                                      {diff.targetVal !== undefined && (
                                        <span className="text-[10px] text-foreground/60 mt-0.5 font-semibold">
                                          Target: {diff.targetVal}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2.5 text-right text-rose-600 dark:text-rose-450 font-bold line-through bg-rose-50/50 dark:bg-rose-950/30 align-middle border-r border-b border-black dark:border-zinc-600">
                                    {diff.oldVal}
                                  </td>
                                  <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50/50 dark:bg-emerald-950/30 align-middle border-r border-b border-black dark:border-zinc-600">
                                    {diff.newVal}
                                  </td>
                                </tr>
                              ));
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {newRowsList.length === 0 && deletedRowsList.length === 0 && visibleModifiedRows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border/50 rounded-xl bg-muted/5 text-center">
              <p className="text-sm font-bold text-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                No changes recorded in this category
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 pt-4 flex-shrink-0 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs font-bold border-border/60 hover:bg-muted/50 text-foreground"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm & Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
