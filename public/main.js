$(function() {
  // Initialize variables
  var $window = $(window);
  var $messages = $('.chatView'); // Messages area
  var $inputMessage = $('.input'); // Input message input box
  var $sendBtn = $('#send-message-btn'); // Send Button

  // Prompt for setting a username
  var connected = true;
  var fbUser = null;

  var socket = io();

  $("#stop-suppot-btn").click(function() {
    alert( "Handler for stop support called." );
    socket.emit('stop support', fbUser);
  });

  $("#send-message-btn").click(function() {
    sendMessage();
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
  function log (message) {
    var $el = $('<p>').text(message);
    addMessageElement($el);
  }

  // Sends a chat message to server
  function sendMessage () {
    var inputMessage = $inputMessage.val();
    if (inputMessage && connected) {
      const message = {
        text: inputMessage,
        fullName: 'Support',
        identifier: '007',
      }
      addOutgoingMessage(message);
      $inputMessage.val('');
      socket.emit('new message', {
        message: inputMessage,
        fbUser,
      });
    }
  }

  // Adds the visual chat message to the message list
  function addOutgoingMessage(message) {
    console.log(message);
    var $messageDiv = $('<div class="column is-half margin-top-bottom"><div class="padding-left-right-10px"><span><b>You</b></span></div><div class="padding-left-right-10px"><span>'+message.text+'</span></div></div>')
    addMessageElement($messageDiv);
  }

  function addIncomingMessage(message) {
    console.log(message);
    var $messageDiv = $('<div class="column is-half is-offset-6 margin-top-bottom"><div class="padding-left-right-10px"><span><b>'+message.fullName+'</b></span></div><div class="padding-left-right-10px"><span>'+message.text+'</span></div></div>')
    addMessageElement($messageDiv);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  function addMessageElement (el) {
    var $el = $(el);
    $messages.append($el);
    $(".chatView").animate({ scrollTop: $('.chatView').prop("scrollHeight")}, 1000);
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }
  // Keyboard events

  $window.keydown(function (event) {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      sendMessage();
    }
  });

  // Click events

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events
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
    addIncomingMessage(message);
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
