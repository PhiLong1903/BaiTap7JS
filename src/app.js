const express = require("express");
const productRoutes = require("./routes/product.routes");
const inventoryRoutes = require("./routes/inventory.routes");

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/inventories", inventoryRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Duplicate key error",
      detail: error.keyValue,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    detail: error.message,
  });
});

module.exports = app;
