const axios = require('axios');
// const { Robo } = require("./robo");
// const robo = new Robo()

class Email {
  /**
   * Envia email, o corpo do e-mail, fica sem configuração. sendo um texto simples
   * @param {string} destinatario Destinatarios do e-mail separados por virgula, ex.:  "joao, maria, jose"
   * @param {string} titulo Titulo do email ex.: "O servidor está off"
   * @param {string} conteudo Texto ex.: A fila está parada.
   */
  static async send(destinatario, titulo, conteudo) {
    const headers = { "content-type": "text/xml" };
    const corpo =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:EnviarEmail>
            <tem:Remetente>noreply.bigdata@impacta.adv.br</tem:Remetente>
             <tem:Destinatario>${destinatario}</tem:Destinatario>
            <tem:Titulo>${titulo}</tem:Titulo>
            <tem:Mensagem>${conteudo}</tem:Mensagem>
          <tem:Anexos></tem:Anexos>
        </tem:EnviarEmail>
      </soapenv:Body>
    </soapenv:Envelope>`;
    // console.log(corpo);
    // process.exit()

    try {
      const email = await axios({
        url: `http://destaque.adv.br/webserviceemail/service1.asmx`,
        method: "POST",
        // charset="utf-8",
        // encoding: "false",
        // usaProxy: false,
        // usaJson: true,
        data: corpo,
        headers: headers,
      });
      if (/200/.test(email.status)) {
        console.table({
          Envio: true,
          Titulo: titulo,
          Destinatarios: destinatario.toString(),
          Conteudo: conteudo
        })
      }
      // console.log(email);
    } catch (e) {
      console.log(e);
      console.log("Não Foi Possivél enviar o e-mail");
    }
    
  }
}
module.exports.Email = Email;
