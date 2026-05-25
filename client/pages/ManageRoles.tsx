import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { validateEmail } from "@/lib/auth-config";
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Check, 
  X,
  Loader2,
  Mail,
  Shield,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserRoleRecord {
  id: string;
  email: string;
  role: "PD" | "Editor" | "Staff";
  created_at: string;
  updated_at: string | null;
}

export default function ManageRoles() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRoleRecord | null>(null);
  
  // Add Form state
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"PD" | "Editor" | "Staff">("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all user roles
  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_URL}/api/users/roles`);
      if (!response.ok) {
        throw new Error("Failed to retrieve user roles registry");
      }
      const result = await response.json();
      setUsers(result.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load user roles database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  // Update role handler
  const handleUpdateRole = async (recordId: string, role: "PD" | "Editor" | "Staff") => {
    try {
      const response = await apiFetch(`${API_URL}/api/users/roles/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }

      toast.success("User role updated successfully");
      fetchUserRoles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update user role.");
    }
  };

  // Add role handler
  const handleAddUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const emailToValidate = newEmail.trim().toLowerCase();
    if (!validateEmail(emailToValidate)) {
      toast.error("Access restricted: email suffix must be @dost.gov.ph or authorized gmail accounts.");
      return;
    }

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === emailToValidate)) {
      toast.error("This email is already registered in the role mapping database.");
      return;
    }

    try {
      setIsSubmitting(true);
      // To add a new user role, we can make a POST to /api/workspaces? No, wait!
      // In the backend requireAuth auto-registers new users as Staff. But what if we want to manually pre-register them?
      // Since requireAuth middleware inserts if not found, we can also insert via backend!
      // Wait, did we write an insert/POST endpoint in server/src/routes/users.ts?
      // Let's check server/src/routes/users.ts: we only have GET /roles, PUT /roles/:id, and DELETE /roles/:id.
      // Ah! We can easily add a POST /roles to users.ts to allow pre-registration!
      // Yes, that's beautiful! Let's first make a placeholder request and update users.ts in a bit, or we can update it right now.
      // Wait, let's write client/pages/ManageRoles.tsx assuming POST /api/users/roles exists:
      const response = await apiFetch(`${API_URL}/api/users/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToValidate, role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register user role");
      }

      toast.success(`Registered ${emailToValidate} as ${newRole} successfully`);
      setNewEmail("");
      setNewRole("Staff");
      setIsAddOpen(false);
      fetchUserRoles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to register user role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete role handler
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const response = await apiFetch(`${API_URL}/api/users/roles/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user role mapping");
      }

      toast.success("User role mapping deleted successfully");
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUserRoles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete user role.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Editor":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15">Editor</Badge>;
      case "PD":
        return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15">Provincial Director</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted/15">Staff</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="User Roles Management"
      headerActions={
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-gradient-to-r from-dost-blue to-dost-blue/80 hover:from-dost-blue/90 hover:to-dost-blue/70 text-white font-semibold shadow-md shadow-dost-blue/10 shrink-0 px-4 h-9 gap-1.5 transition-all text-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register User Role</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-6 w-full pb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border/80 bg-card/30 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-dost-blue" />
                Administrative Roles Registry
              </CardTitle>
              <CardDescription>
                Manage fine-grained operational permissions for Davao Oriental monitoring portal. Editors have complete CRUD access, PD has view-only/approvals, and Staff have read-only views.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search registered users by email or role..."
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
                  <p className="text-xs text-muted-foreground">Loading authentication database mappings...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <Mail className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No registered users found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search criteria or register a new user.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/15 border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Current Role Mapping</th>
                        <th className="p-3">Created Date</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredUsers.map((record) => {
                        const isSelf = record.email.toLowerCase() === currentUser?.email?.toLowerCase();
                        return (
                          <tr key={record.id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-3 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <span>{record.email}</span>
                                {isSelf && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-dost-blue border-dost-blue/30 bg-dost-blue/5">
                                    You
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              {isSelf ? (
                                <div className="flex items-center gap-2">
                                  {getRoleBadge(record.role)}
                                  <span className="text-[10px] text-muted-foreground/60 italic">(Locked)</span>
                                </div>
                              ) : (
                                <Select
                                  value={record.role}
                                  onValueChange={(val: "PD" | "Editor" | "Staff") => handleUpdateRole(record.id, val)}
                                >
                                  <SelectTrigger className="h-8 w-36 text-xs bg-card/45 border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Staff">Staff (Read-Only)</SelectItem>
                                    <SelectItem value="PD">PD (Read/Approvals)</SelectItem>
                                    <SelectItem value="Editor">Editor (CRUD)</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground flex flex-col gap-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                                {new Date(record.created_at).toLocaleDateString()}
                              </span>
                              {record.updated_at && (
                                <span className="text-[10px] text-muted-foreground/60">
                                  Updated: {new Date(record.updated_at).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isSelf}
                                onClick={() => {
                                  setSelectedUser(record);
                                  setIsDeleteOpen(true);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                title={isSelf ? "You cannot delete your own account" : "Delete user role mapping"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* DIALOG: ADD USER ROLE */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border border-border bg-card/95 backdrop-blur-md max-w-sm w-full">
          <form onSubmit={handleAddUserRole}>
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserPlus className="h-4.5 w-4.5 text-dost-blue" />
                Register New User Role
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pre-register an email address and allocate operational permissions. This user will immediately receive these permissions upon signing in.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. employee@dost.gov.ph"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-bold text-muted-foreground">Assigned Role *</Label>
                <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                  <SelectTrigger id="role" className="h-9 text-xs bg-card/50">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff (Read-Only View)</SelectItem>
                    <SelectItem value="PD">PD (Read & Approvals)</SelectItem>
                    <SelectItem value="Editor">Editor (Complete CRUD Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="h-8 text-xs border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 text-xs bg-dost-blue text-white hover:bg-dost-blue/90 shadow-glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Registering...
                  </>
                ) : (
                  "Register User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: DELETE USER ROLE CONFIRMATION */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border border-border bg-card/95 backdrop-blur-md max-w-sm w-full">
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Remove User Permissions?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete the role mapping registry for this email?
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4 space-y-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-foreground/90">
                <p className="font-semibold text-red-500">Warning:</p>
                <p className="mt-1 leading-normal">
                  De-registering <strong>{selectedUser.email}</strong> will revert their permission status back to the default <strong>'Staff' (Read-Only)</strong> role on their next request.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedUser(null);
              }}
              className="h-8 text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteUser}
              className="h-8 text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/10"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
