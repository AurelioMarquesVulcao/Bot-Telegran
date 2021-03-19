const sleep = require('await-sleep');
const shell = require('shelljs');
const awaitSleep = require('await-sleep');

const { ImpactaBot } = require('../../lib/server');
const { Post } = require('../post');
const { Telegram } = require('../post');
const { Robo } = require('../../lib/Robo');

class Listening {
  constructor() {
    this.messageHelp = '';
    this.erro = 0;
    this.timeUpdate;
    this.bot = new ImpactaBot();
    this.messages = [];
    this.user = [];
    this.update_id;
    this.mensagemRespondida = [];
    this.variaveisUpdate().then((x) => console.log('Capturei as variáveis'));
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
    // this.lastMessage();
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
    while (true) {
      let messages = await this.bot.getMessages(this.update_id);
      let filterMessages = await this.filterMessages(messages);
      let mf = this.filterUser(filterMessages);
      await this.postComands(mf);
      let ids = messages.map((x) => x.update_id);
      await this.atualizaUltimaMensagem(Math.max(...ids));
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
          let text = x.message.text.toLowerCase().trim().split('->')[0];
          let idTrue = await this.findMessage(x.update_id);
          // let user = x.message.from.first_name;
          let user = 'ImpactaBot';
          let chatId = x.message.chat.id;
          let filtro = this.messages.filter(
            (x) => x.text.toLowerCase().trim() == text
          );
          // console.log("Olhar aqui para var o que vem",this.messages);
          // console.log("Olhar aqui para var o que vem2", text );
          // console.log("Olhar aqui para var o que vem3", filtro );

          let rotaResponse;
          // Testa se a mensagem já foi respondida
          if (!idTrue) {
            // envia mensagem de ajuda ao usuario
            if (text == 'help' || text == '/help') {
              await Telegram.post(this.messageHelp, chatId);
              // Salva a mensagem como enviada
              await this.saveMessages(x, `${user}: ${this.messageHelp}`);
            }
            // se eu ja tiver a mensagem cadastrada
            if (filtro.length != 0) {
              // se a mensagem possuir rota, requesito essa rota
              if (filtro[0].rota) {
                if (/->/.test(x.message.text.toLowerCase().trim())) {
                  let t1 = x.message.text.toLowerCase().trim();
                  // console.log(t1.split('->'));
                  let comando = t1.split('->')[1];
                  let dataObj = {
                    [comando.split(':')[0]]: comando.split(':')[1],
                  };
                  // console.log(dataObj);
                  filtro[0].data = dataObj;
                }
                // console.log(filtro[0]);
                rotaResponse = await Robo.request({
                  url: filtro[0].rota,
                  method: filtro[0].method,
                  data: filtro[0].data,
                  headers: filtro[0].headers,
                });
                // envia a mensagem para o Telegram
                await this.postarTelegram(
                  user,
                  filtro[0],
                  chatId,
                  rotaResponse
                );
                // Salva a mensagem como enviada
                await this.saveMessages(
                  x,
                  `${user}: ${JSON.stringify(rotaResponse)}`
                );
              } else {
                // se a mensagem não possuir Rota
                // envia a mensagem para o Telegram
                await this.postarTelegram(user, filtro[0], chatId);

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
    return messages.filter((x) => {
      try {
        return !!x.message.text;
      } catch (e) {
        console.log(e);
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
   * Código morto
   */
  async lastMessage() {
    while (true) {
      try {
        let find = await Robo.request({
          url: `http://localhost:3999/mensagensRespondidas?id_gte=${this.update_id}`,
          method: 'GET',
        });
        let ids = find.map((x) => x.id);
        // this.objId.variaveis = [Math.max(...ids)];
        console.log('Sucesso ao carregar ultima mensagem');
        if (!!find) {
          this.objId.variaveis = [Math.max(...ids)];

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

  async postarTelegram(user, filtro, chatId, rotaResponse = null) {
    // const Post = Telegram.post()
    if (rotaResponse == null) {
      console.log(typeof filtro.response);
      await Telegram.post(`${user}:\n${filtro.response}`, chatId);
    } else if (rotaResponse != null && !!filtro.response) {
      console.log(typeof rotaResponse);
      // se a resposta for string não precisa de tratamento.
      let tipo = typeof rotaResponse;
      if (tipo == 'string') {
        await Telegram.post(
          `${user}:\n${filtro.response}\n${rotaResponse}`,
          chatId
        );
      } else {
        await Telegram.post(
          `${user}:\n${filtro.response}\n${JSON.stringify(rotaResponse)}`,
          chatId
        );
      }
    } else {
      console.log(typeof rotaResponse);
      let tipo = typeof rotaResponse;
      // se a resposta for string não precisa de tratamento.
      if (tipo == 'string') {
        await Telegram.post(`${user}:\n${rotaResponse}`, chatId);
      } else {
        await Telegram.post(
          `${user}:\n${JSON.stringify(rotaResponse)}`,
          chatId
        );
      }
    }
    process.exit();
  }

  async atualizaUltimaMensagem(numero) {
    try {
      if (Number.isInteger(numero)) {
        this.objId.variaveis = numero;
        await Robo.request({
          url: `http://172.16.16.38:3338/variaveisAmbiente/m`,
          method: 'post',
          data: {
            options: 'updateOne',
            data: this.objId,
            _id: this.objId._id,
          },
        });
      } else {
        console.log('Sem mensagens novas');
      }
    } catch (e) {
      console.log(e);
      process.exit();
    }
  }
}

module.exports.Listening = Listening;
