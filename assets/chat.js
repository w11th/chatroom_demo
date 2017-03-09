var Chatter = (function() {
  var socket, nickname;

  nickname = prompt("What's your nickname?");

  var init = function() {
    if(nickname === null){
      alert('No nickname!');
    }

    socket = io.connect('http://localhost:8080', function() {});

    socket.on('connect', function() {
      socket.emit('join', nickname);
    });

    socket.on('chatters', function(chatters) {
      chatters.forEach(function(chatter) {
        addChatter(chatter);
      });
    });

    socket.on('messages', function(messages) {
      messages.forEach(function(message) {
        message = JSON.parse(message);
        addMessage(message);
      })
    });

    socket.on('chatter enter', function(chatter) {
      addChatter(chatter);
    });

    socket.on('chatter leave', function(chatter) {
      removeChatter(chatter);
    });

    socket.on('message', function(message) {
      console.log(message);
      addMessage(message);
    });
  }

  var sendMessage = function(message) {
    socket.emit('message', message);
  }

  function addMessage(data) {
    var messageElement = document.createElement('li');
    messageElement.textContent = data.nickname + ": " + data.message;
    document.getElementById('chat_board').appendChild(messageElement);
  };

  function addChatter(chatter) {
    var chatterElement = document.createElement('li');
    chatterElement.textContent = chatter;
    chatterElement.setAttribute('data-name', chatter);
    document.getElementById('chatter_list').appendChild(chatterElement);
    addMessage({ nickname: 'SYSTEM', message: chatter + ' entered!' });
  }

  function removeChatter(chatter) {
    var chatterElement = document.querySelector('#chatter_list li[data-name=' + chatter + ']');
    chatterElement.remove();
    addMessage({ nickname: 'SYSTEM', message: chatter + ' leave!' });
  }

  return { init: init, sendMessage: sendMessage };
})();
