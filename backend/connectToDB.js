import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { connection } from "./database/connection.js";
import { checkDublicate } from "./utils/checkDublicate.js";
import { findUserByTelegram } from "./utils/findUserByTelegram.js";

configDotenv();

/**
 * Добавление пользователя в БД
 */
export const addUser = async ({ telegramId, telegramUsername }) => {
  const dateNow = Date.now();
  const accessToken = jwt.sign(
    { telegramId, telegramUsername, dateNow },
    process.env.PRIVATE_KEY
  );

  if (await checkDublicate({ telegramId, telegramUsername })) {
    const user = await findUserByTelegram({ telegramId, telegramUsername });
    return { success: true, message: "Пользователь уже существует", user };
  }

  try {
    const [results] = await connection.query(
      "INSERT INTO users (telegramId, telegramUsername, accessToken) VALUES (?, ?, ?)",
      [telegramId, telegramUsername, accessToken]
    );
    return { success: true, message: "Пользователь зарегистрирован", user: { id: results.insertId, telegramId, telegramUsername, token: results.accessToken } };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Ошибка при добавлении пользователя" };
  }
};


/**
 * Создаёт или возвращает существующую тему
 */
export async function createOrGetTopic(title) {
  const [rows] = await connection.query("SELECT id FROM topics WHERE title = ?", [title]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await connection.query("INSERT INTO topics (title) VALUES (?)", [title]);
  return result.insertId;
}

/**
 * Добавляет тест (вопрос и правильный ответ)
 */
export async function addTest(topicId, question, correctAnswer) {
  await connection.query(
    "INSERT INTO tests (topic_id, question, correct_answer) VALUES (?, ?, ?)",
    [topicId, question, correctAnswer]
  );
  console.log(`✅ Добавлен тест: ${question} → ${correctAnswer}`);
}

/**
 * Получить все темы
 */
export async function getTopics() {
  const [rows] = await connection.query("SELECT * FROM topics");
  return rows;
}

/**
 * Получить все тесты по теме
 */
export async function getTestsByTopic(topicId) {
  const [rows] = await connection.query("SELECT * FROM tests WHERE topic_id = ?", [topicId]);
  return rows;
}

/**
 * Получить или создать прогресс пользователя по теме
 */
export async function getOrCreateProgress(userId, topicId) {
  const [rows] = await connection.query(
    "SELECT * FROM user_progress WHERE user_id = ? AND topic_id = ?",
    [userId, topicId]
  );

  if (rows.length > 0) return rows[0];

  const [result] = await connection.query(
    `INSERT INTO user_progress (user_id, topic_id, current_question, correct_answers, finished)
    VALUES (?, ?, 0, 0, 0)`,
    [userId, topicId]
  );

  return {
    id: result.insertId,
    user_id: userId,
    topic_id: topicId,
    current_question: 0,
    correct_answers: 0,
    finished: 0
  };
}

/**
 * Обновить прогресс (например, после ответа)
 */
export async function updateProgress(progressId, correct, current) {
  await connection.query(
    "UPDATE user_progress SET correct_answers = ?, current_question = ? WHERE id = ?",
    [correct, current, progressId]
  );
}

/**
 * Завершить тест
 */
export async function finishProgress(progressId) {
  await connection.query("UPDATE user_progress SET finished = 1 WHERE id = ?", [progressId]);
}
