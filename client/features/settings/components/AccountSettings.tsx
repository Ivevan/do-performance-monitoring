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
  ShieldCheck
} from "lucide-react";

export function AccountSettings() {
  const { user, role } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      } catch (err: any) {
        console.error("Error fetching profile from API, using metadata fallback:", err);
        // Fallback to auth metadata
        const meta = user?.user_metadata || {};
        setName(meta.full_name || meta.name || "DOST User");
        setEmail(user?.email || "");
        setAvatarPreview(meta.avatar_url || meta.picture || null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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
        <p className="text-xs text-muted-foreground">
          View and modify your user account profile preferences.
        </p>
      </div>
      <Separator className="border-border/60" />

      {/* Profile Details Card */}
      <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-dost-blue" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your public name and view your system authorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-18 h-18 border border-border">
              <AvatarImage src={avatarPreview || undefined} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-dost-blue to-indigo-600 text-white font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">Profile Picture</h4>
              <p className="text-[10px] text-muted-foreground leading-normal max-w-sm">
                Your profile picture is loaded automatically from your Google account. To update it, please modify it in your Google settings.
              </p>
            </div>
          </div>
          <Separator className="border-border/40" />
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">Registered Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  readOnly 
                  disabled 
                  className="pl-9 h-9 text-xs bg-muted/40 cursor-not-allowed border-border/60 text-muted-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your email is fixed to your Google organization workspace and cannot be modified.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-muted-foreground">Full Display Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border-border/80 focus-visible:ring-dost-blue/30 bg-card/10"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Access Level & Role</Label>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20">
                <ShieldCheck className="h-4.5 w-4.5 text-dost-blue" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">
                    {role === "PD" ? "Provincial Director" : role === "Editor" ? "Editor" : "Staff Viewer"}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">
                    ({role === "Staff" ? "Read-Only View" : "Administrative Access"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-border flex justify-end">
          <Button 
            onClick={handleSaveChanges} 
            disabled={saving}
            className="h-8 text-xs bg-dost-blue text-white hover:bg-dost-blue/90"
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

      {/* Password & Security Info (Google-managed) */}
      <Card className="border border-border/80 bg-card/25 backdrop-blur-sm shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-dost-blue" />
            Security & Authentication
          </CardTitle>
          <CardDescription className="text-xs">
            Manage how you log in and authenticate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed space-y-3">
          <div className="flex gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-foreground/90">
            <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-400">Google OAuth Account Protection</p>
              <p className="mt-1 leading-normal text-muted-foreground text-[11px]">
                Your account is protected by single sign-on via Google. Passwords, two-factor authentication, and security checkpoints are safely managed directly by your organization's Google workspace.
              </p>
              <a 
                href="https://myaccount.google.com/security" 
                target="_blank" 
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Go to Google Security Settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Removal Info */}
      <Card className="border border-red-500/20 bg-red-500/5 backdrop-blur-sm shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            De-registration & Removal
          </CardTitle>
          <CardDescription className="text-xs">
            Request account removal or access level demotions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[11px] leading-relaxed text-muted-foreground">
          Your portal permissions are assigned dynamically. If you wish to deactivate your access, sign out, or change your assigned email address, please coordinate with your Provincial Director.
        </CardContent>
      </Card>
    </div>
  );
}
