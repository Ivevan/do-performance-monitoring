import { Router } from "express";
import { requireAuth, requireRole, getRequestScopedSupabase } from "../middleware/auth";

const router = Router();

// GET /api/dashboard/data
// Fetches performance indicator data based on query parameters
router.get("/data", requireAuth, async (req, res) => {
  try {
    const { year, section, indicator, program } = req.query;
    const db = getRequestScopedSupabase(req);

    let query = db.from("v_indicator_data").select("*");

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
router.post("/save-grid", requireAuth, requireRole(["Editor"]), async (req, res) => {
  try {
    const { year, rows, deletedIndicatorIds } = req.body;
    if (!year || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Missing required fields: year, rows or deletedIndicatorIds" });
    }

    const db = getRequestScopedSupabase(req);

    // 1. Fetch categories only if there are new indicators to insert
    const hasNewIndicators = rows.some((row: any) => !row.indicator_id || row.indicator_id.startsWith("temp-"));
    let dbCategories: any[] = [];
    if (hasNewIndicators) {
      const { data, error: catError } = await db
        .from("categories")
        .select("id, name, section_id, sections(name)")
        .returns<any[]>();

      if (catError) {
        console.error("Failed to fetch categories:", catError);
        return res.status(500).json({ error: catError.message });
      }
      dbCategories = data || [];
    }

    // 2. Delete strategic indicators that have been deleted in the frontend explicitly
    const idsToDelete = Array.isArray(deletedIndicatorIds) ? deletedIndicatorIds : [];

    if (idsToDelete.length > 0) {
      const { error: delError } = await db
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

    // Separate rows into existing and new
    const newRows = rows.filter(r => !r.indicator_id || r.indicator_id.startsWith("temp-"));
    const existingRows = rows.filter(r => r.indicator_id && !r.indicator_id.startsWith("temp-"));

    // 3. Process existing strategic indicator updates concurrently
    const updatePromises = existingRows
      .filter(row => row.deliverable_type === "Strategic")
      .map(async (row) => {
        const { error: updateError } = await db
          .from("indicators")
          .update({
            name: row.indicator,
            program: row.program || null
          })
          .eq("id", row.indicator_id);

        if (updateError) {
          throw new Error(`Failed to update strategic indicator ${row.indicator_id}: ${updateError.message}`);
        }
      });

    await Promise.all(updatePromises);

    // 4. Pre-compute next order_index per category to avoid race conditions
    const categoryNextOrder = new Map<string, number>();
    const uniqueCatIds = new Set<string>();
    for (const row of newRows) {
      const catMatch = dbCategories.find(
        (c: any) => c.name === row.category && c.sections?.name === row.section
      );
      if (catMatch) uniqueCatIds.add(catMatch.id);
    }

    // Fetch the current max order_index for each category that will receive new indicators
    for (const catId of uniqueCatIds) {
      const { data: maxData } = await db
        .from("indicators")
        .select("order_index")
        .eq("category_id", catId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      categoryNextOrder.set(catId, (maxData?.order_index ?? 0) + 1);
    }

    // Process new indicators concurrently and map their inserted IDs
    const insertPromises = newRows.map(async (row) => {
      const catMatch = dbCategories.find(
        (c: any) =>
          c.name === row.category &&
          c.sections?.name === row.section
      );

      if (!catMatch) {
        console.warn(`No category match found for "${row.category}" in section "${row.section}"`);
        return null;
      }

      // Get and increment the next order_index for this category
      const nextOrder = categoryNextOrder.get(catMatch.id) ?? 1;
      categoryNextOrder.set(catMatch.id, nextOrder + 1);

      const { data: newInd, error: newIndErr } = await db
        .from("indicators")
        .insert({
          category_id: catMatch.id,
          name: row.indicator,
          program: row.program || null,
          data_type: "NUMBER",
          aggregation_type: row.aggregation_type || "SUM",
          order_index: nextOrder,
        })
        .select()
        .single();

      if (newIndErr) {
        throw new Error(`Failed to insert new strategic indicator: ${newIndErr.message}`);
      }

      return {
        rowId: row.id,
        indicatorId: newInd.id
      };
    });

    const insertedResults = await Promise.all(insertPromises);
    const idMap = new Map<string, string>();
    insertedResults.forEach(res => {
      if (res) {
        idMap.set(res.rowId, res.indicatorId);
      }
    });

    // 5. Build upserts for targets and accomplishments
    for (const row of rows) {
      let indicatorId = row.indicator_id;
      if (!indicatorId || indicatorId.startsWith("temp-")) {
        indicatorId = idMap.get(row.id);
      }

      if (!indicatorId) {
        continue;
      }

      targetUpserts.push({
        indicator_id: indicatorId,
        year: Number(year),
        q1_target: Number(row.q1_target || 0),
        q2_target: Number(row.q2_target || 0),
        q3_target: Number(row.q3_target || 0),
        q4_target: Number(row.q4_target || 0),
        annual_target: Number(row.annual_target || 0),
      });

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

    // 6. Perform bulk upsert for targets
    if (targetUpserts.length > 0) {
      const { error: targetErr } = await db
        .from("targets")
        .upsert(targetUpserts, { onConflict: "indicator_id,year" });

      if (targetErr) {
        console.error("Error upserting targets:", targetErr);
        return res.status(500).json({ error: targetErr.message });
      }
    }

    // 7. Perform bulk upsert for accomplishments
    if (accomplishmentUpserts.length > 0) {
      const { error: accErr } = await db
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
