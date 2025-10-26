import { Router } from "express";
import { findUserByToken } from "../utils/findUserByToken.js";
import { connection } from "../database/connection.js";

const router = Router();

/**
 * GET /me — получить информацию о пользователе + прогресс
 */
router.get("/me", async (req, res) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(400).json({ success: false, message: "Токен отсутствует" });
    }

    const user = await findUserByToken({ token });
    if (!user) {
      return res.status(404).json({ success: false, message: "Пользователь не найден" });
    }

    // Получаем прогресс пользователя по всем темам
    const [progressRows] = await connection.query(
      `
      SELECT 
        up.id,
        t.title AS topic_title,
        up.current_question,
        up.correct_answers,
        up.finished
      FROM user_progress up
      JOIN topics t ON t.id = up.topic_id
      WHERE up.user_id = ?
      `,
      [user.id]
    );

    res.status(200).json({
      success: true,
      user,
      progress: progressRows,
    });
  } catch (e) {
    console.error("Ошибка в /me:", e);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

export default router;
