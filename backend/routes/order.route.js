const express = require("express");

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  initializePayment,
  verifyPayment,
  trackOrder,
  cancelOrder,
} = require("../controllers/order.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Create a new order
router.post("/", createOrder);

// Initialize Flutterwave payment
router.post("/:id/initialize-payment", initializePayment);

// Verify Flutterwave payment
router.get("/:id/verify-payment", verifyPayment);

// PUBLIC: Track an order using the customer-facing Order ID
// Keep this BEFORE "/:id" so Express does not treat "track"
// as an order MongoDB ID.
router.get("/track/:orderNumber", trackOrder);

// PUBLIC: Customer cancels an order
router.patch("/track/:orderNumber/cancel", cancelOrder);

// Admin: Get all orders
router.get("/", protect, getAllOrders);

// Admin: Get a specific order
router.get("/:id", protect, getOrderById);

// Admin: Update order status
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;