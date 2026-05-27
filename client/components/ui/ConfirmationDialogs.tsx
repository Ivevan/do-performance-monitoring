import React from "react";
import { Trash2, RotateCcw, Edit3, Search, Loader2, Save } from "lucide-react";
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
  const [reviewFilter, setReviewFilter] = React.useState<"all" | "added" | "removed" | "modified">("all");
  const [reviewSearch, setReviewSearch] = React.useState("");
  const [reviewQuarter, setReviewQuarter] = React.useState<"all" | "q1" | "q2" | "q3" | "q4">("all");
  const [reviewFieldType, setReviewFieldType] = React.useState<"all" | "target" | "actual">("all");

  React.useEffect(() => {
    if (!isOpen) {
      setReviewFilter("all");
      setReviewSearch("");
      setReviewQuarter("all");
      setReviewFieldType("all");
    }
  }, [isOpen]);

  const filteredNewRowsList = React.useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    if (!query) return newRowsList;
    return newRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );
  }, [newRowsList, reviewSearch]);

  const filteredDeletedRowsList = React.useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    if (!query) return deletedRowsList;
    return deletedRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );
  }, [deletedRowsList, reviewSearch]);

  const filteredModifiedRowsList = React.useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    
    const searchFiltered = modifiedRowsList.filter(
      (r) =>
        r.indicator.toLowerCase().includes(query) ||
        (r.program && r.program.toLowerCase().includes(query))
    );

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
  }, [modifiedRowsList, reviewSearch, reviewQuarter, reviewFieldType, getRowDiff]);

  // Compute visible rows that actually have matching diffs
  const visibleModifiedRows = React.useMemo(() => {
    return filteredModifiedRowsList.filter(row => {
      const diffs = getRowDiff(row).filter((diff) => {
        if (reviewQuarter !== 'all' && diff.quarter !== 'all' && diff.quarter !== reviewQuarter) {
          return false;
        }
        if (reviewFieldType !== 'all' && diff.type !== 'all' && diff.type !== reviewFieldType) {
          return false;
        }
        return true;
      });
      return diffs.length > 0;
    });
  }, [filteredModifiedRowsList, reviewQuarter, reviewFieldType, getRowDiff]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md inline-block">
                Added Indicators ({filteredNewRowsList.length})
              </h5>
              <ul className="divide-y divide-black dark:divide-zinc-600 bg-muted/10 border border-black dark:border-zinc-600 rounded-lg overflow-hidden">
                {filteredNewRowsList.map((row) => (
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
          {(reviewFilter === 'all' || reviewFilter === 'removed') && filteredDeletedRowsList.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-450 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-md inline-block">
                Removed Indicators ({filteredDeletedRowsList.length})
              </h5>
              <ul className="divide-y divide-black dark:divide-zinc-600 bg-muted/10 border border-black dark:border-zinc-600 rounded-lg overflow-hidden">
                {filteredDeletedRowsList.map((row) => (
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
          {(reviewFilter === 'all' || reviewFilter === 'modified') && visibleModifiedRows.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-md inline-block">
                Modified Values ({visibleModifiedRows.length})
              </h5>
              <div className="border border-black dark:border-zinc-600 rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[50%] font-extrabold text-primary-foreground">Performance Indicator</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[20%] font-extrabold text-primary-foreground">Field</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[15%] text-right font-extrabold text-primary-foreground">Before</th>
                        <th className="p-2.5 border border-black dark:border-zinc-600 w-[15%] text-right font-extrabold text-primary-foreground">After</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {visibleModifiedRows.map((row, rowIdx) => {
                        const diffs = getRowDiff(row).filter((diff) => {
                          if (reviewQuarter !== 'all' && diff.quarter !== 'all' && diff.quarter !== reviewQuarter) {
                            return false;
                          }
                          if (reviewFieldType !== 'all' && diff.type !== 'all' && diff.type !== reviewFieldType) {
                            return false;
                          }
                          return true;
                        });

                        const zebraBg = rowIdx % 2 === 0
                          ? "bg-muted/20 dark:bg-muted/10"
                          : "bg-background";

                        return diffs.map((diff, idx) => (
                          <tr 
                            key={`${row.id}-${idx}`} 
                            className={`${zebraBg} hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors`}
                          >
                            {idx === 0 && (
                              <td 
                                className="p-2.5 align-top font-semibold text-foreground border-x border-b border-black dark:border-zinc-600" 
                                rowSpan={diffs.length}
                              >
                                <div className="font-extrabold text-foreground text-xs leading-normal">
                                  {row.indicator}
                                </div>
                                <div className="flex gap-1.5 mt-1 items-center">
                                  <span className="text-[8px] font-extrabold uppercase bg-muted px-1.5 py-0.5 rounded text-foreground border border-black dark:border-zinc-600">
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
                            <td className="p-2.5 font-bold text-foreground/90 align-middle border-r border-b border-black dark:border-zinc-600">
                              <div className="flex flex-col">
                                <span>{diff.field}</span>
                                {diff.targetVal !== undefined && (
                                  <span className="text-[10px] text-foreground/60 mt-0.5 font-semibold">
                                    Target: {diff.targetVal}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-right text-rose-600 dark:text-rose-450 font-mono font-bold line-through bg-rose-500/5 align-middle border-r border-b border-black dark:border-zinc-600">
                              {diff.oldVal}
                            </td>
                            <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-450 font-mono font-bold bg-emerald-500/5 align-middle border-r border-b border-black dark:border-zinc-600">
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
          {((reviewFilter === 'all' && filteredNewRowsList.length === 0 && filteredDeletedRowsList.length === 0 && visibleModifiedRows.length === 0) ||
            (reviewFilter === 'added' && filteredNewRowsList.length === 0) ||
            (reviewFilter === 'removed' && filteredDeletedRowsList.length === 0) ||
            (reviewFilter === 'modified' && visibleModifiedRows.length === 0)) && (
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
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs font-bold border-border/60 hover:bg-muted/50 text-foreground"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
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
  );
}
