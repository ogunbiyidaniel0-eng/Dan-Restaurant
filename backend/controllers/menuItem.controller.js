const MenuItem = require("../models/menuItem.model");


const getAllMenuItems = async (req, res) => {
  try {
    const { category } = req.query; // e.g. /api/menu?category=Rice

    const filter = category ? { category } : {};

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Get All Menu Items Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Get Menu Item Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin only — add a new item
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({
        error: "Name, price, image and category are required",
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      image,
      category,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create Menu Item Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin only — edit an existing item
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const { name, description, price, image, category } = req.body;

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error("Update Menu Item Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin only — delete an item permanently
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    console.error("Delete Menu Item Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error("Toggle Availability Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};