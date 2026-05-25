import { Router } from "express";
import { supabase } from "../config/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Help SQL instructions text in case table doesn't exist
const SETUP_SQL_INSTRUCTION = `-- CY 2026 Performance Targets Schema Addendum
CREATE TABLE IF NOT EXISTS performance_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    year INT NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial CY 2026 performance folder
INSERT INTO performance_folders (name, year, description, status) 
VALUES (
    'CY 2026 PTSO Performance Monitoring', 
    2026, 
    'Official performance indicators, administrative deliverables, and support-to-operations target matrices for Davao Oriental for CY 2026.', 
    'Active'
)
ON CONFLICT (year) DO NOTHING;`;

// GET /api/workspaces
// Retrieves all workspace folders
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("performance_folders")
      .select("*")
      .order("year", { ascending: false });

    if (error) {
      // Handle the case where table doesn't exist yet gracefully
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return res.json({
          setupRequired: true,
          sql: SETUP_SQL_INSTRUCTION,
          message: "The performance_folders table has not been created yet in Supabase."
        });
      }
      console.error("Supabase fetch workspaces error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Auto-seed CY 2026 if the table is empty
    if (data && data.length === 0) {
      console.log("Auto-seeding empty performance_folders table with CY 2026...");
      const { data: seedData, error: seedError } = await supabase
        .from("performance_folders")
        .insert([{
          name: "CY 2026 PTSO Performance Monitoring",
          year: 2026,
          description: "Official performance indicators, administrative deliverables, and support-to-operations target matrices for Davao Oriental for CY 2026."
        }])
        .select();

      if (seedError) {
        console.error("Warning: Failed to auto-seed CY 2026 workspace:", seedError.message);
      } else if (seedData) {
        return res.json({ data: seedData });
      }
    }

    return res.json({ data: data || [] });
  } catch (err) {
    console.error("Server error in workspaces fetch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/workspaces
// Adds a new workspace folder and bootstraps indicator targets for that year
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, year, description } = req.body;

    if (!name || !year) {
      return res.status(400).json({ error: "Name and Year are required fields." });
    }

    // 1. Create the performance folder metadata
    const { data: folder, error: folderError } = await supabase
      .from("performance_folders")
      .insert([{ name, year: Number(year), description }])
      .select()
      .single();

    if (folderError) {
      console.error("Error creating workspace folder:", folderError);
      return res.status(500).json({ error: folderError.message });
    }

    // 2. Query all existing indicators in the database to bootstrap targets for this year
    const { data: indicators, error: indError } = await supabase
      .from("indicators")
      .select("id");

    if (indError) {
      console.warn("Could not fetch indicators to bootstrap targets:", indError.message);
    } else if (indicators && indicators.length > 0) {
      // 3. Prepare target rows initialized to 0
      const targetRows = indicators.map(ind => ({
        indicator_id: ind.id,
        year: Number(year),
        q1_target: 0,
        q2_target: 0,
        q3_target: 0,
        q4_target: 0,
        annual_target: 0
      }));

      // 4. Bulk insert target templates for this year (ignoring conflicts just in case)
      const { error: targetsError } = await supabase
        .from("targets")
        .insert(targetRows);

      if (targetsError) {
        console.error("Warning: Failed to bootstrap targets for new year:", targetsError.message);
      }

      // 5. Prepare accomplishment rows initialized to 0 for Q1-Q4
      const accomplishmentRows: any[] = [];
      indicators.forEach(ind => {
        for (let q = 1; q <= 4; q++) {
          accomplishmentRows.push({
            indicator_id: ind.id,
            year: Number(year),
            quarter: q,
            value: 0
          });
        }
      });

      // 6. Bulk insert accomplishments templates for this year
      const { error: accomplishmentsError } = await supabase
        .from("accomplishments")
        .insert(accomplishmentRows);

      if (accomplishmentsError) {
        console.error("Warning: Failed to bootstrap accomplishments for new year:", accomplishmentsError.message);
      }
    }

    return res.status(201).json({ data: folder });
  } catch (err) {
    console.error("Server error in workspaces creation:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/workspaces/:id
// Updates folder details
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, description } = req.body;

    const { data, error } = await supabase
      .from("performance_folders")
      .update({ name, year: Number(year), description })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating workspace folder:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (err) {
    console.error("Server error in workspaces update:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/workspaces/:id
// Deletes a folder and all associated target and accomplishment data
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the folder metadata to determine its year
    const { data: folder, error: fetchError } = await supabase
      .from("performance_folders")
      .select("year")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching workspace folder for deletion:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (folder) {
      const year = folder.year;

      // 2. Delete all targets associated with this calendar year
      const { error: targetDeleteError } = await supabase
        .from("targets")
        .delete()
        .eq("year", year);

      if (targetDeleteError) {
        console.error(`Warning: Failed to delete targets for year ${year}:`, targetDeleteError.message);
      }

      // 3. Delete all accomplishments associated with this calendar year
      const { error: accomplishmentsDeleteError } = await supabase
        .from("accomplishments")
        .delete()
        .eq("year", year);

      if (accomplishmentsDeleteError) {
        console.error(`Warning: Failed to delete accomplishments for year ${year}:`, accomplishmentsDeleteError.message);
      }
    }

    // 4. Delete the workspace folder metadata itself
    const { error } = await supabase
      .from("performance_folders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting workspace folder:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Workspace and associated targets/accomplishments deleted successfully" });
  } catch (err) {
    console.error("Server error in workspaces deletion:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
