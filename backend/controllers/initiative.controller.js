import Initiative from "../models/Initiative.model.js";
import User from "../models/user.model.js";

const createInitiative = async (req, res) => {
  try {
    const { title, description, imgUrl, category, location } = req.body;
    const userId = req.userId; // Use userId from auth middleware

    const Initiativeinfo = {
      leader: userId,
      title,
      description,
      imgUrl,
      category,
      location,
      members: [userId],
    };
    const MakeInitiative = new Initiative(Initiativeinfo);
    const InitiativeSuccess = await MakeInitiative.save();
    
    // Populate the leader before sending response
    const populatedInitiative = await Initiative.findById(InitiativeSuccess._id).populate("leader");
    
    res.status(201).json({ message: "Initiative created successfully!", initiative: populatedInitiative });
  } catch (err) {
    console.error("Error creating initiative:", err);
    res.status(500).json({ message: "Failed to create initiative." });
  }
};

const getInitiatives = async (req, res) => {
  try {
    const initiatives = await Initiative.find({}).populate("leader").populate("members");
    res.status(200).json({ List : initiatives });
  } catch (err) {
    console.error("Error fetching initiatives:", err);
    res.status(500).json({ message: "Failed to fetch initiatives." });
  }
};

const memberAction = async (req, res) => {
  try {
    const { initiativeId, action } = req.body;
    const userId = req.userId; // Use userId from auth middleware
    
    // Find the initiative and update its members based on the action
    const initiative = await Initiative.findById(initiativeId);
    if(userId.toString() === initiative.leader.toString()){
        return res.status(200).json({ message: "You are the leader of this initiative." });
    }
    if (action === "join") {
      await Initiative.findByIdAndUpdate(
        initiativeId,
        { $addToSet: { members: userId } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { initiatives: initiativeId } },
        { new: true }
      );
    } else if (action === "leave") {
      await Initiative.findByIdAndUpdate(initiativeId, {
        $pull: { members: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { initiatives: initiativeId },
      });
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }
    return res
      .status(200)
      .json({ message: "Member action processed successfully." });
  } catch (err) {
    console.error("Error processing member action:", err);
    res.status(500).json({ message: "Failed to process member action." });
  }
};

export { createInitiative, getInitiatives, memberAction };
