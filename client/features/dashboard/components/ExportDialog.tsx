import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { exportToExcel } from "@/features/dashboard/utils/exportToExcel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawData: any[];
  year: number;
}

export function ExportDialog({ open, onOpenChange, rawData, year }: ExportDialogProps) {
  const [preparedByName, setPreparedByName] = useState("");
  const [preparedByTitle, setPreparedByTitle] = useState("");
  const [sheetOption, setSheetOption] = useState<"all" | "targets" | "q1_kpis">("all");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!preparedByName.trim()) {
      toast.error("Please enter the name of the person who prepared this report.");
      return;
    }

    setExporting(true);
    try {
      await exportToExcel(rawData, {
        year,
        preparedByName: preparedByName.trim(),
        preparedByTitle: preparedByTitle.trim(),
        sheetOption,
      });
      toast.success(`Successfully exported CY ${year} Performance Targets!`);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Export failed: ${err.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
            Export Performance Targets
          </DialogTitle>
          <DialogDescription>
            Download the CY {year} Performance Targets as an Excel file matching the official DOST template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prepared By */}
          <div className="space-y-2">
            <Label htmlFor="preparedByName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Prepared by (Name)
            </Label>
            <Input
              id="preparedByName"
              placeholder="e.g. KARLEEN G. CANDARI"
              value={preparedByName}
              onChange={(e) => setPreparedByName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparedByTitle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Position / Title (Optional)
            </Label>
            <Input
              id="preparedByTitle"
              placeholder="e.g. SRS I, DOST Davao Oriental"
              value={preparedByTitle}
              onChange={(e) => setPreparedByTitle(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Sheet Selection */}
          <div className="space-y-2">
            <Label htmlFor="sheetOption" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Worksheet(s) to Export
            </Label>
            <Select
              value={sheetOption}
              onValueChange={(val: any) => setSheetOption(val)}
            >
              <SelectTrigger id="sheetOption" className="h-9 text-sm">
                <SelectValue placeholder="Select sheet option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sheets (Targets & Q1 KPIs)</SelectItem>
                <SelectItem value="targets">Targets Sheet Only</SelectItem>
                <SelectItem value="q1_kpis">PSTO-DO 1stQ KPIs Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fixed Reviewer */}
          <div className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reviewed and Approved by
            </p>
            <p className="text-sm font-bold text-foreground">MIRASOL G. DOMINGO</p>
            <p className="text-xs text-muted-foreground">PD, DOST Davao Oriental</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || !preparedByName.trim()}
            className="bg-primary text-primary-foreground gap-2 text-xs"
          >
            {exporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Download Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
