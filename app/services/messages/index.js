const sleep = require('await-sleep');
const shell = require('shelljs');

const { ImpactaBot } = require('../../lib/server');
const { Post } = require('../post');
const { Robo } = require('../../lib/Robo');
const awaitSleep = require('await-sleep');

class Listening {
  constructor() {
    this.messageHelp="";
    this.erro = 0;
    this.timeUpdate;
    this.bot = new ImpactaBot();
    this.messages = [];
    this.user = [];
    this.update_id;
    this.mensagemRespondida = [];
    this.variaveisUpdate().then((x) => console.log('capturei'));
  }
  async getVariaveis() {
    let x = await Robo.request({
      url: 'http://172.16.16.38:3338/variaveisAmbiente',
      data: { aplicacao: 'ImpactaBot' },
      method: 'GET',
    });
    this.objId = x.filter((x) => /idMensagem/i.test(x.origem))[0];
    this.update_id = x.filter((x) =>
      /idMensagem/i.test(x.origem)
    )[0].variaveis[0];
    this.user = x.filter((x) => /UserImpactaBot/i.test(x.origem))[0].variaveis;
    this.timeUpdate = x.filter((x) =>
      /timeUpdate/i.test(x.origem)
    )[0].variaveis[0];
    this.messages1 = x.filter((x) => /comandosTelegram/i.test(x.origem));
    
    this.messages = [];
    for (let i = 0; i < this.messages1.length; i++) {
      if (this.messages1[i].variaveis.length == 1) {
        this.messages.push(this.messages1[i].variaveis[0]);
      }
      if (this.messages1[i].variaveis.length > 1) {
        for (let ii = 0; ii < this.messages1[i].variaveis.length; ii++) {
          this.messages.push(this.messages1[i].variaveis[ii]);
        }
      }
    }
    this.messageHelp = this.messages
      .filter((x) => !!x.help)
      .map((x) => x.help)
      .join('\n');
  }

