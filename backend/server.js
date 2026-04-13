import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "sai";

app.use(cors());
app.use(express.json());

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model("ContactMessage", contactSchema);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend is running",
    mongoUri: MONGODB_URI,
    dbName: MONGODB_DB_NAME,
  });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "name, email, and message are required.",
      });
    }

    const savedMessage = await ContactMessage.create({ name, email, message });

    return res.status(201).json({
      ok: true,
      message: "Message saved successfully.",
      id: savedMessage._id,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Failed to save message.",
      error: error.message,
    });
  }
});

const startServer = async () => {
  try {
    console.log(`Connecting MongoDB at ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
