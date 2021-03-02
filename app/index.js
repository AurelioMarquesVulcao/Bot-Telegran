const { Listening } = require('./services/messages');

(async () => {
  new Listening().listen();
})();
