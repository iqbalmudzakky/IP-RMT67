const { AiRequest, User } = require("../models");
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * @route POST /ai/recommend
 * @desc Kirim prompt ke OpenAI API → dapatkan rekomendasi game
 * @access Private (requires authentication)
 */
const recommendGame = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("User tidak terautentikasi");
      error.status = 401;
      throw error;
    }

    if (!OPENAI_API_KEY) {
      const error = new Error("OpenAI API key tidak dikonfigurasi");
      error.status = 500;
      throw error;
    }

    const { prompt } = req.body;

    if (!prompt) {
      const error = new Error("Prompt diperlukan");
      error.status = 400;
      throw error;
    }

    try {
      // Call OpenAI API
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Anda adalah asisten rekomendasi game yang membantu pengguna menemukan game yang sesuai dengan preferensi mereka.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse =
        response.data.choices[0].message.content || "Tidak ada respons dari AI";

      // Simpan request ke database
      const aiRequest = await AiRequest.create({
        UserId: req.user.id,
        prompt,
        response: aiResponse,
      });

      return res.status(200).json({
        success: true,
        message: "Rekomendasi game berhasil diambil",
        data: {
          id: aiRequest.id,
          prompt,
          response: aiResponse,
          createdAt: aiRequest.createdAt,
        },
      });
    } catch (apiError) {
      if (apiError.response?.status === 401) {
        const error = new Error("OpenAI API key tidak valid");
        error.status = 401;
        throw error;
      }
      throw apiError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /ai/history
 * @desc Lihat semua permintaan AI user (riwayat dari tabel AIRequests)
 * @access Private (requires authentication)
 */
const getAiHistory = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("User tidak terautentikasi");
      error.status = 401;
      throw error;
    }

    const history = await AiRequest.findAll({
      where: { UserId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: req.query.limit || 50,
      offset: (req.query.page || 0) * (req.query.limit || 50),
    });

    const total = await AiRequest.count({ where: { UserId: req.user.id } });

    return res.status(200).json({
      success: true,
      message: "Riwayat AI request berhasil diambil",
      data: history,
      pagination: {
        total,
        page: req.query.page || 0,
        limit: req.query.limit || 50,
        totalPages: Math.ceil(total / (req.query.limit || 50)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /ai/history/:id
 * @desc Hapus satu riwayat AI request
 * @access Private (requires authentication & authorization)
 */
const deleteAiRequest = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("User tidak terautentikasi");
      error.status = 401;
      throw error;
    }

    const { id } = req.params;

    // Cari AI request
    const aiRequest = await AiRequest.findByPk(id);

    if (!aiRequest) {
      const error = new Error("AI request tidak ditemukan");
      error.status = 404;
      throw error;
    }

    // Authorization check - user hanya bisa delete miliknya sendiri
    if (aiRequest.UserId !== req.user.id) {
      const error = new Error("Anda tidak memiliki akses untuk menghapus ini");
      error.status = 403;
      throw error;
    }

    // Hapus
    await aiRequest.destroy();

    return res.status(200).json({
      success: true,
      message: "AI request berhasil dihapus",
      data: {
        id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendGame,
  getAiHistory,
  deleteAiRequest,
};
