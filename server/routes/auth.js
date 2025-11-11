const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

/*
🔑Auth Routes (Google & Manual Login)
| Method | Endpoint         | Deskripsi                                                                  |
| ------ | ---------------- | -------------------------------------------------------------------------- |
| `POST` | `/auth/google`   | Login / register user via Google OAuth, simpan atau update data user di DB |
| `POST` | `/auth/login`    | (Opsional) Login manual dengan email & password                            |
| `POST` | `/auth/register` | (Opsional) Register manual user baru                                       |
| `GET`  | `/auth/profile`  | Ambil profil user yang sedang login (requires token)                       |
| `POST` | `/auth/logout`   | Logout dan hapus session/token                                             |
*/

// Public Routes
router.post("/google", asyncHandler(authController.googleLogin));
router.post("/login", asyncHandler(authController.login));
router.post("/register", asyncHandler(authController.register));

// Private Routes (requires authentication)
router.get(
  "/profile",
  authenticateToken,
  asyncHandler(authController.getProfile)
);
router.post("/logout", authenticateToken, asyncHandler(authController.logout));

module.exports = router;
