const diskstats = require("diskstats");
const os = require("os");
const os1 = require("os-utils");

const { SlackHandler } = require("./slack");
const { Telegram } = require("./telegram");
const { Util } = require("./util");
var dados = {};

class CPU {
  static async cpuStatus(rec, res) {
    try {
      // let use = await new CPU().cpuUse()
      let memoriaFree = dados.memoriaFree;
      // const dados = {
      //   use: use,
      //   free: await new CPU().cpuFree(),
      //   memoriaFree: (os.freemem() / 1000000000).toFixed(2),
      //   memoriaTotal: (Math.trunc(os.totalmem() / 1000000000))
      // }
      console.log("Obtive os dados de CPU");
      return res.json(dados);
    } catch (e) {
      console.log(e);
      return res.json(e);
    }
  }

  async cpuUse() {
    return new Promise((resp) => {
      os1.cpuUsage(async (v) => resp(Math.trunc(v * 100)));
    });
  }
  async cpuFree() {
    return new Promise((resp) => {
      os1.cpuFree(async (v) => resp(Math.trunc(v * 100)));
    });
  }
  async freeHd() {
    let results = await diskstats.check(".");
    // console.log(results);
    // console.log((results.used / results.total)*100);
    return Math.round(results.free / 1000000);
  }
  async centHd() {
    let results = await diskstats.check(".");
    // console.log(results);
    // console.log((results.used / results.total)*100);
    return Math.round((results.used / results.total) * 100);
  }
}

module.exports.CPU = CPU;

(async () => {
  // await new CPU().hd()
  setInterval(async function () {
    dados = {
      use: await new CPU().cpuUse(),
      free: await new CPU().cpuFree(),
      memoriaFree: (os.freemem() / 1000000000).toFixed(2),
      memoriaTotal: Math.trunc(os.totalmem() / 1000000000),
      hdFree: await new CPU().freeHd(),
      hdPercent: await new CPU().centHd(),
    };
    // console.log(dados);
  }, 2000);
  setInterval(async function () {
    if (dados.memoriaFree < 15) {
      await new SlackHandler().post(
        `<@UREQDQ57T>
        <@U014LNLSMEE>
        <@UFYHXG5UM>
        A Restam ${memoriaFree}Gb de RAM no servidor 38 do Big Data. 
        `
      );
      await Telegram.post(`A Restam ${memoriaFree}Gb de RAM no servidor 38 do Big Data. `);
    }
    if (dados.hdPercent > 90) {
      await new SlackHandler().post(
        `<@UREQDQ57T>
        <@U014LNLSMEE>
        <@UFYHXG5UM>
        Estão sendo utilizados ${dados.hdPercent}% do espaço do Hd do servidor 38 do Big Data.
        `
      );
      await Telegram.post(`Estão sendo utilizados ${dados.hdPercent}% do espaço do Hd do servidor 38 do Big Data.`);
    }
  }, 300000);

  // setInterval(async function () {
  //   try {
  //     if (dados.memoriaFree < 12) {
  //       await Util.limpaMemoria();
  //     }
  //   } catch (e) {}
  // }, 6000);
})();
