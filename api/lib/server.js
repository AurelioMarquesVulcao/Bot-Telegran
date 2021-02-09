const axios = require("axios");
const { enums } = require("../config/enums");

class ImpactaBot {
  constructor() {
    
    this.key = enums.Telegram.key;
    this.baseUrl = enums.Telegram.baseUrl;
  }
  async getMessages() {
    const url = `${this.baseUrl}/bot${this.key}/getUpdates`;
    let getMessages = await axios({
      url: url,
      method: "GET",
    });
    // console.log(getMessages.data.result);
    return getMessages.data.result;
  }

  async postMessages() {}

  async postComands() {}
}

module.exports.ImpactaBot = ImpactaBot;

