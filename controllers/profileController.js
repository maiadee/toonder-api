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

router.get(
  "/profiles/:profileId/matches",
  validateToken,
  async (req, res, next) => {
    try {
      const userProfile = await Profile.findById(req.user.profile).populate({
        path: "matches",
        select: "name age location profileImage", // Only include these fields
      });
      console.log(userProfile.matches);

      res.json(userProfile.matches);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/profiles/index", validateToken, async (req, res, next) => {
  try {
    const userProfileId = req.user.profile; // Current user's profile ID

    const userProfile = await Profile.findById(userProfileId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const likedProfiles = userProfile.likes || []; // Profiles the user has liked
    const dislikedProfiles = userProfile.dislikes || []; // Profiles the user has disliked

    let query = {
      _id: { $nin: [...likedProfiles, ...dislikedProfiles, userProfileId] }, // Exclude liked, disliked, and own profile
    };

    // Apply gender and preferences filtering only if the user has preferences
    if (userProfile.preferences !== "No Preference") {
      query.gender = userProfile.preferences; // Match gender to user's preferences
      query.preferences = userProfile.gender; // Match preferences to user's gender
    }

    // Fetch one random profile that matches the query
    const filteredProfiles = await Profile.find(query)
      .select("name age location profileImage")
      .limit(1);

    res.json(filteredProfiles[0] || null); // Send the first profile or null if no matches
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

router.delete(
  "/profiles/matches/:id",
  validateToken,
  async (req, res, next) => {
    try {
      const { id } = req.params; // ID of the match to remove

      // Fetch the logged-in user's profile
      const userProfile = await Profile.findById(req.user.profile);

      if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // Remove the match from the logged-in user's matches array
      userProfile.matches = userProfile.matches.filter(
        (matchId) => matchId.toString() !== id
      );

      // Save the updated profile
      await userProfile.save();

      return res.sendStatus(204); // Successfully removed match
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

    // Add the disliked profile to the dislikes array if not already present
    if (!loggedInProfile.dislikes.includes(id)) {
      loggedInProfile.dislikes.push(id);
    }

    await loggedInProfile.save();
    await dislikedProfile.save();

    // Build query to find the next profile, excluding disliked profiles and the logged-in user
    const query = {
      _id: { $nin: [...loggedInProfile.dislikes, loggedInProfileId] }, // Exclude disliked profiles and own profile
      gender: loggedInProfile.preferences, // Match gender to user's preferences
      preferences: loggedInProfile.gender, // Match preferences to user's gender
    };

    // Remove the gender filter if the user's preference is "no preference"
    if (loggedInProfile.preferences === "no preference") {
      delete query.gender;
    }

    // Fetch the next available profile that is neither liked nor disliked
    const nextProfile = await Profile.find(query)
      .select("name age location profileImage")
      .limit(1);

    if (!nextProfile.length) {
      return res.status(200).json({
        message: "No more profiles available.",
        nextProfile: null,
      });
    }

    // Send back the next profile
    return res.status(200).json({
      message: "👎💔 You have successfully disliked this profile!",
      nextProfile: nextProfile[0], // Send the next profile (first profile in the array)
    });
  } catch (error) {
    next(error);
  }
});


export default router;
