// Init values from .env files
require("dotenv").config();

if (
  !process.env.TELEGRAM_BOT_TOKEN &&
  !process.env.TELEGRAM_USER_ID &&
  !process.env.KLIKBCA_USER &&
  !process.env.KLIKBCA_PASSWORD
) {
  return console.log("Silahkan isi terlebih dahulu .env kamu!!!");
}

const cron = require("node-cron");
const express = require("express");
const KlikBcaSaldoGrabber = require("./KlikBcaSaldoGrabber");
const TelegramBot = require("node-telegram-bot-api");

// Init Telegram Bot
const CekBank_bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

const telegramSendMsg = (idUser, message) => {
  CekBank_bot.sendMessage(idUser, message);
};

const cekSaldoSekarang = async () => {
  telegramSendMsg(
    process.env.TELEGRAM_USER_ID,
    "Cek saldo sedang di proses..."
  );

  // Menunggu hasil return dari proses scrape data saldo
  const saldo = await KlikBcaSaldoGrabber();
  console.log(`Saldo Bank BCA Anda : Rp.${saldo},-`);

  // Mengirim pesan hasil cek saldo
  telegramSendMsg(
    process.env.TELEGRAM_USER_ID,
    `Saldo Bank BCA Anda : Rp. ${saldo} ,-`
  );
};

CekBank_bot.on("message", msg => {
  var message = msg.text.toLowerCase();
  var messageFromId = msg.from.id;

  switch (message) {
    case "cek saldo":
      cekSaldoSekarang();
      break;
    case "id":
      CekBank_bot.sendMessage(messageFromId, `Your id ${msg.from.id}`);
      break;
    default:
      CekBank_bot.sendMessage(messageFromId, "Pesan tidak dikenal");
  }
});

app = express();

/*
 ┌────────────── second (optional)
 │ ┌──────────── minute
 │ │ ┌────────── hour
 │ │ │ ┌──────── day of month
 │ │ │ │ ┌────── month
 │ │ │ │ │ ┌──── day of week
 │ │ │ │ │ │
 │ │ │ │ │ │
 * * * * * *
 
*/

// Cron Job cek saldo setiap 2 jam
cron.schedule("0 0 */2 * * *", async () => {
  console.log(new Date().toLocaleString());
  cekSaldoSekarang();
});

app.listen(3128);
