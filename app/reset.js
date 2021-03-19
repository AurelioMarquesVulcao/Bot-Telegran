const shell = require('shelljs');
const sleep = require('await-sleep');

(async () => {
  await sleep(3600000);
  shell.exec(`pm2 restart all`);
})();