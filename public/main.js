$(function() {
  // Initialize variables
  var $window = $(window);
  var $messages = $('.messages'); // Messages area
  var $users =  $('.users'); // Users area
  var $inputMessage = $('#send-message-textInput'); // Input message input box
  var $sendBtn = $('#send-message-btn'); // Send Button

  var currentUserFbId = null; // User that is being supported

  var connectedUsers = {};
  
  // Prompt for setting a username
  var connected = true;
  var socket = io();

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
        identifier: null,
      }
      addOutgoingMessage(message);
      $inputMessage.val('');
      socket.emit('new message', {
        message: inputMessage,
        fbUser: connectedUsers[currentUserFbId].user,
      });
    }
  }

  // Adds the visual chat message to the message list
  function addOutgoingMessage(message) {
    var $messageDiv = $('<div class="column is-half margin-top-bottom"><div class="padding-left-right-10px"><span><b>You</b></span></div><div class="padding-left-right-10px"><span>'+message.text+'</span></div></div>')
    addMessageElement($messageDiv, message.identifier);
  }

  function addIncomingMessage(message) {
    var $messageDiv = $('<div class="column is-half is-offset-6 margin-top-bottom"><div class="padding-left-right-10px"><span><b>'+message.fullName+'</b></span></div><div class="padding-left-right-10px"><span>'+message.text+'</span></div></div>')
    addMessageElement($messageDiv, message.identifier);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  function addMessageElement (el, fbId) {
    var $el = $(el);
    var messages = fbId ? connectedUsers[fbId].messages : connectedUsers[currentUserFbId].messages;
    messages.append($el);
    messages.animate({ scrollTop: messages.prop("scrollHeight")}, 1000);
  }

  function buildUserElement(user) {
    return $('<div class="user" id="user_'+user.fbId+'">' + user.firstName + ' ' + user.lastName + '<a class="button is-primary" id="start-support-btn" data-fbId="'+user.fbId+'">Start Support</a></div>');
    addUserElement($messageDiv);
  }

  function addUserElement(el) {
    var $el = $(el);
    $users.append($el);
    $(".users").animate({ scrollTop: $('.users').prop("scrollHeight")}, 1000);
  }

  function stopSupport(fbId) {
     //remove user from connected user object
     delete connectedUsers[fbId];
     //remove user from user list
     $('#user_'+fbId).remove();
     //empty all user messages
     $messages.empty();
     if (Object.keys(connectedUsers).length == 0) {
       disableSendMessage();
     }
  }

  function enableSendMessage() {
    $inputMessage.removeAttr('disabled');
    $sendBtn.removeAttr('disabled');
  }

  function disableSendMessage() {
    $inputMessage.attr('disabled', 'disabled');
    $sendBtn.attr('disabled', 'disabled');
  }

  // Keyboard events
  $window.keydown(function (event) {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      sendMessage();
    }
  });

  // Click events
  $(document).on('click', '#start-support-btn', function() {
    currentUserFbId = $(this).attr('data-fbId');
    $(this).replaceWith($('<a class="button is-danger" id="stop-support-btn" data-fbId='+currentUserFbId+'>Stop Support</a></div>'))

    enableSendMessage();

    if(!connectedUsers[currentUserFbId].messages) {
      connectedUsers[currentUserFbId].messages = $('<div class="messages" id="' + currentUserFbId + '"></div>');
    }
    $messages.replaceWith(connectedUsers[currentUserFbId].messages);
    $messages = connectedUsers[currentUserFbId].messages;
  });

  $(document).on('click', '#stop-support-btn', function() {
    var fbId = $(this).attr('data-fbId');
    socket.emit('stop support', connectedUsers[fbId].user);
    stopSupport(fbId);
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  $("#send-message-btn").click(function() {
    sendMessage();
  });

  // Socket events
  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    const message = {
      text: data.text,
      fullName: data.user.firstName + ' ' + data.user.lastName,
      identifier: data.user.fbId,
    }
    addIncomingMessage(message);
  });

  socket.on('add user', function (user) {
    if(!connectedUsers[user.fbId]) {
      connectedUsers[user.fbId] = {
        user,
      }
      var userDiv = buildUserElement(user);
      addUserElement(userDiv);
    }
  });

  socket.on('stop support', function (user) {
    stopSupport(user.fbId);
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
