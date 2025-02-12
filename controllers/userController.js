import express from "express";
import validateToken from "../middleware/validateToken.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/tokens.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    const token = generateToken(user);

    return res.status(201).json({
      message: "✨ Welcome aboard! Your love story begins now. 💕",
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const foundUser = await User.findOne({
      $or: [{ username: req.body.identifier }, { email: req.body.identifier }],
    });

    if (!foundUser) {
      console.log("Username or email was incorrect");
      return res.status(401).json({
        message:
          "😢 No match found! Double-check your username or email and try again.",
      });
    }

    if (!foundUser.isPasswordValid(req.body.password))
      return res.status(401).json({
        message:
          "🔒 Incorrect password! Love is about trust—let's get this right.",
      });

    const token = generateToken(foundUser);

    return res.json({
      message: "💖 Love is in the air! You're logged in and ready to connect.",
      token,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
