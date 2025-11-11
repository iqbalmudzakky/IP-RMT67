const { verifyToken } = require("../helpers/jwt");

/**
 * Middleware untuk verifikasi JWT token
 * Token harus dikirim di header: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Get token from "Bearer <token>"

    if (!token) {
      const error = new Error("Token diperlukan");
      error.status = 401;
      throw error;
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      err.message = "Token tidak valid atau sudah kadaluarsa";
      err.status = 403;
    }
    next(err);
  }
};

module.exports = authenticateToken;
