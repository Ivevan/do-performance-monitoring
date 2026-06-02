import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { 
  Users, 
  Search, 
  Mail,
  Shield,
  Clock,
  Edit,
  User,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserRoleRecord {
  id: string;
  email: string;
  role: "Editor" | "Staff";
  created_at: string;
  name?: string | null;
  isSelf?: boolean;
}



// Persistent module-level state and cache to survive component unmounting (tab/page switching)
let lastRolesSearch = "";
let rolesCache: UserRoleRecord[] | null = null;

export default function ManageRoles() {
  const { user: currentUser } = useAuth();

  useEffect(() => {
    document.title = "Team Access Registry | DOST-PSTO-DO";
  }, []);

  const [users, setUsers] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State initialized from preserved state
  const [searchQuery, setSearchQuery] = useState(lastRolesSearch);

  // Synchronize searchQuery with module-level state
  useEffect(() => {
    lastRolesSearch = searchQuery;
  }, [searchQuery]);
  
  // Fetch all registered users
  const fetchUsers = async (forceRefresh = false) => {
    if (!forceRefresh && rolesCache !== null) {
      setUsers(rolesCache);
      setLoading(false);

      // Silent revalidation in the background
      apiFetch(`${API_URL}/api/users/roles`)
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((result) => {
          if (result) {
            const list = result.data || [];
            rolesCache = list;
            setUsers(list);
          }
        })
        .catch(() => {});
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch(`${API_URL}/api/users/roles`);
      if (!response.ok) {
        throw new Error("Failed to retrieve system user registry");
      }
      const result = await response.json();
      const list = result.data || [];
      rolesCache = list;
      setUsers(list);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load team database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role: string) => {
    if (role === "Editor") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15 gap-1.5 py-0.5 px-2.5">
          <Edit className="h-3.5 w-3.5 shrink-0" />
          <span>Data Editor</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/25 hover:bg-zinc-500/15 gap-1.5 py-0.5 px-2.5">
        <User className="h-3.5 w-3.5 shrink-0" />
        <span>Staff Viewer</span>
      </Badge>
    );
  };

  const totalUsers = users.length;
  const editorUsers = users.filter(u => u.role === "Editor").length;
  const viewerUsers = users.filter(u => u.role === "Staff").length;

  return (
    <DashboardLayout title="Team Members & Permissions">
      <div className="flex flex-col gap-6 w-full pb-12">
        {/* STATS OVERVIEW SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md">
            <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Registry</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{totalUsers}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-dost-blue/10 text-dost-blue">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md">
            <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Data Editors</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{editorUsers}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md">
            <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Staff Viewers</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{viewerUsers}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border/80 bg-card/30 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-dost-blue" />
                Team Access Registry
              </CardTitle>
              <CardDescription>
                List of registered active team members. Authorization levels are managed automatically based on organization email domains. Government emails (e.g. <code>@region11.dost.gov.ph</code> or <code>.gov.ph</code>) and whitelisted test accounts receive <strong>Data Editor</strong> permissions, while other authorized regional test addresses receive <strong>Staff Viewer</strong> permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rolesSearchInput"
                  name="rolesSearch"
                  placeholder="Search registered team members by email or permission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-10 border-border/80 bg-card/30 focus-visible:ring-dost-blue/30 focus-visible:border-dost-blue/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Table list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-dost-blue mb-3" />
                  <p className="text-xs text-muted-foreground">Loading registry...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <Mail className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No registered members found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/15 border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-3">Team Member</th>
                        <th className="p-3">Access Level</th>
                        <th className="p-3">Date Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredUsers.map((record) => {
                        const isSelf = !!record.isSelf || record.email.toLowerCase() === currentUser?.email?.toLowerCase();
                        return (
                          <tr key={record.id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-3 font-semibold text-foreground">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-dost-blue/10 border border-dost-blue/20 flex items-center justify-center text-dost-blue font-bold text-xs uppercase shrink-0">
                                  {record.name ? record.name.slice(0, 2) : "U"}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground text-sm">
                                      {record.name || (
                                        <span className="text-muted-foreground/50 italic font-normal text-xs">Pending Registration</span>
                                      )}
                                    </span>
                                    {isSelf && (
                                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-dost-blue border-dost-blue/30 bg-dost-blue/5 h-fit font-semibold">
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground/75 font-normal select-all">
                                    {record.email}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {getRoleBadge(record.role)}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                                {new Date(record.created_at).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
