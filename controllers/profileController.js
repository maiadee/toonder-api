import express from "express";
import validateToken from "../middleware/validateToken.js";
import Profile from "../models/profile.js";
import User from "../models/user.js";

const router = express.Router();

// Create your profile

router.post("/profiles", validateToken, async (req, res, next) => {
  try {
    req.body._id = req.user._id;
    const profile = await Profile.create(req.body);
    return res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

// Show all matches

router.get("/profiles/matches", validateToken, async (req, res, next) => {
  try {
    // Find the user's profile using the user ID from the token
    const userProfile = await Profile.findById(req.user.profile).populate(
      "matches"
    );

    // Return the matched profiles
    res.json(userProfile.matches);
  } catch (error) {
    next(error);
  }
});

// Show a single profile

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

// Update your profile

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

// Show filtered list of all potential matches

router.get("/profiles", validateToken, async (req, res, next) => {
  try {
    const userProfileId = req.user.profile;
    const userProfile = await Profile.findById(userProfileId);

    const likedProfiles = userProfile.likes || [];

    let query = {
      _id: { $nin: [...likedProfiles, userProfileId] }, // Exclude own profile and liked profiles
      gender: userProfile.preferences, // Match profiles with the gender you prefer
      preferences: userProfile.gender, // Match profiles who prefer your gender
    };

    // If either party prefers 'both', include them
    if (userProfile.preferences === "no preference") {
      delete query.gender; // Don't filter by gender if user prefers both
    }

    const filteredProfiles = await Profile.find(query)
      .populate("name")
      .populate("age")
      .populate("location")
      .populate("profileImage");

    res.json(filteredProfiles);
  } catch (error) {
    next(error);
  }
});

// Delete a match

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

// Like a profile

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

    // Check if mutual like exists (i.e., profile already liked the user)
    if (likedProfile.likes.includes(loggedInProfileId)) {
      // Add to matches if not already there
      loggedInProfile.matches.push(id);
      likedProfile.matches.push(loggedInProfileId);

      message = "💖💍 It's a match!";
    }

    // Save profile's updated likes
    await loggedInProfile.save();
    await likedProfile.save();

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
});

// Dislike a profile

router.put("/profiles/:id", validateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const user = await User.findById(userId);
    const profile = await Profile.findById(id);

    // check whether users id exists in profile's like array
    user.dislikes.push(id);

    await user.save();

    res
      .status(200)
      .json({ message: "👎💔 You have successfully disliked this profile!" });
  } catch (error) {
    next(error);
  }
});

export default router;
