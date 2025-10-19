import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./server/routes/auth.js";
import messageRoutes from "./server/routes/messages.js";
import reservationRoutes from "./server/routes/reservations.js";
import quotationRoutes from "./server/routes/quotations.js";
import offerRoutes from "./server/routes/offers.js";
import hrRoutes from "./server/routes/hr.js";
import noticeRoutes from "./server/routes/notices.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection with retry logic
const connectWithRetry = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, err.message);
      
      if (retries === MAX_RETRIES) {
        console.error('❌ Maximum MongoDB connection retries reached. Starting server without MongoDB.');
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retries), 10000);
      console.log(`Retrying connection in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Try to connect but don't exit if it fails
connectWithRetry().catch(err => {
  console.error('❌ MongoDB connection failed completely:', err);
  console.log('⚠️ Server will run without MongoDB support. Data will be stored in localStorage only.');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOTEL_RATES_PATH = path.join(__dirname, "public", "data", "hotelRates.json");
const ENTRANCE_FEES_PATH = path.join(__dirname, "public", "data", "RepEnt_Fees.json");
const TRANSPORT_RATES_PATH = path.join(__dirname, "public", "data", "transportRates.json");
const ACCOUNTS_DATA_PATH = path.join(__dirname, "public", "data", "accountsData.js");
const SEASONALITY_PATH = path.join(__dirname, "public", "data", "seasonality.json");
// Restaurants datasets
const RESTAURANTS_2025_PATH = path.join(__dirname, "public", "data", "Restaurants_2025.json");
const RESTAURANTS_USD_PATH = path.join(__dirname, "public", "data", "restaurants_usd.json");

app.use(cors());
// Increase JSON/body size limit to handle large datasets (e.g., Restaurants_2025)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/notices', noticeRoutes);

// Handle direct PUT requests to JSON files for immediate updates
app.put("/data/:filename", (req, res) => {
  const filename = req.params.filename;
  let filePath;
  
  // Map the filename to the correct path
  switch (filename) {
    case "hotelRates.json":
      filePath = HOTEL_RATES_PATH;
      break;
    case "RepEnt_Fees.json":
      filePath = ENTRANCE_FEES_PATH;
      break;
    case "transportRates.json":
      filePath = TRANSPORT_RATES_PATH;
      break;
    case "seasonality.json":
      filePath = SEASONALITY_PATH;
      break;
    case "Restaurants_2025.json":
      filePath = RESTAURANTS_2025_PATH;
      break;
    case "restaurants_usd.json":
      filePath = RESTAURANTS_USD_PATH;
      break;
    default:
      return res.status(400).send(`Unknown file: ${filename}`);
  }
  
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error(`Error updating ${filename}:`, err);
      return res.status(500).send(`Error updating ${filename}`);
    }
    res.send(`${filename} updated successfully`);
  });
});

// Hotel Rates
app.get("/api/getHotelRates", (req, res) => {
  fs.readFile(HOTEL_RATES_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading hotel rates");
    res.json(JSON.parse(data));
  });
});

app.post("/api/saveHotelRates", (req, res) => {
  fs.writeFile(HOTEL_RATES_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send("Error saving hotel rates");
    res.send("Hotel rates saved successfully");
  });
});

// Entrance Fees
app.get("/api/getEntranceFees", (req, res) => {
  fs.readFile(ENTRANCE_FEES_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading entrance fees");
    res.json(JSON.parse(data));
  });
});

app.post("/api/saveEntranceFees", (req, res) => {
  fs.writeFile(ENTRANCE_FEES_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send("Error saving entrance fees");
    res.send("Entrance fees saved successfully");
  });
});

// Transportation Rates
app.post("/api/saveTransportationRates", (req, res) => {
  fs.writeFile(TRANSPORT_RATES_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send("Error saving transportation rates");
    res.send("Transportation rates saved successfully");
  });
});

// Seasonality Data
app.post("/api/saveSeasonality", (req, res) => {
  fs.writeFile(SEASONALITY_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send("Error saving seasonality data");
    res.send("Seasonality data saved successfully");
  });
});

app.get("/api/getSeasonality", (req, res) => {
  fs.readFile(SEASONALITY_PATH, "utf-8", (err, data) => {
    if (err) {
      // If file doesn't exist, return empty object with citySeasons property
      if (err.code === 'ENOENT') {
        return res.json({ citySeasons: {} });
      }
      return res.status(500).send("Error reading seasonality data");
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error("Error parsing seasonality data:", parseErr);
      res.status(500).send("Error parsing seasonality data");
    }
  });
});

// Accounts
app.get("/api/getAccounts", (req, res) => {
  fs.readFile(ACCOUNTS_DATA_PATH, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading accounts data:", err);
      return res.status(500).send("Error reading accounts data");
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error("Error parsing accounts data:", parseErr);
      res.status(500).send("Error parsing accounts data");
    }
  });
});

app.post("/api/saveAccounts", (req, res) => {
  fs.writeFile(ACCOUNTS_DATA_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error("Error saving accounts data:", err);
      return res.status(500).send("Error saving accounts data");
    }
    res.send("Accounts data saved successfully");
  });
});

// Generic save-file endpoint to write datasets under public/data
app.post("/api/save-file", (req, res) => {
  try {
    const { filename, content, data } = req.body || {};
    if (!filename) {
      return res.status(400).send("filename is required");
    }
    let filePath;
    switch (filename) {
      case "hotelRates.json":
        filePath = HOTEL_RATES_PATH;
        break;
      case "RepEnt_Fees.json":
        filePath = ENTRANCE_FEES_PATH;
        break;
      case "transportRates.json":
        filePath = TRANSPORT_RATES_PATH;
        break;
      case "seasonality.json":
        filePath = SEASONALITY_PATH;
        break;
      default:
        // Default to public/data/<filename>
        filePath = path.join(__dirname, "public", "data", filename);
    }
    const payload = typeof content !== "undefined" ? content : data;
    if (typeof payload === "undefined") {
      return res.status(400).send("content (or data) field is required");
    }
    fs.writeFile(filePath, JSON.stringify(payload, null, 2), (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).send("Error saving file");
      }
      return res.send("File saved successfully");
    });
  } catch (err) {
    console.error("save-file error:", err);
    return res.status(500).send("Unexpected error");
  }
});

// Save both Restaurants datasets atomically in one call
app.post("/api/saveRestaurants", (req, res) => {
  try {
    const { structured, normalized } = req.body || {};
    if (!Array.isArray(structured) || !Array.isArray(normalized)) {
      return res.status(400).send("structured and normalized arrays are required");
    }
    fs.writeFile(RESTAURANTS_2025_PATH, JSON.stringify(structured, null, 2), (err) => {
      if (err) {
        console.error("Error saving Restaurants_2025.json:", err);
        return res.status(500).send("Error saving Restaurants_2025.json");
      }
      fs.writeFile(RESTAURANTS_USD_PATH, JSON.stringify(normalized, null, 2), (err2) => {
        if (err2) {
          console.error("Error saving restaurants_usd.json:", err2);
          return res.status(500).send("Error saving restaurants_usd.json");
        }
        return res.send("Restaurants datasets saved successfully");
      });
    });
  } catch (err) {
    console.error("saveRestaurants error:", err);
    return res.status(500).send("Unexpected error");
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Start the server regardless of MongoDB connection status
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`⚠️ If MongoDB is not connected, the app will fall back to localStorage`);
});
