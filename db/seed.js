import mongoose from "mongoose";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import Message from "../models/message.js";
import profiles from "../data/profileData.js";
import users from "../data/userData.js";

import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("hello seed");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connected to mongoose");

  await mongoose.connection.db.dropDatabase();
  console.log("database cleared");

  // First create all profiles
  const newProfiles = await Profile.create(profiles);
  console.log(newProfiles);

  // Map the users with profile references
  const usersWithProfiles = users.map((user, idx) => ({
    ...user,
    profile: newProfiles[idx]._id, // Assign the profile ID to the user
  }));

  // Create users with profile references
  const newUsers = await User.create(usersWithProfiles);
  console.log(newUsers);

  await mongoose.disconnect();
  console.log("disconnected from mongoose");
}

seed();
