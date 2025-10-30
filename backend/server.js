import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Cho phép truy cập thư mục public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/Web_Cho_Thue_Xe")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// ✅ API test
app.get("/", (req, res) => res.send("🚗 Car Rental API running..."));

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
