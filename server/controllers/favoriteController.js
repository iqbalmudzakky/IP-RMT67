const { Favorite, Game, User } = require("../models");

/**
 * FavoriteController - Mengelola semua operasi terkait favorit game
 */
class FavoriteController {
  /**
   * @route GET /favorites
   * @desc Ambil semua game favorit user yang sedang login
   * @access Private (requires authentication)
   */
  static async getUserFavorites(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User tidak terautentikasi");
        error.status = 401;
        throw error;
      }

      const favorites = await Favorite.findAll({
        where: { UserId: req.user.id },
        include: [
          {
            model: Game,
            attributes: [
              "id",
              "title",
              "genre",
              "platform",
              "publisher",
              "thumbnail",
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: "Daftar favorit user berhasil diambil",
        data: favorites,
        total: favorites.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /favorites/:gameId
   * @desc Tambah game ke daftar favorit user
   * @access Private (requires authentication)
   */
  static async addFavorite(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User tidak terautentikasi");
        error.status = 401;
        throw error;
      }

      const { gameId } = req.params;

      // Validasi game exists
      const game = await Game.findByPk(gameId);
      if (!game) {
        const error = new Error("Game tidak ditemukan");
        error.status = 404;
        throw error;
      }

      // Cek apakah sudah di favorite
      const existingFavorite = await Favorite.findOne({
        where: { UserId: req.user.id, GameId: gameId },
      });

      if (existingFavorite) {
        const error = new Error("Game sudah ada di daftar favorit");
        error.status = 400;
        throw error;
      }

      // Tambah ke favorite
      const favorite = await Favorite.create({
        UserId: req.user.id,
        GameId: gameId,
      });

      return res.status(201).json({
        success: true,
        message: "Game berhasil ditambah ke favorit",
        data: favorite,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route DELETE /favorites/:gameId
   * @desc Hapus game dari daftar favorit user
   * @access Private (requires authentication & authorization)
   */
  static async removeFavorite(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User tidak terautentikasi");
        error.status = 401;
        throw error;
      }

      const { gameId } = req.params;

      // Cari favorite
      const favorite = await Favorite.findOne({
        where: { UserId: req.user.id, GameId: gameId },
      });

      if (!favorite) {
        const error = new Error("Favorite tidak ditemukan");
        error.status = 404;
        throw error;
      }

      // Hapus favorite
      await favorite.destroy();

      return res.status(200).json({
        success: true,
        message: "Game berhasil dihapus dari favorit",
        data: {
          GameId: gameId,
          UserId: req.user.id,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FavoriteController;
