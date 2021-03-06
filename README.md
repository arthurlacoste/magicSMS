# magicSMS

MagicSMS is a webapp allowing __you__ to use a webinterface to send your SMS, from your Android device (don't work with iOS or Windows Mobile). At the moment, we using [smsgateway.me](https://smsgateway.me/) as a third party server. This app is just an interface for using this service, but __we can do more than that__ !

## Interface

We using a Messenger-like interface, you can fork it [here](https://github.com/arthurlacoste/fullscreen-flexbox-chat-facebook-messenger-like).

![screenshot fullscreen flexbox chat facebook messenger like](https://github.com/arthurlacoste/fullscreen-flexbox-chat-facebook-messenger-like/raw/master/screenshot-fullscreen-flexbox-chat-facebook-messenger-like.png)

## Installation

### 1. You need to have an account on [smsgateway.me](https://smsgateway.me/)

### 2. Install the Android app [SMS Gateway Me](https://play.google.com/store/apps/details?id=networked.solutions.sms.gateway.api)

### 3. Install magicSMS :

```
git clone https://github.com/arthurlacoste/magicSMS
```

### 4. Start the server :

```
npm start
```

## Dependencies

MagicSMS is a [nodeJS](https://nodejs.org/en/) app using some usefull NPM modules like :
- [Express](https://expressjs.com/)
- [Moment](https://momentjs.com/docs/)
- [EJS](http://ejs.co/)

## Todolist

- Add a way to logout
- Using other services than Smsgateway.me, because smileys doesn't work ! :/

I'm not affiliate to Smsgateway.me.

Thanks for Momcilo Popov for his [interface](https://codepen.io/Momciloo/pen/bEdbxY).
