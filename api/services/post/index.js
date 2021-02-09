const axios = require("axios");
const { enums } = require("../../config/enums");

/**
 * Requisição para o controlador de serviços.
 * @param {string} rota rota a ser seguida
 * @param {object} data dados complementares do post
 */
async function Post(rota, data, method = "POST") {
  return await axios({
    url: `${enums.Api.baseUrl}/${rota}`,
    data,
    method,
  })
    .then((x) => x.data)
    .catch((x) => {
      throw "Requisição falhou";
    });
}

module.exports.Post = Post;
