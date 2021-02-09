require('dotenv/config');
// const mongose = require('mongose');

module.exports.enums = Object.freeze({
  Telegram: {
    baseUrl: process.env.TELEGRAM_URL,
    key: process.env.TELEGRAM_KEY
  },
  Api:{
    baseUrl:process.env.API_URL
  }
  
});
