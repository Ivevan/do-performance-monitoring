import { Router } from "express";
import { requireAuth, requireRole, getRequestScopedSupabase } from "../middleware/auth";

const router = Router();

// GET /api/audit/logs
// Retrieves paginated and filtered audit logs
router.get("/logs", requireAuth, requireRole(["Editor"]), async (req, res) => {
  try {
    const { year, action_type, table_name, search, page = "1", limit = "50" } = req.query;
    const db = getRequestScopedSupabase(req);

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .from("audit_logs")
      .select("*", { count: "exact" });

    // Apply filters
    if (year) {
      query = query.eq("year", parseInt(year as string, 10));
    }
    if (action_type) {
      query = query.eq("action_type", String(action_type));
    }
    if (table_name) {
      query = query.eq("table_name", String(table_name));
    }

    // Text search on indicator name, program name, editor email, or editor name
    if (search && String(search).trim() !== "") {
      const searchStr = String(search).trim();
      query = query.or(`indicator_name.ilike.%${searchStr}%,user_email.ilike.%${searchStr}%,user_name.ilike.%${searchStr}%,program_name.ilike.%${searchStr}%`);
    }

    // Sorting and Pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase audit log query error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      }
    });
  } catch (err) {
    console.error("Server error in audit route:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
