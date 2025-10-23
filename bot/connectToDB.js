import { configDotenv } from "dotenv";
import mysql from "mysql2/promise";

configDotenv();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

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

export const addUser = async ({ telegramId, telegramUsername }) => {
  if (await checkDublicate({ telegramId, telegramUsername })) {
    console.log("duplicate");
    return { success: false, message: "Пользователь уже существует" };
  }
  try {
    const [results] = await connection.query(
      "INSERT INTO users (telegramId, telegramUsername) VALUES (?, ?)",
      [telegramId, telegramUsername]
    );
    return { success: true, message: "Пользователь зарегистрирован", results };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Ошибка при добавлении пользователя" };
  }
};
