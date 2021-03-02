const {Listening} = require('./services/messages');

(async()=>{
  // new Listening().variaveisUpdate();
  new Listening().listen();

})()