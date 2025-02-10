import express from "express";
import validateToken from "../middleware/validateToken.js";
import Message from "../models/message.js";

const router = express.Router();

router.post("/profiles/matches/:id", validateToken, async (req, res, next) => {


})

export default router;