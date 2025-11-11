const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

/*
⭐ Favorite Routes => need Authentication & Authorization
| Method   | Endpoint             | Deskripsi                                       |
| -------- | -------------------- | ----------------------------------------------- |
| `GET`    | `/favorites`         | Ambil semua game favorit user yang sedang login |
| `POST`   | `/favorites/:gameId` | Tambah game ke daftar favorit user              |
| `DELETE` | `/favorites/:gameId` | Hapus game dari daftar favorit user             |
*/

// Semua routes di favorite memerlukan authentication
router.use(authenticateToken);

// GET user favorites
router.get("/", asyncHandler(favoriteController.getUserFavorites));

// POST add favorite
router.post("/:gameId", asyncHandler(favoriteController.addFavorite));

// DELETE remove favorite
router.delete("/:gameId", asyncHandler(favoriteController.removeFavorite));

module.exports = router;
