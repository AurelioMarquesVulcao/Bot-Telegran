const axios = require("axios");
const { enums } = require("../config/enums");
const { Robo } = require("./Robo");

class ImpactaBot {
  constructor() {
    
    this.key = enums.Telegram.key;
    this.baseUrl = enums.Telegram.baseUrl;
  }
  /**
   * Metodo de busca de mensagens na API do Telegram.
   */
  async getMessages(lastId) {
    const url = `${this.baseUrl}/bot${this.key}/getUpdates?timeout=50&offset=${lastId}`;
    let getMessages = await Robo.request({
        url: url,
        method: "GET",
    })
    return getMessages.result;
  }

  async postMessages() {}

  async postComands() {}
}

module.exports.ImpactaBot = ImpactaBot;

