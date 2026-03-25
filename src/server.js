require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
require("./models/inventory.model");
require("./models/product.model");

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/baitap7js_inventory";

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected MongoDB: ${MONGODB_URI}`);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
