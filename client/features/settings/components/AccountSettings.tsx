import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  KeyRound, 
  AlertTriangle, 
  ExternalLink, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Edit,
  Check
} from "lucide-react";

export function AccountSettings() {
  const { user, role } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_URL}/api/users/profile`);
        if (!res.ok) {
          throw new Error("Failed to load profile settings.");
        }
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setAvatarPreview(data.avatar_url || null);
        setHasFetched(true);
      } catch (err: any) {
        console.error("Error fetching profile from API, using metadata fallback:", err);
        // Fallback to auth metadata
        const meta = user?.user_metadata || {};
        setName(meta.full_name || meta.name || "DOST User");
        setEmail(user?.email || "");
        setAvatarPreview(meta.avatar_url || meta.picture || null);
        setHasFetched(true);
      } finally {
        setLoading(false);
      }
    };

    if (user && !hasFetched) {
      fetchProfile();
    }
  }, [user, hasFetched]);

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      // 1. Update the database table public.users via backend API
      const res = await apiFetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile name.");
      }

      // 2. Sync with client-side Supabase auth session metadata in real-time
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
      });

      if (authError) {
        console.warn("Could not sync metadata to active auth session:", authError);
      }

      toast.success("Profile settings updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "DU";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-dost-blue" />
        <p className="text-xs text-muted-foreground">Loading your profile preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight">Account Settings</h3>
        <p className="text-xs text-muted-foreground font-medium">
          View and modify your user account profile preferences.
        </p>
      </div>
      <Separator className="border-border/60" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (takes 2/3 of space on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Premium Top Decorative Banner */}
            <div className="h-28 w-full bg-gradient-to-r from-dost-blue/30 via-indigo-600/20 to-pink-500/10 border-b border-border/20" />
            
            <CardHeader className="pb-4 relative z-10 pt-0 px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 -mt-10 w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
                  <Avatar className="w-20 h-20 border-4 border-background shadow-lg ring-1 ring-border/50">
                    <AvatarImage src={avatarPreview || undefined} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-dost-blue to-indigo-600 text-white font-bold text-lg">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 text-center sm:text-left pb-1 sm:pt-10">
                    <CardTitle className="text-lg font-extrabold flex items-center justify-center sm:justify-start gap-2 text-foreground">
                      {isEditingName ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => {
                              // Delay slightly to allow Check button click to trigger first
                              setTimeout(() => setIsEditingName(false), 150);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setIsEditingName(false);
                              }
                            }}
                            className="h-8 text-base font-bold border-border/80 focus-visible:ring-dost-blue/30 bg-card/10 w-48 py-0 px-2 text-foreground"
                            autoFocus
                            placeholder="Display Name"
                          />
                          <button
                            onClick={() => setIsEditingName(false)}
                            className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Confirm Name"
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>{name || "DOST User"}</span>
                          <button 
                            onClick={handleEditClick}
                            className="p-1 rounded-md text-muted-foreground/60 hover:text-dost-blue hover:bg-muted transition-all duration-200"
                            title="Edit Display Name"
                            type="button"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">
                      Manage your display identity inside the performance dashboard.
                    </CardDescription>
                  </div>
                </div>

                {role && (
                  <div className="sm:pt-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border shadow-sm ${
                      role === "PD"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : role === "Editor"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
                    }`}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {role === "PD" ? "Provincial Director" : role === "Editor" ? "Data Editor" : "Staff Viewer"}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pt-2">
              <Separator className="border-border/40" />
              
              <div className="space-y-5">
                {/* Registered Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">Registered Workspace Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      readOnly 
                      disabled 
                      className="pl-9 h-9 text-xs bg-muted/40 cursor-not-allowed border-border/60 text-muted-foreground font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-normal">
                    Your workspace email is locked to your organization's Google identity provider.
                  </p>
                </div>


                {/* Styled Credentials ID Badge block */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Access Authorization Level</Label>
                  <div className={`flex items-start sm:items-center gap-3.5 p-4 rounded-xl border transition-all duration-300 ${
                    role === "PD" 
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]"
                      : role === "Editor"
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                        : "bg-zinc-500/5 border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/10"
                  }`}>
                    <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 sm:mt-0 ${
                      role === "PD" ? "text-amber-500" : role === "Editor" ? "text-emerald-500" : "text-zinc-400"
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-foreground">
                          {role === "PD" ? "Provincial Director" : role === "Editor" ? "Data Editor" : "Staff Viewer"}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          role === "PD"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : role === "Editor"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}>
                          {role === "Staff" ? "Read-Only" : "Write / Edit Access"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {role === "PD" 
                          ? "Full regional & provincial administrative authority. Authorized to manage workspace targets, indicators, roles registry, and sign off exports." 
                          : role === "Editor"
                            ? "Authorized to update accomplished values, submit quarterly reports, and modify indicators data."
                            : "Read-only access enabled. You can view all charts and dashboards, but cannot commit modifications or update targets."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-3 pb-4 px-6 border-t border-border flex justify-end bg-muted/10">
              <Button 
                onClick={handleSaveChanges} 
                disabled={saving}
                className="h-8 text-xs bg-dost-blue text-white hover:bg-dost-blue/90 px-4 font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column (takes 1/3 of space on desktop) */}
        <div className="space-y-6">
          {/* Password & Security Info (Google-managed) */}
          <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:border-indigo-500/25 overflow-hidden relative group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-indigo-500/10" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-dost-blue" />
                Security & Verification
              </CardTitle>
              <CardDescription className="text-xs">
                Manage credentials and authentication layers.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed space-y-3">
              <div className="flex gap-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5 text-foreground/90 hover:bg-indigo-500/10 transition-colors duration-200">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-400 text-[11px]">Google OAuth Account Protection</p>
                  <p className="mt-1 leading-normal text-muted-foreground text-[10px]">
                    Your account is safely integrated with single sign-on. Identity factors, password checks, and 2FA settings are handled directly by your organization's Google domain.
                  </p>
                  <a 
                    href="https://myaccount.google.com/security" 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 font-bold text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Manage Google Account Security
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Removal Info */}
          <Card className="border border-red-500/20 bg-red-500/5 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:border-red-500/30 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-red-500/10" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Account De-registration
              </CardTitle>
              <CardDescription className="text-xs">
                Request account deletion or authorization updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[10px] leading-relaxed text-muted-foreground">
              Portal permissions are assigned dynamically using security groups. If you need to deactivate your portal profile, change emails, or request access modifications, please coordinate directly with the **Provincial Director**.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
