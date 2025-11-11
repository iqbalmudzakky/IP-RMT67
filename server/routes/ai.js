const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

/*
🧠 AI Routes (OpenAI Integration) => need Authentication
| Method | Endpoint            | Deskripsi                                                                          |
| ------ | ------------------- | ---------------------------------------------------------------------------------- |
| `POST` | `/ai/recommend`     | Kirim prompt ke OpenAI API → dapatkan rekomendasi game serupa / deskripsi tambahan |
| `GET`  | `/ai/history`       | Lihat semua permintaan AI user (riwayat dari tabel `AIRequests`)                   |
| `DELETE` | `/ai/history/:id` | Hapus satu riwayat AI request                                                     |
*/

// Semua routes di ai memerlukan authentication
router.use(authenticateToken);

// POST get game recommendation from AI
router.post("/recommend", asyncHandler(aiController.recommendGame));

// GET AI history
router.get("/history", asyncHandler(aiController.getAiHistory));

// DELETE AI request from history
router.delete("/history/:id", asyncHandler(aiController.deleteAiRequest));

module.exports = router;
