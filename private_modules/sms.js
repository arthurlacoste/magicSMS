var idLog = require('id.log');
var underscore = require('underscore');

exports.getMessages = function(app, socket, moment, interval=true, prerender=true, success='none') {
  console.log('start');

  // Start logging
  var id = new idLog(socket.id + ' ' + socket.handshake.session.user.username);

  var messagesListHash = '';

  // hashCode anything
  var hashCode = function(s){
    return JSON.stringify(s)
    .split("")
    .reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  }

  function fieldSorter(fields) {
    return (a, b) => fields.map(o => {
      let dir = 1;
      if (o[0] === '-') { dir = -1; o=o.substring(1); }
      return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
    }).reduce((p,n) => p ? p : n, 0);
  }

  var render = function(before_data) {
    // group messages by name
    var data = underscore.groupBy(before_data, function(obj){ return obj.contact.name; });

    // sorting messages by created_at
    for(var contact in data){
      data[contact] = data[contact].sort(fieldSorter(['created_at']));
    }

    // array for contact list
    var listContacts = {};
    for(var contact in data){

      // search last key of each conversation
      var myContact = data[contact];
      var lastKey;
      for(var key in myContact){
        if(myContact.hasOwnProperty(key)){
          lastKey = key;
        }
      }

      // create new JSON
      listContacts[contact] = data[contact][lastKey];
      listContacts[contact].total_messages = lastKey+1;
    }

    // trying to render the listeMessages view
    try{
      app.render('listeMessages.ejs', {
        session: socket.handshake.session,
        moment: moment,
        listContacts: listContacts,
        messages: data
      }, function(err, str){
        socket.handshake.session.listMessages = before_data;
        socket.handshake.session.save();
        //console.log(str);
        id.log('Envoi des messages au client via sockets...');
        socket.emit('messages', str);

        id.log(' : envoyé');
      });
    } catch (e) {
      id.log(e);
      //next();
    }
  }

  var intervalMessages = function(notif=false) {

    if(socket.connected) {
      id.log("try to list-diff messages");

      var gateway = require('sms-gateway-nodejs')(
        socket.handshake.session.user.username,
        socket.handshake.session.user.password);
        gateway.message.listOfMessages(1)
        .then((raw_data) => {
          //messagesList = raw_data;
          // if old data is different than new data, we show it
          if(hashCode(raw_data) !== messagesListHash) {
            messagesListHash = hashCode(raw_data);
            render(raw_data);
          } else {
            id.log("same");
          }


        })
        .catch((error) => {
          // handle error
          id.log('Erreur lors du chargement des messages : ' + error);
        })
      } else {
        // stocket disconnected ?
        clearInterval(diffMessages);
      }
    };

    // we show the saved data if we have something, before asking to API
    if(prerender==true && typeof socket.handshake.session.listMessages != 'undefined'){
      render(socket.handshake.session.listMessages);
      id.log("Session saved rendering");
    }

    // we ask to the server
    intervalMessages();

    // we define an interval to check new messages (~40 sec)
    if(interval==true) {
      var diffMessages = setInterval(function() {intervalMessages(true)}, 40000);
    }
  }

  exports.postMessage = function(app, socket, moment, sms) {
    var gateway = require('sms-gateway-nodejs')(
      socket.handshake.session.user.username,
      socket.handshake.session.user.password);
      gateway.device.listOfDevices(1).then((response) => {

        // On prend le premier téléphone de la liste
        var deviceID = response.data[0].id;

        // Envoi du message
        gateway.message.sendMessageToNumber(
          deviceID,
          sms.number,
          sms.message.replace(/'/g, "’")
          //Math.floor(Date.now() / 1000) + 3600
        ).then(function(data){
          id.log('POST MESSAGE SUCCESS, STATUS : ');
          id.log(data.status);
          socket.emit('sms_sended_success',data);
          exports.getMessages(app, socket, moment, false, false);
          //callback('success', socket);
          //getMessages(myCallback,'success');
        }).catch(function(message){
          id.log('Fail : ' + message);
          //console.log('failed',message);
          //getMessages(myCallback,'failed');
        });
        // affichage des messages

      })
      .catch((error) => {
        id.log(error)
      })
    }
