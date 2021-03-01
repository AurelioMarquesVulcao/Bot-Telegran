const sleep = require("await-sleep");
const { ImpactaBot } = require("../../lib/server");
const { Post } = require("../post");
const { Robo } = require("../../lib/Robo");

class Listening {
  constructor() {
    this.timeUpdate;
    this.bot = new ImpactaBot();
    this.user = [
      // { username: "Aurelio_Vulcao", id: "610732305" },
      // { username: "BB", id: "0000" },
    ];
    this.update_id;
    this.variaveisUpdate().then((x) => console.log("capturei"));
  }
  async getVariaveis() {
    let x = await Robo.request({
      url: "http://172.16.16.38:3338/variaveisAmbiente",
      data: { aplicacao: "ImpactaBot" },
    });
    this.update_id = x.filter((x) => /idMensagem/i.test(x.origem))[0].variaveis[0];
    this.user = x.filter((x) => /UserImpactaBot/i.test(x.origem))[0].variaveis;
    this.timeUpdate = x.filter((x) => /timeUpdate/i.test(x.origem))[0].variaveis[0];
    this.messages = x
      .filter((x) => /comandosTelegram/i.test(x.origem))
      .map((x) => {
        // console.log(x.variaveis);
        for (let i = 0; i < x.variaveis.length; i++) {
          // console.log(x.variaveis[i]);
          return x.variaveis[i];
        }
      });
    // console.log(this.timeUpdate);
    // console.log(this.update_id);
    // console.log(this.messages);
    // console.log(this.user);
    this.timeUpdate = 605000;
  }
  async variaveisUpdate() {
    while (true) {
      await this.getVariaveis();
      await sleep(this.timeUpdate);
    }
  }
  /**
   * Escuta a Api do Telegram e valida o usuario. chamando a resposta em seguida
   */
  async listen() {
    // this.getVariaveis()
    while (true) {
      let messages = await this.bot.getMessages();
      let mf = this.filterUser(messages);
      await this.postComands(mf);
      // console.log(new Date());
      await sleep(this.timeUpdate);
    }
  }
  /**
   * Gera uma resposta para cada mensagem enviada
   * @param {Object} messages mensagem do Telegram
   */
  async postComands(messages) {
    // console.log(messages);
    messages.map(async (x) => {
      if (x.update_id > this.update_id) {
        let text = x.message.text;
        let user = x.message.from.username;
        let chatId = x.message.chat.id;
        let filtro = this.messages.filter((x) => x.text == text);
        // se eu ja tiver a mensagem cadastrada
        if (filtro.length != 0) {
          // se a mensagem possuir rota
          if (filtro[0].rota) {
            let rotaResponse = await Robo.request({ url: filtro[0].rota, method: filtro[0].method });
            // console.log(x.message);
            // console.log(rotaResponse);
            await Post("telegram", {
              mensagem: `${user}: ${JSON.stringify(rotaResponse)}`,
              chat: chatId,
            });
          } else {
            // se a mensagem não possuir Rota
            await Post("telegram", {
              mensagem: `${user}: ${filtro[0].response}`,
              chat: chatId,
            });
          }
          console.log(filtro[0].response);
        } else {
          // se eu não tiver a mensagem cadastrada
          console.log(text);
        }
      }
    });
    // process.exit()
    // for (let i = 0; i < messages.length; i++) {
    //   let user = this.user[i].username;
    //   for (let ii = 0; ii < messages[i][user].length; ii++) {
    //     let allMessages = messages[i][user][ii];
    //     // serve para pegar a ultima mensagem
    //     if (allMessages.update_id > this.update_id) {
    //       // aqui faço os comandos por mensagem
    //       let comandos = allMessages.message.text.toLowerCase();
    //       console.log(comandos);
    //       let postComando;
    //       try {
    //         let get = await Post(`${comandos}`, "", "GET");
    //         postComando = JSON.stringify(get, null, "\t");
    //         // postComando = await Post(`${comandos}`, "", "GET")
    //       } catch (e) {
    //         postComando = "Comando Inválido \n Tente novamente";
    //       }
    //       console.log(postComando);
    //       await Post("telegram", {
    //         mensagem: `${postComando}`,
    //         chat: `${allMessages.message.from.id}`,
    //       });
    //       this.update_id = allMessages.update_id;
    //       // await Post(comandos)
    // }
    // console.log(
    //   allMessages
    //   );
    // }
    // }
  }
  /**
   * Valida as mensagens pelo id do usuario
   * @param {Object} messages mensagem do Telegram
   */
  filterUser(messages) {
    // messages = [messages[messages.length-1]]
    // let lastMessage = Messages[Messages.length - 1];
    // return this.user.filter((x) => new RegExp(x.id).test(lastMessage.message.from.id));
    let userMessages = [];
    for (let i = 0; i < this.user.length; i++) {
      // console.log(this.user[i]);
      let validado = messages.filter((x) => new RegExp(this.user[i].id, "i").test(x.message.from.id));
      for (let ii = 0; ii < validado.length; ii++) {
        userMessages.push(validado[ii]);
      }

      // userMessages.push({
      //   [this.user[i].first_name]: messages.filter((x) => new RegExp(this.user[i].id, "i").test(x.message.from.id)),
      // });
    }
    return userMessages.sort((a, b) => a.update_id - b.update_id);
  }
}

module.exports.Listening = Listening;
