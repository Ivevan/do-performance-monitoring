import React from "react";
import { Trash2, RotateCcw } from "lucide-react";
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
