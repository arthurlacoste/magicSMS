var idLog = require('id.log');

module.exports = function(io, app, moment, sms) {
  // Quand un client se connecte, on le note dans la console
  io.sockets.on('connection', function (socket) {

    var id = new idLog(socket.id );

    id.log("new client");

    // Accès login
    socket.on("login", function(data) {
      id = new idLog(socket.id + ' ' + data.username);

      id.log("login");

      var gateway = require('sms-gateway-nodejs')(data.username,data.password);

      gateway.device.listOfDevices(1).then((response) => {

        socket.handshake.session.user =  data;
        socket.handshake.session.save();

        app.render('ecrire.ejs', {
          moment: moment,
          messages: {},
          success: 'none'},
          function(err, str){
            id.log('Envoi de la liste des messages au client via sockets...');
            io.emit('new_page', str);
          }
        );

      }).catch((error) => {
        id.log(error);
        socket.emit("bad_login");
      })
    });

    // Deconnexion
    socket.on("ask_logout", function(){
      delete socket.handshake.session.user ;
      socket.handshake.session.save();
      id.log("Logout")
      socket.emit("logout");
    });

    // liste des messages
    socket.on("give_me_list_messages", function(){
      if(typeof socket.handshake.session.user == 'undefined') {
        id.log("Log out, user session undefined.");
        socket.emit("logout" + socket.id);
      } else{

        id.log('start');
        sms.getMessages(app, socket, moment);
      }
    });

    // reception d'un message
    socket.on("sms_sended", function (data) {
      id.log("New SMS sended by client");
      id.log(data);

      if(typeof socket.handshake.session.user == 'undefined') {
        id.log("Log out, user session undefined.");
        socket.emit("logout");
      } else{
        sms.postMessage(app, socket, moment, data);
      }
    });

    // receive current tab hashCode()
    socket.on("current_tab", function(tab){
      socket.handshake.session.currentTab = tab;
      socket.handshake.session.save();
    });
  });

};
