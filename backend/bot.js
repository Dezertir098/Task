import TelegramBot from "node-telegram-bot-api";
import { startBackend } from "./index.js";
import { addUser } from "./connectToDB.js";
import {
  createOrGetTopic,
  addTest,
  getTopics,
  getTestsByTopic,
  getOrCreateProgress,
  updateProgress,
  finishProgress,
} from "./connectToDB.js";
import { configDotenv } from "dotenv";

configDotenv();
startBackend();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 🔐 ID администратора
const ADMIN_ID = process.env.ADMIN_ID;

// 🔸 Состояния пользователей и админов в рамках сессий
const userState = {}; // { chatId: { topicId, tests, currentIndex, correct, total, progressId, waitingAnswer } }
const adminState = {}; // { chatId: { step, topicId, question } }

// ===========================
// 🧩 ОСНОВНОЙ ОБРАБОТЧИК СООБЩЕНИЙ
// ===========================
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // 🚀 Команда /start
  if (text === "/start") {
    const { user } = await addUser({
      telegramId: msg.chat.id,
      telegramUsername: msg.chat.username,
    });

    const topics = await getTopics();
    const buttons = topics.map((t) => [{ text: t.title, callback_data: `topic_${t.id}` }]);

    bot.sendMessage(
      chatId,
      `Войдите`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Войти", url: `http://127.0.0.1:5501/redirect.html?token=${user?.accessToken}` },
            ]
          ]
        },
      }
    );

    bot.sendMessage(
      chatId,
      `Hello, ${msg.from.first_name}! Добро пожаловать 👋\nВыберите тему для прохождения теста:`,
      {
        reply_markup: {
          inline_keyboard: buttons
        },
      }
    );

    return;
  }

  // 🧩 Пользователь отвечает на вопрос
  if (userState[chatId]?.waitingAnswer) {
    const state = userState[chatId];
    const currentQuestion = state.tests[state.currentIndex];
    const isCorrect = text.toLowerCase() === currentQuestion.correct_answer.toLowerCase();

    if (isCorrect) {
      state.correct++;
      await bot.sendMessage(chatId, "✅ Верно!");
    } else {
      await bot.sendMessage(
        chatId,
        `❌ Неверно. Правильный ответ: ${currentQuestion.correct_answer}`
      );
    }

    state.total++;
    await updateProgress(state.progressId, state.correct, state.total);
    state.currentIndex++;

    if (state.currentIndex < state.tests.length) {
      const nextQ = state.tests[state.currentIndex];
      bot.sendMessage(chatId, `Вопрос ${state.currentIndex + 1}:\n${nextQ.question}`);
    } else {
      await finishProgress(state.progressId);
      bot.sendMessage(
        chatId,
        `🏁 Тест завершён!\nПравильных ответов: ${state.correct} из ${state.total} (${Math.round(
          (state.correct / state.total) * 100
        )}%)`
      );
      delete userState[chatId];
    }
    return;
  }

  // ===========================
  // 🧠 РЕЖИМ АДМИНИСТРАТОРА
  // ===========================

  if (text === "/admin" && chatId.toString() === ADMIN_ID) {
    adminState[chatId] = { step: "choose_topic" };
    bot.sendMessage(chatId, "Введите название темы (если нет — создастся новая):");
    return;
  }

  // ➕ Создание темы
  if (adminState[chatId]?.step === "choose_topic") {
    const topicId = await createOrGetTopic(text);
    adminState[chatId] = { step: "enter_question", topicId };
    bot.sendMessage(chatId, "Введите текст вопроса:");
    return;
  }

  // ➕ Ввод вопроса
  if (adminState[chatId]?.step === "enter_question") {
    adminState[chatId].question = text;
    adminState[chatId].step = "enter_answer";
    bot.sendMessage(chatId, "Введите правильный ответ:");
    return;
  }

  // ➕ Ввод правильного ответа
  if (adminState[chatId]?.step === "enter_answer") {
    const { topicId, question } = adminState[chatId];
    await addTest(topicId, question, text);

    adminState[chatId].step = "next_action";
    bot.sendMessage(chatId, "✅ Вопрос добавлен! Хотите добавить ещё один?", {
      reply_markup: {
        keyboard: [["Да", "Нет"]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return;
  }

  // ➕ Следующий вопрос
  if (adminState[chatId]?.step === "next_action" && text === "Да") {
    adminState[chatId].step = "enter_question";
    bot.sendMessage(chatId, "Введите следующий вопрос:");
    return;
  }

  // 🏁 Завершение добавления теста
  if (adminState[chatId]?.step === "next_action" && text === "Нет") {
    delete adminState[chatId];
    bot.sendMessage(chatId, "👌 Добавление тестов завершено.", {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }
});

// ===========================
// 🎯 ОБРАБОТЧИК INLINE-КНОПОК (callback_query)
// ===========================
bot.on("callback_query", async (ctx) => {
  const chatId = ctx.message.chat.id;
  const data = ctx.data;

  if (data.startsWith("topic_")) {
    const topicId = parseInt(data.split("_")[1]);
    const tests = await getTestsByTopic(topicId);

    if (!tests.length) {
      bot.sendMessage(chatId, "⚠️ Для этой темы пока нет вопросов.");
      return;
    }

    const user = await addUser({
      telegramId: chatId,
      telegramUsername: ctx.from.username,
    });

    const progress = await getOrCreateProgress(user.user.id, topicId);

    userState[chatId] = {
      topicId,
      tests,
      currentIndex: 0,
      correct: 0,
      total: 0,
      progressId: progress.id,
      waitingAnswer: true,
    };

    bot.sendMessage(chatId, `🧩 Тест по теме начат!\n\nВопрос 1:\n${tests[0].question}`);
  }
});
