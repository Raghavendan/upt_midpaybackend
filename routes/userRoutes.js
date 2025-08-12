// routes/userRoutes.js
import express from "express";

const router = express.Router();

// Example GET route - Fetch user profile
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // In real-world: Fetch from DB
    const dummyUser = {
      id: userId,
      username: "JohnDoe",
      email: "john@example.com",
    };
    res.json(dummyUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Example POST route - Create new user
router.post("/", async (req, res) => {
  try {
    const { username, email } = req.body;
    // In real-world: Save to DB
    res.status(201).json({
      message: "User created successfully",
      user: { id: Date.now(), username, email },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
