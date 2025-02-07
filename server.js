import express from "express";
import mongoose from "mongoose";
import mongoSantize from "express-mongo-sanitize";
import "dotenv/config";

import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

// import controllers/routes

const app = express();
const port = process.env.PORT || 3000; 

app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

// controllers/routes

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
