import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  if (error) return res.json(error);
  res.json(data);
});

app.get("/ping", (req, res) => {
  res.json({ message: "backend working" });
});
fetch("http://localhost:3000/test-db");
app.listen(3000, () => console.log("server running"));