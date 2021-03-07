const shell = require('shelljs');
const sleep = require('await-sleep');

const { Listening } = require('./services/messages');

(async () => {
  try {
    await sleep(1000)
    new Listening().listen();
  } catch (e) {
    console.log(e);
    // shell.exec(`pm2 restart all`);
    process.exit();
  }
})();
