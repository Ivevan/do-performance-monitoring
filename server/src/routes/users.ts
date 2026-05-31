import { Router } from "express";
import { requireAuth, requireRole, getRequestScopedSupabase } from "../middleware/auth";

const router = Router();

const ROLE_LEVELS: Record<string, number> = {
  PD: 3,
  Editor: 2,
  Staff: 1
};

router.get("/roles", requireAuth, async (req, res) => {
  try {
    const userClient = getRequestScopedSupabase(req);
    // Fetch all user profiles (names) from users table
    const { data: profilesData, error: profilesError } = await userClient
      .from("users")
      .select("*")
      .order("email", { ascending: true });

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return res.status(500).json({ error: profilesError.message });
    }

    const mergedData = (profilesData || []).map((record: any) => {
      const emailLower = (record.email || "").toLowerCase();
      let role = "Staff";
      
      // Automatic Role Assignment Rules:
      // - Government emails (ending with @region11.dost.gov.ph or containing dost.gov.ph / .gov.ph) are automatically Editors
      // - Other emails (like .dostxi@gmail.com or @gmail.com) are automatically Staff (Viewers)
      if (
        emailLower.endsWith("@region11.dost.gov.ph") || 
        emailLower.endsWith(".gov.ph") || 
        emailLower.includes("dost.gov.ph")
      ) {
        role = "Editor";
      }

      return {
        id: record.id.toString(),
        email: record.email,
        role: role,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: null,
        name: record.first_name || null
      };
    });

    return res.json({ data: mergedData });
  } catch (err: any) {
    console.error("Server error fetching user list:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// GET /api/users/profile
// Retrieve current logged-in user profile details (name, email, role, avatar)
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.email) {
      return res.status(401).json({ error: "Unauthorized. No valid session." });
    }

    const userClient = getRequestScopedSupabase(req);
    const emailNormalized = currentUser.email.trim().toLowerCase();

    // Query display name from public.users
    const { data: profile, error: profileError } = await userClient
      .from("users")
      .select("first_name, email")
      .eq("email", emailNormalized)
      .maybeSingle();

    if (profileError) {
      console.error("Error retrieving user profile record:", profileError);
    }

    // Resolve name and avatar from Supabase auth metadata as fallback
    const oauthMetadata = currentUser.user_metadata || {};
    const resolvedName = profile?.first_name || oauthMetadata.full_name || oauthMetadata.name || "DOST User";
    const resolvedAvatar = oauthMetadata.avatar_url || oauthMetadata.picture || null;

    return res.json({
      email: currentUser.email,
      name: resolvedName,
      role: currentUser.role,
      avatar_url: resolvedAvatar
    });
  } catch (err: any) {
    console.error("Server error fetching self profile:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// PUT /api/users/profile
// Update current logged-in user profile display name
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser.email) {
      return res.status(401).json({ error: "Unauthorized. No valid session." });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Display name cannot be empty." });
    }

    const userClient = getRequestScopedSupabase(req);
    const emailNormalized = currentUser.email.trim().toLowerCase();

    // Upsert the profile record in public.users to keep it in sync
    const { data: updatedProfile, error: updateError } = await userClient
      .from("users")
      .upsert(
        { email: emailNormalized, first_name: name.trim() },
        { onConflict: "email" }
      )
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating user profile first_name:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        email: emailNormalized,
        name: updatedProfile?.first_name || name.trim(),
        role: currentUser.role
      }
    });
  } catch (err: any) {
    console.error("Server error updating user profile:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
