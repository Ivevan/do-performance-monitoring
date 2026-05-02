import { Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// GET /api/dashboard/data
// Fetches performance indicator data based on query parameters
router.get("/data", async (req, res) => {
  try {
    const { year, section, indicator, program } = req.query;

    let query = supabase.from("v_indicator_data").select("*");

    if (year) query = query.eq("year", Number(year));
    if (section) query = query.eq("section", String(section));
    if (indicator) query = query.eq("indicator", String(indicator));
    if (program) query = query.eq("program", String(program));

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
