import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (user) => {
  return jwt.sign(
    { user: { _id: user._id, username: user.username, profile: user.profile } },
    process.env.SECRET_KEY,
    { expiresIn: "24h" }
  );
};
