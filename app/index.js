const shell = require('shelljs');

const { Listening } = require('./services/messages');

(async () => {
  try {
    new Listening().listen();
  } catch (e) {
    console.log(e);
    shell.exec(`pm2 restart all`);
    // process.exit();
  }
})();
