import express from "express";
import { addUser } from "./connectToDB.js";
import cors from "cors";

const app = express();

// Настройка
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // если обращаешься с фронта на другом порту

// Тестовые
app.get("/", (_, res) => res.send("<h2>Привет Express!</h2>"));
app.get("/test", (_, res) => res.json({ message: "Привет" }));
app.post("/test", (req, res) => res.json(req.body));


app.post("/register", async (req, res) => {
  const { telegramId, telegramUsername } = req.body;

  if (!telegramId || !telegramUsername) {
    return res
      .status(400)
      .json({ success: false, message: "Все поля обязательны" });
  }

  const result = await addUser({ telegramId, telegramUsername });
  res.json(result);
});


export const startBackend = async () => {
  app.listen(3000, () =>
    console.log("Backend запущен на http://localhost:3000/")
  );
};
