const { Listening } = require('./services/messages');
const shell = require('shelljs');
const sleep = require('await-sleep');

(async () => {
  shell.exec(`json-server --watch db.json --port 3999`);
  await sleep(3000);
})();
