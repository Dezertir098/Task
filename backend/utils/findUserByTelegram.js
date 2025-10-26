import { connection } from "../database/connection.js";

export const findUserByTelegram = async ({ telegramId, telegramUsername }) => {
  const [results] = await connection.query(
    "SELECT * FROM users WHERE telegramId = ? OR telegramUsername = ?",
    [telegramId, telegramUsername]
  );
  return results[0];
};