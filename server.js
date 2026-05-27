const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const db = require("./config/db");
require("dotenv").config();

// Route Imports
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Attach io to app for use in controllers
app.set("socketio", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Socket.IO Logic for Real-time Tracking
// Keep track of which agent is handling which order
const activeAgents = new Map(); // socket.id -> { orderId, userId }

io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🏠 User ${socket.id} joined room: ${room}`);
  });

    // REAL AGENT LOCATION UPDATE
    socket.on("agentLocationUpdate", async (data) => {
        const { orderId, userId, lat, lng } = data;
        const updateData = { orderId, lat, lng, status: 'online' };

        // Register this socket as the agent for this order
        activeAgents.set(socket.id, { orderId, userId });

        // Broadcast to Customer Room
        io.to(`user_${userId}`).emit("deliveryLocationUpdate", updateData);
        
        // Broadcast to Admin Radar Room
        io.to("admin_tracking").emit("deliveryLocationUpdate", updateData);

    // Persist to DB (using a slight debounce or just updating the 'current' position)
    try {
      await db.query(
        "UPDATE orders SET agent_lat = $1, agent_lng = $2 WHERE id = $3",
        [lat, lng, orderId]
      );
    } catch (err) {
      console.error("❌ Failed to persist agent location:", err.message);
    }
  });

  // Admin starts a live simulation for an order
  socket.on("startSimulation", (data) => {
    const { orderId, userId, start, end } = data;
    console.log(`🚀 Starting Global Simulation for Order #${orderId}`);

    let currentLat = start.lat;
    let currentLng = start.lng;
    const steps = 30; // Move over 30 seconds
    const latStep = (end.lat - start.lat) / steps;
    const lngStep = (end.lng - start.lng) / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentLat += latStep;
      currentLng += lngStep;
      currentStep++;

      const updateData = { orderId, lat: currentLat, lng: currentLng };
      
      // Notify User Room
      io.to(`user_${userId}`).emit("deliveryLocationUpdate", updateData);
      
      // Notify Admin Radar Room
      io.to("admin_tracking").emit("deliveryLocationUpdate", updateData);

      if (currentStep >= steps) {
        clearInterval(interval);
        console.log(`✅ Simulation finished for Order #${orderId}`);
      }
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
    
    // Check if this was an agent
    const agent = activeAgents.get(socket.id);
    if (agent) {
        // Notify user that agent is offline
        io.to(`user_${agent.userId}`).emit("deliveryLocationUpdate", {
            orderId: agent.orderId,
            status: 'offline'
        });
        activeAgents.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
🚀 Server running on http://localhost:${PORT}
📁 Static files served from /uploads
📡 Socket.IO initialized for real-time tracking
  `);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Try killing the process using this port:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT} -> taskkill /F /PID <PID>`);
    console.error(`   Linux/Mac: lsof -i :${PORT} -> kill -9 <PID>`);
    process.exit(1);
  } else {
    console.error(err);
  }
});
// Export for Vercel / Modular use
module.exports = { app, server };
