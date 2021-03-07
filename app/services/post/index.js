const axios = require("axios");
const { enums } = require("../../config/enums");
const { Robo } = require('../../lib/Robo');
const { Listening } = require("../messages");


/**
 * Requisição para o controlador de serviços.
 * @param {string} rota rota a ser seguida
 * @param {object} data dados complementares do post
 */
async function Post(rota, data, method = "POST") {
  return Robo.request({
    url: `${enums.Api.baseUrl}/${rota}`,
    data,
    method
  })
  // return await axios({
  //   url: `${enums.Api.baseUrl}/${rota}`,
  //   data,
  //   method,
  // })
  //   .then((x) => x.data)
  //   .catch((x) => {
  //     throw "Requisição falhou";
  //   });
}

module.exports.Post = Post;


class Telegram {
  /**
   * Envia mensagem ao Grupo
   * @param {string} mensagem Texto que se deseja enviar ao chatbot
   */
  static async post(mensagem, chat = "-487339495") {
    let token = "1616703540:AAGpZKaeiSudHKimeVnT-ShQFk1B0wSHPrU";
    let id = chat;
    let data = {
      chat_id: id,
      text: mensagem,
    };
    let teste = await axios({
      method: "POST",
      token: token,
      url: `https://api.telegram.org/bot${token}/sendMessage`,
      data: data,
    }).catch((x) => console.log(x));
    console.log(teste.data);
    return teste.data
  }

  static async getGroup() {
    let token = "1616703540:AAGpZKaeiSudHKimeVnT-ShQFk1B0wSHPrU";
    // let data = {
    //   chat_id: id,
    //   // text: mensagem,
    // };
    let test = await axios({
      method: "GET",
      token: token,
      url: `https://api.telegram.org/bot${token}/getUpdates`,
      // data: data,
    }).catch((x) => console.log(x));
    let n = test.data.result.length - 1
    console.log(test.data.result[n]);
    return test.data.result[n]
  }


}
module.exports.Telegram = Telegram;

