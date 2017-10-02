var newNumber = "";
var allNewMessages;

$( window ).resize(function() {
  if (window.matchMedia("(max-width: 640px), (orientation:portait)").matches) {
    $(".left").hide();
  } else {
    $(".left").show();
  }
});

$(document).on("propertychange change click keyup input paste", "#numberNew", function() {
  $("#number").val($("#numberNew").val());
  newNumber = $("#numberNew").val();
});

function newInputNumber(initNewPerson=true) {
  if(newNumberByURL!=""){
    newNumber = newNumberByURL;
    $("#message").focus();
  }
  $('.right .top .name').html("<input type='text' id='numberNew' value='"+newNumber+"'/>");
  $('.chat').removeClass('active-chat');
  $('.left .person').removeClass('active');


  if(initNewPerson==true) {
    var newMessage = `
    <li class="person active new-person">
    <img src="https://avatars.dicebear.com/v1/female/new/200.png" alt="Nouveau message">
    <span class="name">Nouveau message</span>
    <span class="preview">&nbsp;</span>
    </li>`;
    $(newMessage).prependTo(".people");
    $('.new-message').removeClass('new-message');
  }
  if(newNumberByURL=="") {
    $("#numberNew").focus();
  }
}

$(document).on("click", ".new-person", function() {
  newInputNumber(false);
});

$(document).on("click", ".new-message", function() {
  newInputNumber();

});

console.log(newNumberByURL);


// Lorsqu'on clique sur répondre, le numéro passe dans le champ on remonte la page focus sur le champ textarea
$(document).on("click", ".reply", function() {
  $("#number").val($(this).val());
  $("html, body").animate({
    scrollTop: $("#new-sms").offset().top - 20
  }, 600);
  $("#message").focus();
});

$().ready(function() {

  var window_focus;

  $(window).focus(function() {
    window_focus = true;
  }).blur(function() {
    window_focus = false;
  });

  $.notifyDefaults({
    placement: {
      from: "bottom",
      align: "center"
    },
    animate: {
      enter: 'animated fadeIn',
      exit: 'animated fadeOut'
    }
  });

  var socket = io.connect();

  function submitForm() {
    if($("#number").val()!="" && $("#message").val()!="") {
      console.log("submitted!");
      console.log({number: $("#number").val(), message: $("#message").val()});

      // $.notify("Le message est en cours d'envoi...");

      socket.emit('sms_sended', {
        number: $("#number").val(),
        message: $("#message").val()
      });
      var newMessage = '<div class="bubble me">' + $("#message").val() +
      `<div class="typing-indicator me">
        <span></span>
        <span></span>
        <span></span>
      </div>`
      + "</div>";
      $( newMessage ).appendTo( ".active-chat" );

      $('.active-chat').scrollTop($('.active-chat')[0].scrollHeight);
      $("#message").val("");

    }

  }
  socket.on('connect', function() {
    //console.log(this.socket.sessionid); console.log(socket.io.engine.id);
    console.log(socket.id);
  });

  $(document).on('keypress','#message', function (e) {
    if(e.which === 13){
      submitForm();
    }
  });

  $(document).on("click", "#sms-submit", function() {
    submitForm();
  });

  function titleNotify(){
    if(window_focus==false){
      var titleNotifyInterval = setInterval(function(){

        document.title = "(1) SMS Magic";
        setTimeout(function(){
          document.title = "New message !";
          if(window_focus==true) {
            document.title = "SMS Magic";
            clearInterval(titleNotifyInterval);
          }
        }, 1500);



      }, 3000);
    }
  }

  //console.log(socket.io.engine.id);
  // a la reception des messages du serveur,
  // on les affiches on vide le contenu de l'id messages
  // on fait rentrer les messages en douceur
  // on retire l'écran de chargement et on focus sur le champ textarea
  socket.on("messages", function(messages) {

    var messageEnCours = $("#message").val();
    var number = $("#number").val();
    $("#messages").empty();
    //$(messages).hide().prependTo("#messages").fadeIn("slow");

    $(messages).prependTo("#messages")

    if($('.active-chat').length === 0){
      $('.chat').first().addClass('active-chat');
      $('.person').first().addClass('active');
    }
    $("#number").val( $('.active').attr('number') );

    $('.active-chat').scrollTop($('.active-chat')[0].scrollHeight);


    $('.right .top .name').html( $('.active').find('.name').text() );
    //$(".write").empty();
    $("#message").val(messageEnCours);

    if(number!=""){
      $("#number").val(number);
    }
    $("body").removeClass("loading");
    $("#message").focus();

    if(newNumberByURL!=="") {
      newInputNumber();
    }
    titleNotify();
  });

  socket.on('sms_sended_success', function(socket) {
    console.log("Message envoyé");

    //$.notifyClose();
    //$.notify("Le message a bien été envoyé, petit coquin.");

  });

  socket.on("logout", function() {
    $( '<div class=" me">Vous avez été <a href="/login">déconnecté</a>.</div>' ).appendTo( ".active-chat" );
    $('.active-chat').scrollTop($('.active-chat')[0].scrollHeight);
  });

  socket.emit("give_me_list_messages");

  $("#logout").on("click", function() {

    console.log("logout!");
    socket.emit("ask_logout");
  });

  $(document).on('mousedown', '.left .person', function(){

    if (window.matchMedia("(max-width: 640px)").matches) {
      $(".left").hide();
    }

    if ($(this).hasClass('.active')) {
      return false;
    } else {
      var findChat = $(this).attr('data-chat');
      var number = $(this).attr('number');
      $("#number").val(number);
      //console.log(number);
      var personName = $(this).find('.name').text();
      if(personName!='Nouveau message')  {
        $('.right .top .name').html(personName);
      }
      $('.chat').removeClass('active-chat');
      $('.left .person').removeClass('active');
      $(this).addClass('active');
      $('.chat[data-chat = '+findChat+']').addClass('active-chat');
    }
    $('.active-chat').scrollTop($('.active-chat')[0].scrollHeight);
    socket.emit("current_tab", findChat);
  });

});
//  messages[0].contact.number %> numero du dernier destinataire
