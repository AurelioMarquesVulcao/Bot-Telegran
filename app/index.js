const shell = require('shelljs');
const sleep = require('await-sleep');

const { Listening } = require('./services/messages');

(async () => {
  try {
    await sleep(5000)
    new Listening().listen();
    // new Listening().lastMessage();
  } catch (e) {
    console.log(e);
    // shell.exec(`pm2 restart all`);
    // process.exit();
  }
})();
