const sleep = require("await-sleep");
const { ImpactaBot } = require("../../lib/server");

class Listening {
  constructor() {
    this.timeUpdate = 5000;
    this.bot = new ImpactaBot();
    this.user = [
      { username: "Aurelio_Vulcao", id: "610732305" },
      { username: "BB", id: "0000" },
    ];
    this.update_id = 260186706;
  }
  async listen() {
    while (true) {
      let messages = await this.bot.getMessages();
      await sleep(this.timeUpdate);
      console.log(new Date());
      
      this.filterUser(messages);
    }
  }
  filterUser(messages) {
    let userMessages = [];
    for (let i = 0; i < this.user.length; i++) {
      userMessages.push({
        [this.user[i].username]: messages.filter((x) => {
          let test = new RegExp(this.user[i].id, "i").test(x.message.from.id);
          let { update_id, message } = x;
          let { text } = message;
          if (test) {
            // console.log({update_id, text});
            return { update_id, text };
          }
        }),
      });
    }
    return userMessages;
  }
}

module.exports.Listening = Listening;
