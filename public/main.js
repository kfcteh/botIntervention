$(function() {
  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var connected = true;
  var typing = false;
  var $currentInput = $usernameInput.focus();
  var fbUser = null;

  var socket = io();

  $("#stop-suppot-btn").click(function() {
    alert( "Handler for stop support called." );
    socket.emit('stop support', fbUser);
  });

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Sends a chat message
  function sendMessage () {
    var inputMessage = $inputMessage.val();
    if (inputMessage && connected) {
      const message = {
        text: inputMessage,
        fullName: 'Support',
        identifier: '007',
      }
      addMessage(message);
      socket.emit('new message', {
        message: inputMessage,
        fbUser,
      });
    }
  }
  
  // Adds the visual chat message to the message list
  function addMessage(message) {
    var $usernameDiv = $('<span class="username"/>')
      .text(message.fullName);
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(message.text);
    var $messageDiv = $('<li class="message"/>')
      .data('username', message.identifier)
      .append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);
    $messages.append($el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }
  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    }
  });

  // Click events

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    const parsedData = JSON.parse(data);
    fbUser = parsedData.user;
    const text = parsedData.text;
    const message = {
      text,
      fullName: fbUser.firstName + ' ' + fbUser.lastName,
      identifier: fbUser.fbId,
    }
    addMessage(message);
  });

  socket.on('disconnect', function () {
    log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    log('you have been reconnected');
  });

  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });
});
