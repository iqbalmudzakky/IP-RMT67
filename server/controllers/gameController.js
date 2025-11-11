const { Game, Favorite, User } = require("../models");
const { Op } = require("sequelize");

/**
 * GameController - Mengelola semua operasi terkait game
 */
class GameController {
  /**
   * @route GET /games
   * @desc Ambil semua game dari DB lokal
   * @access Public
   */
  static async getAllGames(req, res, next) {
    try {
      const games = await Game.findAll({
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Games berhasil diambil",
        data: games,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /games/:id
   * @desc Ambil detail game berdasarkan database ID
   * @access Public
   */
  static async getGameById(req, res, next) {
    try {
      const { id } = req.params;

      // Cari berdasarkan DB id saja
      const game = await Game.findByPk(id, {
        include: [
          {
            model: User,
            through: { attributes: [] },
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (!game) {
        const error = new Error("Game tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Detail game berhasil diambil",
        data: game,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /games/search
   * @desc Cari game berdasarkan genre, platform, atau keyword
   * @access Public
   */
  static async searchGames(req, res, next) {
    try {
      const { genre, platform, keyword } = req.query;
      const where = {};

      if (genre) {
        where.genre = {
          [Op.iLike]: `%${genre}%`,
        };
      }

      if (platform) {
        where.platform = {
          [Op.iLike]: `%${platform}%`,
        };
      }

      if (keyword) {
        where.title = {
          [Op.iLike]: `%${keyword}%`,
        };
      }

      const games = await Game.findAll({
        where: Object.keys(where).length > 0 ? where : {},
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Hasil pencarian game",
        data: games,
        total: games.length,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GameController;
