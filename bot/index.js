import TelegramBot from "node-telegram-bot-api";
import { startBackend } from "./backend.js";
import { addUser } from "./connectToDB.js";
import { configDotenv } from "dotenv";

configDotenv();

startBackend();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  console.log(msg);

  if (text === "/start") {
    await addUser({
      telegramId: msg.chat.id,
      telegramUsername: msg.chat.username,
    });
    bot.sendMessage(
      chatId,
      `Hello, ${msg.from.first_name}! Welcome to the bot.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Теория", callback_data: "teo" },
              { text: "Теория", callback_data: "teo1" },
              { text: "Теория", callback_data: "teo2" },
            ],
            [
              { text: "Практика", callback_data: "task1" },
              { text: "Практика", callback_data: "task2" },
            ],
            [
              {
                text: "Открыть сайт",
                web_app: { url: "https://www.twitch.tv/1ipauza1i" },
              },
            ],
          ],
        },
      }
    );
  } else if (text === "hello") {
    bot.sendMessage(chatId, "Hi there!");
  } else {
    console.log(ctx);
    bot.sendMessage(chatId, `You said: ${text}`);
  }
});

bot.on("callback_query", (ctx) => {
  if (ctx.data.includes("teo")) {
    bot.sendMessage(ctx.message.chat.id, `Ты написал теория`);
  } else {
    bot.sendMessage(ctx.message.chat.id, `Ты написал задание`);
  }
});
