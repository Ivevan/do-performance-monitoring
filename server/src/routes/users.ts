import { Router } from "express";
import { requireAuth, requireRole, getRequestScopedSupabase } from "../middleware/auth";

const router = Router();

const ROLE_LEVELS: Record<string, number> = {
  PD: 3,
  Editor: 2,
  Staff: 1
};

router.get("/roles", requireAuth, requireRole(["Editor", "PD"]), async (req, res) => {
  try {
    const userClient = getRequestScopedSupabase(req);
    const { data: rolesData, error: rolesError } = await userClient
      .from("user_roles")
      .select("*")
      .order("email", { ascending: true });

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return res.status(500).json({ error: rolesError.message });
    }

    // Fetch user profiles (names) from users table
    const { data: profilesData, error: profilesError } = await userClient
      .from("users")
      .select("email, first_name");

    const profilesMap = new Map<string, string>();
    if (profilesData) {
      profilesData.forEach((profile: any) => {
        if (profile.email) {
          // Normalize first_name carriage returns/newlines if any
          const nameClean = (profile.first_name || "").replace(/[\r\n]+/g, "").trim();
          profilesMap.set(profile.email.toLowerCase(), nameClean);
        }
      });
    }

    const mergedData = (rolesData || []).map((record: any) => {
      const emailLower = (record.email || "").toLowerCase();
      return {
        ...record,
        name: profilesMap.get(emailLower) || null
      };
    });

    // Sort by role hierarchy level: PD > Editor > Staff, then by email alphabetically
    const ROLE_SORT_ORDER: Record<string, number> = {
      PD: 1,
      Editor: 2,
      Staff: 3
    };

    mergedData.sort((a, b) => {
      const orderA = ROLE_SORT_ORDER[a.role] || 99;
      const orderB = ROLE_SORT_ORDER[b.role] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.email || "").localeCompare(b.email || "");
    });

    return res.json({ data: mergedData });
  } catch (err: any) {
    console.error("Server error fetching user roles:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// POST /api/users/roles
// Register a new user role mapping (Editor/PD only)
router.post("/roles", requireAuth, requireRole(["Editor", "PD"]), async (req, res) => {
  try {
    const { email, role } = req.body;
    const currentUser = (req as any).user;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }

    if (!["PD", "Editor", "Staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value. Must be 'PD', 'Editor', or 'Staff'." });
    }

    const currentUserLevel = ROLE_LEVELS[currentUser.role] || 0;
    const targetRoleLevel = ROLE_LEVELS[role] || 0;

    // Enforce role hierarchy: Creator role must be strictly higher than the assigned role
    if (currentUserLevel <= targetRoleLevel) {
      return res.status(403).json({
        error: `Access denied. You cannot assign the '${role}' role. You can only assign roles strictly lower than your own.`
      });
    }

    const userClient = getRequestScopedSupabase(req);

    // Check if the user is already registered
    const { data: existing, error: checkError } = await userClient
      .from("user_roles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ error: checkError.message });
    }

    if (existing) {
      return res.status(400).json({ error: "User email already registered in the system." });
    }

    // Insert new role
    const { data: inserted, error: insertError } = await userClient
      .from("user_roles")
      .insert({
        email: email.trim().toLowerCase(),
        role
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user role record:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(201).json({ data: inserted });
  } catch (err: any) {
    console.error("Server error creating user role mapping:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// PUT /api/users/roles/:id
// Update the role of a specific user (Editor/PD only)
router.put("/roles/:id", requireAuth, requireRole(["Editor", "PD"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = (req as any).user;

    if (!role || !["PD", "Editor", "Staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value. Must be 'PD', 'Editor', or 'Staff'." });
    }

    const userClient = getRequestScopedSupabase(req);

    // 1. Fetch the user to be updated to check if it's the current user
    const { data: targetUser, error: fetchError } = await userClient
      .from("user_roles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: "User role record not found." });
    }

    // 2. Prevent self-demotion or self-change to prevent lockouts
    if (targetUser.email === currentUser.email) {
      return res.status(400).json({ error: "You cannot change your own role to prevent administrative lockouts." });
    }

    const currentUserLevel = ROLE_LEVELS[currentUser.role] || 0;
    const targetUserLevel = ROLE_LEVELS[targetUser.role] || 0;
    const newRoleLevel = ROLE_LEVELS[role] || 0;

    // Enforce role hierarchy: Cannot modify users with equal/higher role level
    if (currentUserLevel <= targetUserLevel) {
      return res.status(403).json({
        error: `Access denied. You cannot modify the role of a user with a '${targetUser.role}' role because their role level is equal to or higher than yours.`
      });
    }

    // Enforce role hierarchy: Cannot assign a role equal to/higher than your own level
    if (currentUserLevel <= newRoleLevel) {
      return res.status(403).json({
        error: `Access denied. You cannot assign the '${role}' role. You can only assign roles strictly lower than your own.`
      });
    }

    // 3. Update the role
    const { data: updated, error: updateError } = await userClient
      .from("user_roles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ data: updated });
  } catch (err: any) {
    console.error("Server error updating user role:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// DELETE /api/users/roles/:id
// Remove a user role mapping (Editor/PD only)
router.delete("/roles/:id", requireAuth, requireRole(["Editor", "PD"]), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const userClient = getRequestScopedSupabase(req);

    // 1. Fetch user to confirm not deleting self
    const { data: targetUser, error: fetchError } = await userClient
      .from("user_roles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: "User role record not found." });
    }

    if (targetUser.email === currentUser.email) {
      return res.status(400).json({ error: "You cannot delete your own user role record." });
    }

    const currentUserLevel = ROLE_LEVELS[currentUser.role] || 0;
    const targetUserLevel = ROLE_LEVELS[targetUser.role] || 0;

    // Enforce role hierarchy: Cannot delete users with equal/higher role level
    if (currentUserLevel <= targetUserLevel) {
      return res.status(403).json({
        error: `Access denied. You cannot delete the role mapping of a user with a '${targetUser.role}' role because their role level is equal to or higher than yours.`
      });
    }

    const { error: deleteError } = await userClient
      .from("user_roles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting user role record:", deleteError);
      return res.status(500).json({ error: deleteError.message });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Server error deleting user role:", err);
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
