import mongoose from "mongoose";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import Message from "../models/message.js";
import profiles from "../profileData.js";
import users from "../userData.js";

import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log(`hello seed`);

  await mongoose.connect(process.env.MONGODB_URI);

  console.log(`connected to mongoose`);

  await mongoose.connection.db.dropDatabase();

  console.log(`database cleared`);

  await User.create();
  await Profile.create();

  const newUsers = await User.create(users);
  console.log(newUsers);

  const newProfiles = await Profile.create(profiles);
  console.log(newProfiles);

  const profileWithUser = profiles.map((profile, idx) => {
    return { ...profile, owner: newUsers[idx]._id };
  });

  await newProfiles[0].save();

  await mongoose.disconnect();
  console.log(`disconnected from mongoose`);
}

seed();