  /**
   * Atualiza periodicamente todas as variavéis da aplicação.
   */
  async variaveisUpdate() {
    await this.getVariaveis();
    this.lastMessage();
    await sleep(this.timeUpdate * 3);
    while (true) {
      await this.getVariaveis();
      await sleep(this.timeUpdate * 3);
    }
  }
  /**
   * Escuta a Api do Telegram e valida o usuario. chamando a resposta em seguida
   */
  async listen() {
    await sleep(3000);
    while (true) {
      let messages = await this.bot.getMessages(this.update_id);
      // process.exit()
      let filterMessages = await this.filterMessages(messages);
      let mf = this.filterUser(filterMessages);
      await this.postComands(mf);
      console.log(new Date());
      await sleep(this.timeUpdate);
    }
  }
  /**
   * Gera uma resposta para cada mensagem enviada
   * @param {Object} messages mensagem do Telegram
   */
  async postComands(messages) {
    try {
      messages.map(async (x) => {
        if (x.update_id > this.update_id) {
          let text = x.message.text.toLowerCase().trim();
          let idTrue = await this.findMessage(x.update_id);
          // let user = x.message.from.first_name;
          let user = 'ImpactaBot';
          let chatId = x.message.chat.id;
          let filtro = this.messages.filter(
            (x) => x.text.toLowerCase().trim() == text
          );
          let rotaResponse;
          // Testa se a mensagem já foi respondida
          if (!idTrue) {
            // envia mensagem de ajuda ao usuario
            if (text == 'help' || text == '/help') {
              console.log(this.messages);
              console.log(this.messageHelp);
              await Post('telegram', {
                mensagem: this.messageHelp,
                chat: chatId,
              });
              // Salva a mensagem como enviada
              await this.saveMessages(x, `${user}: ${this.messageHelp}`);
            }
            // se eu ja tiver a mensagem cadastrada
            if (filtro.length != 0) {
              // se a mensagem possuir rota, requesito essa rota
              if (filtro[0].rota) {
                rotaResponse = await Robo.request({
                  url: filtro[0].rota,
                  method: filtro[0].method,
                  data: filtro[0].data,
                  headers: filtro[0].headers,
                });
                // envia a mensagem para o Telegram
                await Post('telegram', {
                  mensagem: `${user}:\n${filtro[0].response}\n${JSON.stringify(
                    rotaResponse
                  )}`,
                  chat: chatId,
                });
                // Salva a mensagem como enviada
                await this.saveMessages(
                  x,
                  `${user}: ${JSON.stringify(rotaResponse)}`
                );
              } else {
                // se a mensagem não possuir Rota
                // envia a mensagem para o Telegram
                await Post('telegram', {
                  mensagem: `${user}: ${filtro[0].response}`,
                  chat: chatId,
                });
                // Salva a mensagem como enviada
                await this.saveMessages(
                  x,
                  `${user}:\n${JSON.stringify(rotaResponse)}`
                );
              }
            } else {
              // se eu não tiver a mensagem cadastrada
              console.log(text);
            }
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Valida as mensagens pelo id do usuario, e as organiza por ordem numerica
   * @param {Object} messages mensagem do Telegram
   */
  filterUser(messages) {
    let userMessages = [];
    for (let i = 0; i < this.user.length; i++) {
      // console.log(this.user[i]);
      let validado = messages.filter((x) =>
        new RegExp(this.user[i].id, 'i').test(x.message.from.id)
      );
      for (let ii = 0; ii < validado.length; ii++) {
        userMessages.push(validado[ii]);
      }
    }
    return userMessages.sort((a, b) => a.update_id - b.update_id);
  }

  /**
   * remove as mensagens que não possuem texto.
   * @param {Object} messages Mensagens do Telegram
   */
  async filterMessages(messages) {
    // console.log(messages);
    return messages.filter((x) => {
      try {
        return !!x.message.text;
      } catch (e) {
        // Enviar uma mensagem, informando que mensagens editadas não são consideradas
        // return !!x.edited_message.text;
      }
    });
    // return messages.filter((x) => !!x.edited_message.text);
  }

  /**
   * Filtra mensagens de adição em grupos
   * @param {Object} messages Mensagens do Telegram
   */
  filterGroupAdd(messages) {
    return messages.filter((x) => !x.message.text);
  }

  // Deverá ser trocado por rota no mongo db
  async saveMessages(message, resposta) {
    let obj = {
      id: message.update_id,
      message,
      resposta,
      dataEnvio: new Date(),
    };
    await Robo.request({
      url: 'http://localhost:3999/mensagensRespondidas',
      method: 'POST',
      data: obj,
    });
  }

  // Deverá ser trocado por rota no MongoDB
  async findMessage(id) {
    try {
      let find = await Robo.request({
        url: `http://localhost:3999/mensagensRespondidas?id=${id}`,
        method: 'GET',
      });
      if (find.length != 0) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      this.erro++;
      console.log('erro ao obter mensagem respondida pelo id');
      await sleep(5000);
      if (this.erro >= 5) {
        process.exit();
      }
      // shell.exec(`pm2 restart all`);
      // process.exit();
    }
  }
  /**
   * Grava no banco de dados a ultima mensagem respondida, para que não reprocesse ela quando religar o robô
   */
  async lastMessage() {
    while (true) {
      try {
        let find = await Robo.request({
          url: `http://localhost:3999/mensagensRespondidas?id_gte=${this.update_id}`,
          method: 'GET',
        });
        // console.log(this.update_id);
        // console.log(find);
        let ids = find.map((x) => x.id);
        // console.log(typeof Math.max(...ids));
        // console.log(typeof -Infinity);
        console.log('Sucesso ao carregar ultima mensagem');
        if (!!find) {
          this.objId.variaveis = [Math.max(...ids)];
          // console.log(Math.max(...ids));
          // console.log(this.objId);
          // process.exit();
          // console.log(this.objId);
          // console.log(this.objId);
          await Robo.request({
            url: `http://172.16.16.38:3338/variaveisAmbiente/m`,
            method: 'post',
            data: {
              options: 'updateOne',
              data: this.objId,
              _id: this.objId._id,
            },
          });
        }
      } catch (e) {
        this.erro++;
        console.log('Erro ao confirmar as ultimas mensagens');
        if (this.erro >= 5) {
          process.exit();
        }
        await sleep(3000);
        await this.lastMessage();

        // shell.exec(`pm2 restart all`);
      }
      // await sleep(600000)
      await sleep(60000);
    }
  }
}

module.exports.Listening = Listening;
