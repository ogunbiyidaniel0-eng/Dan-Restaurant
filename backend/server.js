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

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});


app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Restaurant Ordering System API is running",
  });
});

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});