import mongoose from "mongoose";
import validator from "validator";

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name."],
  },
  age: {
    type: number,
    required: [true, "Please provide an age"],
    validate: {
      message: "You must be at least 18 years old to use this app",
      validator: (age) => age <= 18,
    },
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
    required: [true, "Please provide a gender"],
  },
  preferences: {
    type: String,
    required: [true, "Please provide a preference"],
  },
  location: {
    type: String,
    required: [true, "Please provide a location"],
  },
  passions: {
    type: String,
  },
  icks: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  profileImage: {
    type: String,
    required: [true, "Please provide a profile image"],
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
