import { Router } from "express";
import { supabase } from "../config/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/dashboard/data
// Fetches performance indicator data based on query parameters
router.get("/data", requireAuth, async (req, res) => {
  try {
    const { year, section, indicator, program } = req.query;

    let query = supabase.from("v_indicator_data").select("*");

    if (year) query = query.eq("year", Number(year));
    if (section) query = query.eq("section", String(section));
    if (indicator) query = query.eq("indicator", String(indicator));
    if (program) query = query.eq("program", String(program));

    query = query
      .order("section_order", { ascending: true })
      .order("category_order", { ascending: true })
      .order("indicator_order", { ascending: true });

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

// POST /api/dashboard/save-grid
// Saves target and accomplishment changes from the spreadsheet matrix
router.post("/save-grid", requireAuth, async (req, res) => {
  try {
    const { year, rows } = req.body;
    if (!year || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Missing required fields: year or rows" });
    }

    // 1. Fetch categories to map category/section names to IDs
    const { data: dbCategories, error: catError } = await supabase
      .from("categories")
      .select("id, name, section_id, sections(name)")
      .returns<any[]>();

    if (catError) {
      console.error("Failed to fetch categories:", catError);
      return res.status(500).json({ error: catError.message });
    }

    // 2. Fetch all indicators with their category deliverable type
    const { data: dbIndicators, error: indError } = await supabase
      .from("indicators")
      .select("id, category_id, name, program, categories(deliverable_type, name)");

    if (indError) {
      console.error("Failed to fetch indicators for mapping:", indError);
      return res.status(500).json({ error: indError.message });
    }

    const dbIndicatorsMapped = (dbIndicators || []).map((ind: any) => ({
      id: ind.id,
      category_id: ind.category_id,
      name: ind.name,
      program: ind.program,
      deliverable_type: ind.categories?.deliverable_type || "Functional",
      category_name: ind.categories?.name
    }));

    // 3. Identify and delete strategic indicators that have been deleted in the frontend
    const strategicDbIndicators = dbIndicatorsMapped.filter(ind => ind.deliverable_type === "Strategic");
    const idsToDelete = strategicDbIndicators
      .filter(ind => !rows.some(r => r.indicator_id === ind.id))
      .map(ind => ind.id);

    if (idsToDelete.length > 0) {
      const { error: delError } = await supabase
        .from("indicators")
        .delete()
        .in("id", idsToDelete);

      if (delError) {
        console.error("Failed to delete strategic indicators:", delError);
        return res.status(500).json({ error: delError.message });
      }
    }

    const targetUpserts = [];
    const accomplishmentUpserts = [];

    // 4. Process each row sent from the client
    for (const row of rows) {
      let indicatorId = row.indicator_id;

      if (indicatorId && !indicatorId.startsWith("temp-")) {
        // Existing indicator: update it if it's strategic (in case name or program changed)
        if (row.deliverable_type === "Strategic") {
          const { error: updateError } = await supabase
            .from("indicators")
            .update({
              name: row.indicator,
              program: row.program || null
            })
            .eq("id", indicatorId);

          if (updateError) {
            console.error(`Failed to update strategic indicator ${indicatorId}:`, updateError);
            return res.status(500).json({ error: updateError.message });
          }
        }
      } else {
        // New indicator: insert into database
        const catMatch = dbCategories.find(
          (c: any) =>
            c.name === row.category &&
            c.sections?.name === row.section
        );

        if (!catMatch) {
          console.warn(`No category match found for "${row.category}" in section "${row.section}"`);
          continue;
        }

        const { data: newInd, error: newIndErr } = await supabase
          .from("indicators")
          .insert({
            category_id: catMatch.id,
            name: row.indicator,
            program: row.program || null,
            data_type: "NUMBER",
            aggregation_type: row.aggregation_type || "SUM",
          })
          .select()
          .single();

        if (newIndErr) {
          console.error("Failed to insert new strategic indicator:", newIndErr);
          return res.status(500).json({ error: newIndErr.message });
        }

        if (newInd) {
          indicatorId = newInd.id;
        }
      }

      if (!indicatorId) {
        continue;
      }

      // Prepare target upsert
      targetUpserts.push({
        indicator_id: indicatorId,
        year: Number(year),
        q1_target: Number(row.q1_target || 0),
        q2_target: Number(row.q2_target || 0),
        q3_target: Number(row.q3_target || 0),
        q4_target: Number(row.q4_target || 0),
        annual_target: Number(row.annual_target || 0),
      });

      // Prepare accomplishment upserts for quarters 1 to 4
      const quarters = [
        { quarter: 1, val: row.q1_actual },
        { quarter: 2, val: row.q2_actual },
        { quarter: 3, val: row.q3_actual },
        { quarter: 4, val: row.q4_actual },
      ];

      for (const q of quarters) {
        accomplishmentUpserts.push({
          indicator_id: indicatorId,
          year: Number(year),
          quarter: q.quarter,
          value: Number(q.val || 0),
        });
      }
    }

    // 5. Perform bulk upsert for targets
    if (targetUpserts.length > 0) {
      const { error: targetErr } = await supabase
        .from("targets")
        .upsert(targetUpserts, { onConflict: "indicator_id,year" });

      if (targetErr) {
        console.error("Error upserting targets:", targetErr);
        return res.status(500).json({ error: targetErr.message });
      }
    }

    // 6. Perform bulk upsert for accomplishments
    if (accomplishmentUpserts.length > 0) {
      const { error: accErr } = await supabase
        .from("accomplishments")
        .upsert(accomplishmentUpserts, { onConflict: "indicator_id,year,quarter" });

      if (accErr) {
        console.error("Error upserting accomplishments:", accErr);
        return res.status(500).json({ error: accErr.message });
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Server error during save-grid:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
