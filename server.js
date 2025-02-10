import express from "express";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import "dotenv/config";

import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

// import controllers/routes

import userController from "./controllers/userController.js";
import profileController from "./controllers/profileController.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

// controllers/routes
app.use("/", userController);
app.use("/", profileController);

app.use(errorHandler);

const establishServerConnections = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("👍 Database connection established");

    // Listen for server connections
    app.listen(port, () =>
      console.log(`🚀 Server up and running on port ${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};
establishServerConnections();
