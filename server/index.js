import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Local date helper — avoids UTC mismatch for users in UTC+ timezones
function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------
// AUTH MIDDLEWARE
// ---------------------------------------------------------------------

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: "Auth verification failed" });
  }
};

// ---------------------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------------------

app.get("/ping", (req, res) => {
  res.json({ message: "backend working" });
});

// ---------------------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------------------

app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: "Email, password, and name are required." });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/auth/logout", verifyUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.status(200).json({ success: true, data: { status: "logged out" } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/auth/me", verifyUser, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// ---------------------------------------------------------------------
// HABITS
// ---------------------------------------------------------------------

app.get("/habits", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/habits/:id", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, error: "Habit not found" });
  }
});

app.post("/habits", verifyUser, async (req, res) => {
  try {
    const { title, description, type, category, target_value, unit, allow_skip } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, error: "Title and type are required" });
    }

    const validTypes = ["binary", "measurable", "duration"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid type. Allowed: binary, measurable, duration" });
    }

    const validCategories = ["health", "fitness", "learning", "mindfulness"];
    const cat = category ? category.toLowerCase() : "health";
    if (!validCategories.includes(cat)) {
      return res.status(400).json({ success: false, error: "Invalid category. Allowed: health, fitness, learning, mindfulness" });
    }

    const { data, error } = await supabase
      .from("habits")
      .insert([{
        user_id: req.user.id,
        title,
        description: description || null,
        type,
        category: cat,
        target_value: target_value || null,
        unit: unit || null,
        allow_skip: allow_skip !== undefined ? allow_skip : true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/habits/:id", verifyUser, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    delete updates.user_id;

    const { data, error } = await supabase
      .from("habits")
      .update(updates)
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/habits/:id", verifyUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------
// LOGS
// ---------------------------------------------------------------------

app.post("/logs", verifyUser, async (req, res) => {
  try {
    const { habitId, status, value, note, date } = req.body;

    if (!habitId || !status) {
      return res.status(400).json({ success: false, error: "habitId and status are required" });
    }

    const validStatuses = ["done", "skipped", "missed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status. Allowed: done, skipped, missed" });
    }

    // Verify habit ownership
    const { data: habitCheck, error: hErr } = await supabase
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", req.user.id)
      .single();

    if (hErr || !habitCheck) {
      return res.status(404).json({ success: false, error: "Habit not found or unauthorized" });
    }

    const logDate = date || getLocalDate();

    let safeValue = null;
    if (value !== "" && value !== undefined && value !== null) {
      safeValue = Number(value);
      if (isNaN(safeValue)) safeValue = null;
    }

    const { data, error } = await supabase
      .from("habit_logs")
      .upsert({
        habit_id: habitId,
        date: logDate,
        status,
        value: safeValue,
        note: note || null
      }, { onConflict: "habit_id, date" })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE today's log for a specific habit (for undo/toggle)
app.delete("/logs/:habitId/:date", verifyUser, async (req, res) => {
  try {
    const { habitId, date } = req.params;

    // Verify habit ownership
    const { data: habitCheck } = await supabase
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", req.user.id)
      .single();

    if (!habitCheck) {
      return res.status(404).json({ success: false, error: "Habit not found" });
    }

    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", date);

    if (error) throw error;
    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET today's logs for ALL habits of the current user
app.get("/logs/today", verifyUser, async (req, res) => {
  try {
    const today = getLocalDate();

    const { data: userHabits, error: hErr } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", req.user.id);

    if (hErr) throw hErr;

    const habitIds = (userHabits || []).map(h => h.id);
    if (habitIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: logs, error } = await supabase
      .from("habit_logs")
      .select("*")
      .in("habit_id", habitIds)
      .eq("date", today);

    if (error) throw error;
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/logs/:habitId", verifyUser, async (req, res) => {
  try {
    const habitId = req.params.habitId;

    const { data: habitCheck } = await supabase
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", req.user.id)
      .single();

    if (!habitCheck) {
      return res.status(404).json({ success: false, error: "Habit not found" });
    }

    const { data: logs, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .order("date", { ascending: true });

    if (error) throw error;

    // --- STREAK CALCULATION ---
    const doneLogs = logs.filter(l => l.status === "done");

    let current_streak = 0;
    let longest_streak = 0;
    let tempStreak = 0;

    for (let i = 0; i < doneLogs.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(doneLogs[i - 1].date + "T00:00:00");
        const currDate = new Date(doneLogs[i].date + "T00:00:00");
        const diffMs = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays === 0) {
          // same day, ignore
        } else {
          let gapBroken = false;
          for (let d = 1; d < diffDays; d++) {
            const checkDate = new Date(prevDate);
            checkDate.setDate(checkDate.getDate() + d);
            const checkStr = formatLocalDate(checkDate);
            const gapLog = logs.find(l => l.date === checkStr);
            if (!gapLog || gapLog.status === "missed") {
              gapBroken = true;
              break;
            }
          }
          tempStreak = gapBroken ? 1 : tempStreak + 1;
        }
      }
      if (tempStreak > longest_streak) longest_streak = tempStreak;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (doneLogs.length > 0) {
      const lastDoneDate = new Date(doneLogs[doneLogs.length - 1].date + "T00:00:00");
      if (lastDoneDate.getTime() === today.getTime() || lastDoneDate.getTime() === yesterday.getTime()) {
        current_streak = tempStreak;
      }
    }

    const totalLogs = logs.length;
    const doneCount = doneLogs.length;

    res.status(200).json({
      success: true,
      data: {
        logs,
        stats: {
          current_streak,
          longest_streak,
          total_logs: totalLogs,
          done_count: doneCount,
          completion_rate: totalLogs > 0 ? Math.round((doneCount / totalLogs) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET aggregated stats for all habits (includes per-habit breakdown)
app.get("/stats", verifyUser, async (req, res) => {
  try {
    const { data: habits, error: hErr } = await supabase
      .from("habits")
      .select("id, title, type, category")
      .eq("user_id", req.user.id);

    if (hErr) throw hErr;

    const habitIds = (habits || []).map(h => h.id);
    if (habitIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { activeHabits: 0, totalLogs: 0, completionRate: 0, currentStreak: 0, longestStreak: 0, habits: [] }
      });
    }

    const { data: allLogs, error: lErr } = await supabase
      .from("habit_logs")
      .select("*")
      .in("habit_id", habitIds)
      .order("date", { ascending: true });

    if (lErr) throw lErr;

    const totalLogs = (allLogs || []).length;
    const doneCount = (allLogs || []).filter(l => l.status === "done").length;

    // Per-habit stats
    const habitStats = habits.map(h => {
      const hLogs = (allLogs || []).filter(l => l.habit_id === h.id);
      const hDone = hLogs.filter(l => l.status === "done").length;
      return {
        id: h.id,
        title: h.title,
        type: h.type,
        category: h.category,
        totalLogs: hLogs.length,
        doneCount: hDone,
        completionRate: hLogs.length > 0 ? Math.round((hDone / hLogs.length) * 100) : 0
      };
    });

    // Overall streak
    const doneDates = [...new Set((allLogs || []).filter(l => l.status === "done").map(l => l.date))].sort();

    let overallCurrent = 0;
    let overallLongest = 0;
    let tempStreak = 0;

    for (let i = 0; i < doneDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(doneDates[i - 1] + "T00:00:00");
        const curr = new Date(doneDates[i] + "T00:00:00");
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      if (tempStreak > overallLongest) overallLongest = tempStreak;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (doneDates.length > 0) {
      const lastDate = new Date(doneDates[doneDates.length - 1] + "T00:00:00");
      if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
        overallCurrent = tempStreak;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        activeHabits: habits.length,
        totalLogs,
        completionRate: totalLogs > 0 ? Math.round((doneCount / totalLogs) * 100) : 0,
        currentStreak: overallCurrent,
        longestStreak: overallLongest,
        habits: habitStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------
// PROFILE
// ---------------------------------------------------------------------

app.get("/profile", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: {
        ...data,
        email: req.user.email,
        initials: data.name ? data.name.charAt(0).toUpperCase() : "U",
        memberSince: new Date(data.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/profile", verifyUser, async (req, res) => {
  try {
    const { name, avatar_url, timezone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (timezone !== undefined) updates.timezone = timezone;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------
// START
// ---------------------------------------------------------------------

app.listen(process.env.PORT ||3000, () => console.log("Server running on port 3000"));