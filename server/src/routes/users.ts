import { Router } from "express";
import { requireAuth, requireRole, getRequestScopedSupabase } from "../middleware/auth";

const router = Router();

// GET /api/users/roles
// Retrieve all registered users and their roles (Editor only)
router.get("/roles", requireAuth, requireRole(["Editor"]), async (req, res) => {
  try {
    const userClient = getRequestScopedSupabase(req);
    const { data, error } = await userClient
      .from("user_roles")
      .select("*")
      .order("email", { ascending: true });

    if (error) {
      console.error("Error fetching user roles:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data: data || [] });
  } catch (err: any) {
    console.error("Server error fetching user roles:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// POST /api/users/roles
// Register a new user role mapping (Editor only)
router.post("/roles", requireAuth, requireRole(["Editor"]), async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }

    if (!["PD", "Editor", "Staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value. Must be 'PD', 'Editor', or 'Staff'." });
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
// Update the role of a specific user (Editor only)
router.put("/roles/:id", requireAuth, requireRole(["Editor"]), async (req, res) => {
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
// Remove a user role mapping (Editor only)
router.delete("/roles/:id", requireAuth, requireRole(["Editor"]), async (req, res) => {
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

export default router;
