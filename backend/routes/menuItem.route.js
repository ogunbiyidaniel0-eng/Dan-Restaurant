const express = require("express");
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require("../controllers/menuItem.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();


router.get("/", getAllMenuItems);
router.get("/:id", getMenuItemById);

router.post("/", protect, createMenuItem);
router.put("/:id", protect, updateMenuItem);
router.delete("/:id", protect, deleteMenuItem);
router.patch("/:id/toggle-availability", protect, toggleAvailability);

module.exports = router;