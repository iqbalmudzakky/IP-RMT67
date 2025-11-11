const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { asyncHandler } = require("../middleware/errorHandler");

/*
🎮 Game Routes
| Method   | Endpoint                         | Deskripsi                                          |
| -------- | -------------------------------- | -------------------------------------------------- |
| `GET`    | `/games`                         | Ambil semua game dari DB lokal (cached)            |
| `GET`    | `/games/:id`                     | Ambil detail game berdasarkan ID (local DB id)     |
| `GET`    | `/games/search?genre=&platform=` | Cari game berdasarkan genre, platform, atau keyword |
| `DELETE` | `/games/clear-cache`             | Hapus semua data game di DB                         |

Note: Data game di-seed dari FreeToGame API saat migration
*/

// GET all games (dengan pagination)
router.get("/", asyncHandler(gameController.getAllGames));

// GET search games (harus sebelum :id route)
router.get("/search", asyncHandler(gameController.searchGames));

// GET detail game by ID
router.get("/:id", asyncHandler(gameController.getGameById));

// DELETE clear cache
router.delete("/clear-cache", asyncHandler(gameController.clearGameCache));

module.exports = router;
