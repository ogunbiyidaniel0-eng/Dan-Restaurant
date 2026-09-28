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


const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);



const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);



app.get("/", (req, res) => {
  res.status(200).json({
    message: "Restaurant Ordering System API is running",
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();

    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
  // 1. Define all allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://dan-restaurant-1.onrender.com"
];

// 2. Configure Express CORS with a dynamic check
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests or tools like Postman (which have no origin header)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
  })
);

// 3. Configure Socket.io CORS with the array of origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

});