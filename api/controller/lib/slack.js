const axios = require("axios");
const qs = require("qs");
const sleep = require("await-sleep");

class SlackHandler {
  constructor() {
    this.colors = {
      success: "#28a745",
      danger: "#dc3545",
      info: "#0275d8",
      warning: "#ffc107",
    };
    this.channel = "#sandbox";
    this.icon_emoji = ":slack:";
    this.username = "ImpactaBot!";
    this.url = "https://hooks.slack.com/services/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";
  }

  /**
   * Envia Resumo do estado da fila
   * @param {Object} fila Estados da fila
   * @param {*} message Mesagem resumo do Ocorrido
   * @param {*} channel Canal a ser enviado a mensagem.
   */
  async filas(fila, message = "Testando Post", channel = this.channel) {
    const options = {
      channel: channel,
      username: this.username,
      text: message,
      attachments: [
        {
          color: this.colors.success,
          fields: [
            {
              title: "Robo",
              value: fila.robo,
              short: true,
            },
            {
              title: "Fila",
              value: fila.nome,
              short: false,
            },
            {
              title: "Estado",
              value: fila.estado,
              short: true,
            },
            {
              title: "Consumo",
              value: fila.estadoConsumo,
              short: true,
            },
          ],
        },
      ],
    };
    return await axios.post(this.url, options);
  }

  async post(message = "Testando Post", channel = this.channel) {
    // let date = new Date();
    const options = {
      channel: channel,
      username: this.username,
      text: message,
      // attachments: [
      //   {
      //     color: this.colors.success,
      //     fields: [
      //       {
      //         title: "Data:",
      //         value: `${date.getFullYear()} / ${
      //           date.getMonth() + 1
      //         } / ${date.getDate()} - ${date.getHours()}:${date.getMinutes()}`,
      //         short: true,
      //       },
      //       //       {
      //       //         title: "Fila",
      //       //         value: fila.nome,
      //       //         short: false,
      //       //       },
      //       //       {
      //       //         title: "Estado",
      //       //         value: fila.estado,
      //       //         short: true,
      //       //       },
      //       //       {
      //       //         title: "Consumo",
      //       //         value: fila.estadoConsumo,
      //       //         short: true,
      //       //       },
      //     ],
      //   },
      // ],
    };
    return await axios.post(this.url, options);
  }
}

module.exports.SlackHandler = SlackHandler;
