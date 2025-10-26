import mysql from "mysql2/promise";
import { configDotenv } from "dotenv";

configDotenv();

console.log('🟡 Подключаюсь к базе данных...');

export const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

console.log('🟢 Подключение к базе успешно!');