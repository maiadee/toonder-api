import express from "express";
import validateToken from "../middleware/validateToken.js";
import Profile from "../models/profile.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/profiles", validateToken, async (req, res, next) => {
  try {
    const profile = await Profile.create(req.body);
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile: profile._id } },
      { new: true }
    );
    console.log(updateUser);
    return res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

router.get("/profiles/matches", validateToken, async (req, res, next) => {
  try {
    const userProfile = await Profile.findById(req.user.profile).populate(
      "matches"
    );

    res.json(userProfile.matches);
  } catch (error) {
    next(error);
  }
});

router.get("/profiles/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id)
      .populate("name")
      .populate("age")
      .populate("bio")
      .populate("location")
      .populate("gender")
      .populate("passions")
      .populate("icks")
      .populate("profileImage");

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.put("/profiles/:id", validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (!req.user.profile.equals(profile._id))
      return res
        .status(403)
        .json({ message: "You do not have permssion to access this resource" });

    const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
    });

    return res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

router.get("/profiles", validateToken, async (req, res, next) => {
  try {
    const userProfileId = req.user.profile; // Current user's profile ID
    const userProfile = await Profile.findById(userProfileId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const likedProfiles = userProfile.likes || []; // Profiles the user has liked

    // Build query to exclude liked profiles and the user's own profile
    let query = {
      _id: { $nin: [...likedProfiles, userProfileId] }, // Exclude liked and own profile
      gender: userProfile.preferences, // Match gender to user's preferences
      preferences: userProfile.gender, // Match preferences to user's gender
    };

    // Remove gender filter if preference is "no preference"
    if (userProfile.preferences === "no preference") {
      delete query.gender;
    }

    // Fetch filtered profiles, selecting only the fields you want
    const filteredProfiles = await Profile.find(query).select(
      "name age location profileImage"
    );

    res.json(filteredProfiles);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/profiles/matches/:id",
  validateToken,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const profile = await Profile.findById(id);

      if (!req.user.profile.equals(profile._id))
        return res.status(403).json({
          message: "You do not have permssion to access this resource",
        });

      await Profile.findByIdAndDelete(id, req.body, {
        returnDocument: "after",
      });

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/profiles/:id/likes", validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const loggedInProfileId = req.user.profile;

    const loggedInProfile = await Profile.findById(loggedInProfileId);
    const likedProfile = await Profile.findById(id);

    console.log(loggedInProfile);
    console.log(likedProfile);

    loggedInProfile.likes.push(id);

    let message = "👍💖 You have successfully liked this profile!";

    if (likedProfile.likes.includes(loggedInProfileId)) {
      loggedInProfile.matches.push(id);
      likedProfile.matches.push(loggedInProfileId);

      message = "💖💍 It's a match!";
    }

    await loggedInProfile.save();
    await likedProfile.save();

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
});

router.put("/profiles/:id/dislikes", validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const loggedInProfileId = req.user.profile;

    const loggedInProfile = await Profile.findById(loggedInProfileId);
    const dislikedProfile = await Profile.findById(id);

    if (!loggedInProfile || !dislikedProfile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    if (!loggedInProfile.dislikes.includes(id)) {
      loggedInProfile.dislikes.push(id);
    }

    await loggedInProfile.save();

    res
      .status(200)
      .json({ message: "👎💔 You have successfully disliked this profile!" });
  } catch (error) {
    next(error);
  }
});

export default router;
