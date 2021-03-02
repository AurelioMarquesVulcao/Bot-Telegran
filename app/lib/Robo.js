const axios = require('axios');

class Robo{
  /**
   * Executa uma requisição axios
   * @param {*} param0 
   */
  static async request({data, method, url, headers}){
    let resultado;
    await axios({
      url,
      method,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers,
      data
    })
      .then((res) => {
        resultado = res.data
        // {
        //   status: res.status,
        //   resposta: res.data,
        // };
      })
      .catch((err) => {
        // console.log(err);
      });

      return resultado
  }
}

module.exports.Robo = Robo;