const { Game, Favorite, User } = require("../models");
const axios = require("axios");

const FREETOGAME_API = "https://www.freetogameapi.com/api/games";

/**
 * @route GET /games
 * @desc Ambil semua game dari DB lokal (cached)
 * @access Public
 */
const getAllGames = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      limit: 50,
      offset: (req.query.page || 0) * 50,
    });

    return res.status(200).json({
      success: true,
      message: "Games berhasil diambil",
      data: games,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /games/:id
 * @desc Ambil detail game berdasarkan ID
 * @access Public
 */
const getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cari berdasarkan DB id atau API id
    const game = await Game.findOne({
      where: {
        [require("sequelize").Op.or]: [{ id }, { ApiId: id }],
      },
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
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /games/search
 * @desc Cari game berdasarkan genre, platform, atau keyword
 * @access Public
 */
const searchGames = async (req, res, next) => {
  try {
    const { genre, platform, keyword } = req.query;
    const where = {};

    if (genre) where.genre = genre;
    if (platform) where.platform = platform;
    if (keyword) {
      where.title = {
        [require("sequelize").Op.iLike]: `%${keyword}%`,
      };
    }

    const games = await Game.findAll({
      where: Object.keys(where).length > 0 ? where : {},
      limit: 50,
    });

    return res.status(200).json({
      success: true,
      message: "Hasil pencarian game",
      data: games,
      total: games.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /games/clear-cache
 * @desc Hapus semua data game di DB untuk refresh ulang dari API
 * @access Public (Sebaiknya dibatasi hanya admin)
 */
const clearGameCache = async (req, res, next) => {
  try {
    const deletedCount = await Game.destroy({
      where: {},
      force: true,
    });

    return res.status(200).json({
      success: true,
      message: "Cache game berhasil dihapus",
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGames,
  getGameById,
  searchGames,
  clearGameCache,
};
