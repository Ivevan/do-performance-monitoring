import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { 
  History, 
  Search, 
  User, 
  Calendar, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  Edit2,
  Trash2,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuditLogRecord {
  id: string;
  user_email: string;
  user_name: string | null;
  action_type: "INSERT" | "UPDATE" | "DELETE";
  table_name: "targets" | "accomplishments";
  record_id: string;
  year: number;
  indicator_id: string;
  indicator_name: string;
  program_name: string | null;
  change_details: Record<string, { old: any; new: any } | any>;
  created_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Persistent module-level state and cache to survive component unmounting (tab/page switching)
let lastActiveFilters = {
  searchQuery: "",
  selectedYear: "",
  selectedAction: "",
  selectedTable: "",
  currentPage: 1,
};

const globalLogsCache: Record<string, { data: AuditLogRecord[]; pagination: PaginationMeta }> = {};

export default function AuditLogs() {
  useEffect(() => {
    document.title = "System Audit Logs | DOST-PSTO-DO";
  }, []);

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters initialized from last active filter values
  const [searchQuery, setSearchQuery] = useState(lastActiveFilters.searchQuery);
  const [selectedYear, setSelectedYear] = useState<string>(lastActiveFilters.selectedYear);
  const [selectedAction, setSelectedAction] = useState<string>(lastActiveFilters.selectedAction);
  const [selectedTable, setSelectedTable] = useState<string>(lastActiveFilters.selectedTable);
  const [currentPage, setCurrentPage] = useState(lastActiveFilters.currentPage);

  // Keep module-level state synchronized with active filters
  useEffect(() => {
    lastActiveFilters = {
      searchQuery,
      selectedYear,
      selectedAction,
      selectedTable,
      currentPage,
    };
  }, [searchQuery, selectedYear, selectedAction, selectedTable, currentPage]);

  const fetchLogs = async (forceRefresh = false) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
    });

    if (selectedYear) params.append("year", selectedYear);
    if (selectedAction) params.append("action_type", selectedAction);
    if (selectedTable) params.append("table_name", selectedTable);
    if (searchQuery.trim() !== "") params.append("search", searchQuery.trim());

    const cacheKey = params.toString();

    // SWR Cache Strategy: Return cached data instantly if available, then fetch in background
    if (!forceRefresh && globalLogsCache[cacheKey]) {
      const cached = globalLogsCache[cacheKey];
      setLogs(cached.data);
      setPagination(cached.pagination);
      setLoading(false);

      // Revalidate silently in the background
      apiFetch(`${API_URL}/api/audit/logs?${cacheKey}`)
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((result) => {
          if (result) {
            globalLogsCache[cacheKey] = {
              data: result.data || [],
              pagination: result.pagination || { page: currentPage, limit: 10, total: 0, pages: 1 }
            };
            setLogs(result.data || []);
            setPagination(result.pagination || { page: currentPage, limit: 10, total: 0, pages: 1 });
          }
        })
        .catch(() => {});
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch(`${API_URL}/api/audit/logs?${cacheKey}`);
      if (!response.ok) {
        throw new Error("Failed to load audit logs from server");
      }
      const result = await response.json();
      const logsData = result.data || [];
      const pagData = result.pagination || { page: currentPage, limit: 10, total: 0, pages: 1 };

      // Update Cache
      globalLogsCache[cacheKey] = { data: logsData, pagination: pagData };

      setLogs(logsData);
      setPagination(pagData);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedYear, selectedAction, selectedTable]);

  // Background Prefetch for Next Page
  useEffect(() => {
    if (currentPage < pagination.pages) {
      const nextPage = currentPage + 1;
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: "10",
      });
      if (selectedYear) params.append("year", selectedYear);
      if (selectedAction) params.append("action_type", selectedAction);
      if (selectedTable) params.append("table_name", selectedTable);
      if (searchQuery.trim() !== "") params.append("search", searchQuery.trim());

      const nextCacheKey = params.toString();

      if (!globalLogsCache[nextCacheKey]) {
        apiFetch(`${API_URL}/api/audit/logs?${nextCacheKey}`)
          .then((res) => {
            if (res.ok) return res.json();
          })
          .then((result) => {
            if (result) {
              globalLogsCache[nextCacheKey] = {
                data: result.data || [],
                pagination: result.pagination || { page: nextPage, limit: 10, total: 0, pages: 1 }
              };
            }
          })
          .catch(() => {});
      }
    }
  }, [currentPage, pagination.pages, selectedYear, selectedAction, selectedTable, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(true);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "INSERT":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1 hover:bg-emerald-500/15 py-0.5 px-2 font-bold uppercase text-[9px] tracking-wider">
            <PlusCircle className="h-3 w-3 shrink-0 text-emerald-400" />
            <span>Create</span>
          </Badge>
        );
      case "UPDATE":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 hover:bg-blue-500/15 py-0.5 px-2 font-bold uppercase text-[9px] tracking-wider">
            <Edit2 className="h-3 w-3 shrink-0 text-blue-400" />
            <span>Update</span>
          </Badge>
        );
      case "DELETE":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 gap-1 hover:bg-rose-500/15 py-0.5 px-2 font-bold uppercase text-[9px] tracking-wider">
            <Trash2 className="h-3 w-3 shrink-0 text-rose-400" />
            <span>Delete</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableBadge = (table: string) => {
    if (table === "targets") {
      return (
        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 font-bold uppercase text-[9px] tracking-wider py-0.5 px-2">
          Target
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-rose-500/5 text-rose-400 border-rose-500/20 font-bold uppercase text-[9px] tracking-wider py-0.5 px-2">
        Accomplishment
      </Badge>
    );
  };

  const formatKeyName = (key: string) => {
    // Format keys like 'q1_target' to 'Q1 Target'
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedYear("");
    setSelectedAction("");
    setSelectedTable("");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout title="Performance Audit History">
      <div className="flex flex-col gap-6 w-full pb-12">
        
        {/* TOP FILTER & SEARCH CARD */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span>Audit Trail Filters</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor, filter, and track data entry logs across target and accomplishment records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
                <div className="flex flex-wrap flex-1 gap-2 items-center">
                  {/* Search query input */}
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by indicator, editor name/email, program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs h-9 bg-muted/40"
                    />
                  </div>

                  {/* Filter by Year */}
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs h-9 px-3 bg-muted/40 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-[110px]"
                  >
                    <option value="">All Years</option>
                    <option value="2026">CY 2026</option>
                    <option value="2027">CY 2027</option>
                    <option value="2028">CY 2028</option>
                  </select>

                  {/* Filter by Action */}
                  <select
                    value={selectedAction}
                    onChange={(e) => {
                      setSelectedAction(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs h-9 px-3 bg-muted/40 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-[125px]"
                  >
                    <option value="">All Actions</option>
                    <option value="INSERT">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                  </select>

                  {/* Filter by Table */}
                  <select
                    value={selectedTable}
                    onChange={(e) => {
                      setSelectedTable(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs h-9 px-3 bg-muted/40 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-[140px]"
                  >
                    <option value="">All Sheets</option>
                    <option value="targets">Targets</option>
                    <option value="accomplishments">Accomplishments</option>
                  </select>
                </div>

                <div className="flex gap-2 items-center justify-end shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs h-9 px-3"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="text-xs h-9 px-4 font-bold flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fetchLogs(true)}
                    className="h-9 w-9"
                    title="Refresh logs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LOGS LIST AREA */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Retrieving performance audit trail...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <History className="h-10 w-10 text-muted-foreground/60 mb-2" />
                <h3 className="text-sm font-bold text-foreground">No audit logs found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  We couldn't find any modification logs matching your filters. Make some updates in the workspaces to generate entries.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const dateStr = new Date(log.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <div 
                      key={log.id} 
                      className={`transition-colors duration-200 ${
                        isExpanded ? "bg-muted/10" : "hover:bg-muted/5"
                      }`}
                    >
                      {/* Log Header Row */}
                      <div 
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                        onClick={() => toggleExpand(log.id)}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Action Badge Column */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[115px] pt-0.5">
                            {getActionBadge(log.action_type)}
                            {getTableBadge(log.table_name)}
                          </div>

                          {/* Log Info Column */}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground line-clamp-2 md:line-clamp-1">
                              {log.indicator_name}
                              {log.program_name && (
                                <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-1 rounded ml-1.5 uppercase tracking-wider shrink-0 select-none">
                                  {log.program_name}
                                </span>
                              )}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1.5 font-medium">
                              <span className="flex items-center gap-1 text-foreground/80 cursor-help" title={log.user_email}>
                                <User className="h-3 w-3 text-primary/80" />
                                {log.user_name || log.user_email}
                              </span>
                              <span className="text-muted-foreground/45">•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {dateStr}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expand Trigger Column */}
                        <div className="flex items-center justify-end shrink-0 pl-10 md:pl-0">
                          <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Log Expanded Diff Pane */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-muted/20">
                          <div className="bg-card rounded-md border border-border/50 overflow-hidden shadow-inner mt-1">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-muted text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider border-b border-border/60">
                                    <th className="p-2.5 font-extrabold w-[50%]">Modified Field</th>
                                    <th className="p-2.5 font-extrabold text-right w-[25%]">Before</th>
                                    <th className="p-2.5 font-extrabold text-right w-[25%]">After</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(log.change_details).map(([key, change]: [string, any], idx) => {
                                    const hasOldNew = change && typeof change === "object" && ("old" in change || "new" in change);
                                    const oldValue = hasOldNew ? change.old : null;
                                    const newValue = hasOldNew ? change.new : change;
                                    
                                    const isTargetLog = log.table_name === "targets";
                                    const fieldColorClass = isTargetLog
                                      ? "text-emerald-600 dark:text-emerald-450 font-extrabold"
                                      : "text-rose-600 dark:text-rose-450 font-extrabold";

                                    const formatValueSafe = (val: any) => {
                                      if (val === null || val === undefined) return null;
                                      if (typeof val === "boolean") return val ? "True" : "False";
                                      if (typeof val === "object") return JSON.stringify(val);
                                      return val.toLocaleString();
                                    };

                                    const oldFormatted = formatValueSafe(oldValue);
                                    const newFormatted = formatValueSafe(newValue);

                                    if (key === "quarter" && log.table_name === "accomplishments") {
                                      return (
                                        <tr key={key} className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                                          <td className={`p-2.5 border-b border-border/40 align-middle ${fieldColorClass}`}>
                                            Target Quarter
                                          </td>
                                          <td colSpan={2} className="p-2.5 text-center font-bold text-foreground bg-muted/10 align-middle border-b border-border/40">
                                            Quarter {newFormatted || "None"}
                                          </td>
                                        </tr>
                                      );
                                    }

                                    if (key === "quarter") return null;

                                    const zebraBg = idx % 2 === 0 ? "bg-card" : "bg-muted/30";

                                    return (
                                      <tr key={key} className={`${zebraBg} hover:bg-muted/50 transition-colors`}>
                                        <td className={`p-2.5 border-b border-border/40 align-middle ${fieldColorClass}`}>
                                          {formatKeyName(key)}
                                        </td>
                                        <td className="p-2.5 text-right font-bold border-b border-border/40 align-middle">
                                          {oldFormatted === null ? (
                                            <span className="text-muted-foreground/45 italic font-medium">None</span>
                                          ) : (
                                            <span className="text-rose-600 dark:text-rose-450 line-through bg-rose-500/10 px-1.5 py-0.5 rounded">
                                              {oldFormatted}
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-2.5 text-right font-bold border-b border-border/40 align-middle">
                                          {newFormatted === null ? (
                                            <span className="text-muted-foreground/45 italic font-medium">None</span>
                                          ) : (
                                            <span className="text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                              {newFormatted}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAGINATION PANEL */}
        {logs.length > 0 && !loading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
            <span className="text-xs text-muted-foreground font-medium">
              Showing logs {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-xs h-8 px-2.5 font-bold"
              >
                Previous
              </Button>
              <div className="text-xs font-bold px-3">
                Page {currentPage} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="text-xs h-8 px-2.5 font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
