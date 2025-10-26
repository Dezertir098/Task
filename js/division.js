import { getMe } from "./getMe.js";

const infoMe = document.querySelector('.me_info');

const { user } = await getMe();

console.log(user);

if (user) {
  infoMe.textContent = `${user.telegramId} ${user.telegramUsername}`;
} else {
  infoMe.textContent = `Прозошла ошибка`;
}
