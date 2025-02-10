import express from "express";
import validateToken from "../middleware/validateToken.js";
import Profile from "../models/profile.js";

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

    if (!req.user._id.equals(profile._id))
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
// * not tested!

router.get("/profiles", validateToken, async (req, res, next) => {
  try {
    const { preference } = req.query;

    // if gender is provided, filter by it
    const filter = preference ? { preference } : {};

    const filteredProfiles = await Profile.filter(filter)
      .populate("name")
      .populate("age")
      .populate("location")
      .populate("profileImage");

    const randomProfile = await filteredProfiles[
      Math.floor(Math.random() * filteredProfiles.length)
    ];
    return res.json(randomProfile);
  } catch (error) {}
});

// Show all matches

router.get("profiles/matches", validateToken, async (req, res, next) => {
    try {
        const userId = req.user._id; // Extract user ID from the JWT token

        // Find the user's profile using the user ID from the token
        const userProfile = await Profile.findOne({ owner: userId });

        // Get the user's matches array from their profile
        const userMatches = userProfile.matches;

        // If no matches, return an empty array
        if (!userMatches || userMatches.length === 0) {
          return res.json([]);
        }

        // Find all profiles where the owner's ID is in the matches array
        const matchedProfiles = await Profile.find({
          profile: { $in: userMatches }, // Match profiles where `owner` is in the `matches` array
        });

        // Return the matched profiles
        res.json(matchedProfiles);
    } catch (error) {
        
    }
})

// testing

// Delete a match

// Like a profile

// Dislike a profile

export default router;
