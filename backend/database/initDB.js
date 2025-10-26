import { configDotenv } from 'dotenv';
import { connection } from './connection.js';

configDotenv();

export async function initDatabase() {

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      telegramId BIGINT UNIQUE NOT NULL,
      telegramUsername VARCHAR(255),
      accessToken VARCHAR(255)
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic_id INT NOT NULL,
      question TEXT NOT NULL,
      correct_answer VARCHAR(255) NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      topic_id INT NOT NULL,
      current_question INT DEFAULT 0,
      correct_answers INT DEFAULT 0,
      finished TINYINT(1) DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      UNIQUE(user_id, topic_id)
    );
  `);

  console.log('Таблицы созданы');
}

initDatabase();
