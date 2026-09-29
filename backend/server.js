const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.route");
const menuItemRoutes = require("./routes/menuItem.route");
const orderRoutes = require("./routes/order.route");

const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// ALLOWED FRONTEND ORIGINS
// --------------------------------------------------

const allowedOrigins = [
  "http://localhost:5173",
  "https://dan-restaurant-1.onrender.com",
];

// --------------------------------------------------
// EXPRESS CORS
// --------------------------------------------------

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Blocked by CORS policy"));
    },
    credentials: true,
  })
);

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },

  // Force WebSocket instead of polling first
  transports: ["websocket"],
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);

// --------------------------------------------------
// ROOT ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Restaurant Ordering System API is running",
  });
});

// --------------------------------------------------
// SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();

    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
});