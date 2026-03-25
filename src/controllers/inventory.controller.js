const mongoose = require("mongoose");
const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }
  return quantity;
};

const ensureProductExists = async (productId) => {
  const product = await Product.findById(productId).select("_id");
  return Boolean(product);
};

const getAllInventories = async (req, res, next) => {
  try {
    const inventories = await Inventory.find()
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Get inventories successfully",
      data: inventories,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid inventory id" });
    }

    const inventory = await Inventory.findById(id).populate("product");
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    return res.status(200).json({
      message: "Get inventory successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const addStock = async (req, res, next) => {
  try {
    const { product, quantity: rawQuantity } = req.body;
    const quantity = parseQuantity(rawQuantity);

    if (!isValidObjectId(product) || !quantity) {
      return res
        .status(400)
        .json({ message: "product and quantity (> 0) are required" });
    }

    const productExists = await ensureProductExists(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { product },
      {
        $setOnInsert: { product, reserved: 0, soldCount: 0 },
        $inc: { stock: quantity },
      },
      { new: true, upsert: true }
    ).populate("product");

    return res.status(200).json({
      message: "Add stock successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const removeStock = async (req, res, next) => {
  try {
    const { product, quantity: rawQuantity } = req.body;
    const quantity = parseQuantity(rawQuantity);

    if (!isValidObjectId(product) || !quantity) {
      return res
        .status(400)
        .json({ message: "product and quantity (> 0) are required" });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    ).populate("product");

    if (!inventory) {
      const existed = await Inventory.findOne({ product }).select("_id");
      return res.status(existed ? 409 : 404).json({
        message: existed
          ? "Insufficient stock to remove"
          : "Inventory for product not found",
      });
    }

    return res.status(200).json({
      message: "Remove stock successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const reservation = async (req, res, next) => {
  try {
    const { product, quantity: rawQuantity } = req.body;
    const quantity = parseQuantity(rawQuantity);

    if (!isValidObjectId(product) || !quantity) {
      return res
        .status(400)
        .json({ message: "product and quantity (> 0) are required" });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true }
    ).populate("product");

    if (!inventory) {
      const existed = await Inventory.findOne({ product }).select("_id");
      return res.status(existed ? 409 : 404).json({
        message: existed
          ? "Insufficient stock for reservation"
          : "Inventory for product not found",
      });
    }

    return res.status(200).json({
      message: "Reservation successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const sold = async (req, res, next) => {
  try {
    const { product, quantity: rawQuantity } = req.body;
    const quantity = parseQuantity(rawQuantity);

    if (!isValidObjectId(product) || !quantity) {
      return res
        .status(400)
        .json({ message: "product and quantity (> 0) are required" });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { product, reserved: { $gte: quantity } },
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true }
    ).populate("product");

    if (!inventory) {
      const existed = await Inventory.findOne({ product }).select("_id");
      return res.status(existed ? 409 : 404).json({
        message: existed
          ? "Insufficient reserved quantity to mark sold"
          : "Inventory for product not found",
      });
    }

    return res.status(200).json({
      message: "Sold successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInventories,
  getInventoryById,
  addStock,
  removeStock,
  reservation,
  sold,
};
