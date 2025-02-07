import express from "express";
import validateToken from "../middleware/validateToken.js";
import Profile from "../models/profile.js";

const router = express.Router();

export default router;