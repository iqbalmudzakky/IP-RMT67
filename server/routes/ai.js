const express = require("express");
const router = express.Router();
const AiController = require("../controllers/aiController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

// Semua routes di ai memerlukan authentication
router.use(authenticateToken);

// POST get game recommendation from AI
router.post("/recommend", asyncHandler(AiController.recommendGame));

// GET AI history
router.get("/history", asyncHandler(AiController.getAiHistory));

// DELETE AI request from history
router.delete("/history/:id", asyncHandler(AiController.deleteAiRequest));

module.exports = router;
