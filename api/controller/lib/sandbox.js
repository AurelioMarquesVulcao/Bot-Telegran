var axios = require('axios');
const qs = require('qs');
let data = qs.stringify({
 'payload': '{"channel": "#alertas-big-data", "username": "webhookbot", "text": "Teste com Postman.", "icon_emoji": ":slack:"}' 
});
var config = {
  method: 'post',
  url: 'https://hooks.slack.com/services/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',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});