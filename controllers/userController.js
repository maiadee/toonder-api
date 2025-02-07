import express from "express";
import validateToken from "../middleware/validateToken.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/tokens.js";


const router = express.Router()

export default router