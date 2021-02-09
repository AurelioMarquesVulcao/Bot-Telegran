const sleep = require("await-sleep");
const { ImpactaBot } = require("../../lib/server");
const { Post } = require("../post");

class Listening {
  constructor() {
    this.timeUpdate = 5000;
    this.bot = new ImpactaBot();
    this.user = [
      { username: "Aurelio_Vulcao", id: "610732305" },
      // { username: "BB", id: "0000" },
    ];
    this.update_id = 260186708;
  }
  async listen() {
    while (true) {
      let messages = await this.bot.getMessages();

      console.log(new Date());
      let mf = this.filterUser(messages);
      // console.log(mf[0].Aurelio_Vulcao);
      await this.postComands(mf);

      // console.log(await Post("cpu"));
      // process.exit();
      await sleep(this.timeUpdate);
    }
  }
  filterUser(messages) {
    let userMessages = [];
    for (let i = 0; i < this.user.length; i++) {
      userMessages.push({
        [this.user[i].username]: messages.filter(
          (
            x //{
          ) => new RegExp(this.user[i].id, "i").test(x.message.from.id)
          // let test = new RegExp(this.user[i].id, "i").test(x.message.from.id);
          // let { update_id, message } = x;
          // let { text, from } = message;
          // let { id } = from;
          // if (!test) {
          //   // console.log({update_id, text});
          //   return x
          //   // return

          // }
          // }
        ),
      });
    }
    return userMessages;
  }
  async postComands(messages) {
    // console.log(messages);
    for (let i = 0; i < messages.length; i++) {
      let user = this.user[i].username;
      // console.log(user);
      // console.log(messages[i][user]);
      for (let ii = 0; ii < messages[i][user].length; ii++) {
        let allMessages = messages[i][user][ii];
        if (allMessages.update_id > this.update_id) {
          // aqui faço os comandos por mensagem

          let comandos = allMessages.message.text.toLowerCase();
          console.log(comandos);
          let postComando;
          try {
            let get = await Post(`${comandos}`, "", "GET")
            postComando = JSON.stringify(get, null, "\t");
            // postComando = await Post(`${comandos}`, "", "GET")
          } catch (e) {
            postComando = "Comando Inválido \n Tente novamente";
          }
          console.log(postComando);

          await Post("telegram", {
            mensagem: `${postComando}`,
            chat: `${allMessages.message.from.id}`,
          });
          this.update_id = allMessages.update_id;
          // await Post(comandos)
        }
        // console.log(
        //   allMessages
        //   );
      }
    }
  }
}

module.exports.Listening = Listening;
