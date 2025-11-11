const { User } = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");

/**
 * AuthController - Mengelola semua operasi autentikasi
 */
class AuthController {
  /**
   * @route POST /auth/google
   * @desc Login/Register user via Google OAuth
   * @access Public
   */
  static async googleLogin(req, res, next) {
    try {
      const { GoogleId, name, email } = req.body;

      if (!GoogleId || !email) {
        const error = new Error("GoogleId dan email diperlukan");
        error.status = 400;
        throw error;
      }

      // Cek apakah user sudah terdaftar
      let user = await User.findOne({ where: { GoogleId } });

      if (!user) {
        // Jika belum, buat user baru
        user = await User.create({
          name,
          email,
          GoogleId,
          password: null, // Google login tidak memerlukan password
        });
      } else {
        // Update data jika sudah ada
        user = await user.update({ name, email });
      }

      // Generate JWT token
      const token = generateToken({ id: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: "Google login berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /auth/register
   * @desc Register user baru dengan email & password
   * @access Public
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, passwordConfirm } = req.body;

      // Validasi input
      if (!name || !email || !password || !passwordConfirm) {
        const error = new Error("Semua field harus diisi");
        error.status = 400;
        throw error;
      }

      if (password !== passwordConfirm) {
        const error = new Error("Password dan konfirmasi password tidak sesuai");
        error.status = 400;
        throw error;
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const error = new Error("Email sudah terdaftar");
        error.status = 400;
        throw error;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Buat user baru
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        GoogleId: null,
      });

      // Generate JWT token
      const token = generateToken({ id: user.id, email: user.email });

      return res.status(201).json({
        success: true,
        message: "Registrasi berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /auth/login
   * @desc Login user dengan email & password
   * @access Public
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        const error = new Error("Email dan password diperlukan");
        error.status = 400;
        throw error;
      }

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email } });

      if (!user || !user.password) {
        const error = new Error("Email atau password salah");
        error.status = 401;
        throw error;
      }

      // Cek password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        const error = new Error("Email atau password salah");
        error.status = 401;
        throw error;
      }

      // Generate JWT token
      const token = generateToken({ id: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /auth/profile
   * @desc Ambil profil user yang sedang login
   * @access Private (requires token)
   */
  static async getProfile(req, res, next) {
    try {
      // req.user harus di-set oleh middleware authentication
      if (!req.user) {
        const error = new Error(
          "Token tidak valid atau user tidak terautentikasi"
        );
        error.status = 401;
        throw error;
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Profil user berhasil diambil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /auth/logout
   * @desc Logout user (hapus session/token dari client)
   * @access Private (requires token)
   */
  static async logout(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: "Logout berhasil. Silakan hapus token dari client.",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
