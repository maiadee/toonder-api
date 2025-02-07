import express from "express";
import validateToken from "../middleware/validateToken.js";
import Message from "../models/message.js";

const router = express.Router();

export default router;