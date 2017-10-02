var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var moment = require('moment');
var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sms = require('./private_modules/sms');
var cookieParser = require('cookie-parser');
var session = require("express-session")({
  secret: "AV2KifYIQdEtsoaDSPRogQdpuhw9FLv2EnQiG5lD_SzvkIBGOwAAAAA",
  resave: true,
  saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var port = process.env.PORT || 1337;

console.log(moment().locale('fr').format('L, HH:mm:ss'));

// sessions
app.use(cookieParser());
app.use(session);
app.use(bodyParser.urlencoded({ extended: false }));

// redirect static ressources & favicon
app.use(express.static(__dirname + '/public'))
app.use(favicon(__dirname + '/public/favicon.ico'));

// Redirect jquery, jquery-validation & bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/jquery-validation/dist/'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap-notify/'));
app.use('/css', express.static(__dirname + '/node_modules/animate.css/'));
app.use('/css', express.static(__dirname + '/node_modules/font-awesome/css/'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts/'));


io.use(sharedsession(session, cookieParser(), { autoSave:true }));

app.get('/', function(req, res) {
  res.redirect('/login');
})

.post('/',function(req, res) {
  console.log(req.body);
})

app.get('/login', function(req, res) {
  console.log(req.cookies);


  if (typeof req.session.user == 'undefined') {
    res.render('login.ejs', {message: "none", session: req.session});
  } else {
    res.redirect('/timeline');
  }
})

.get('/logout', function(req, res) {
  if (typeof req.session.user == 'undefined') {
    res.render('login.ejs', {
      message: "Vous avez été déconnecté.",
      session: req.session
    });
  } else {
    res.redirect('/ecrire');
  }
})

.get('/timeline', function(req, res) {
  console.log("GET - write page");

  // if not logged in redirect to /login page
  if (typeof req.session.user !== 'undefined') {
    res.render('timeline.ejs', {
      moment: moment,
      session: req.session,
      messages: {},
      success: 'none'
    });
  } else {
    res.redirect('/login');
  }

})

.get('/new/:number', function(req, res) {
  console.log("GET - new page");

  // if not logged in redirect to /login page
  if (typeof req.session.user !== 'undefined') {
    res.render('timeline.ejs', {
      moment: moment,
      session: req.session,
      newMessage: req.params.number,
      messages: {},
      success: 'none'
    });
  } else {
    res.redirect('/login');
  }

})

// all sockets stuffs

var sockets = require('./private_modules/sockets')(io, app, moment, sms);

http.listen(port, function () {
  console.log('Listening on localhost:' + port);
});
