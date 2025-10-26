import { connection } from "../database/connection.js";

export const checkDublicate = async ({ telegramId, telegramUsername }) => {
  try {
    const [results] = await connection.query(
      "SELECT * FROM users WHERE telegramId = ? OR telegramUsername = ?",
      [telegramId, telegramUsername]
    );
    return results.length > 0;
  } catch (e) {
    console.error(e);
    return false;
  }
};