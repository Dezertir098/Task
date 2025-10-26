import { configDotenv } from "dotenv";
import { connection } from "../database/connection.js";

configDotenv();

export const findUserByToken = async ({ token }) => {
  const [rows] = await connection.query("SELECT * FROM users WHERE accessToken = ?", [token]);
  return rows[0];
};
