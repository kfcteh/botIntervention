import * as FbBot from './fBBot';
import * as User from '../services/User';

function sendSupportClientNewUser(socketio, user) {
  Object.keys(socketio.sockets.connected).forEach((key) => {
    socketio.sockets.connected[key].emit('add user', user);
  });
}

function sendClientStopSupport(socketio, user) {
  Object.keys(socketio.sockets.connected).forEach((key) => {
    socketio.sockets.connected[key].emit('stop support', user);
  });
}

function isClientConnected(socketio) {
  return Object.keys(socketio.sockets.connected).length !== 0;
}

/**
 * Sends Text message to Messenger User
 *
 * @export
 * @param {any} fbId
 * @param {any} text
 */
export function sendTextMessage(fbId, text) {
  const message = {
    recipient: {
      id: fbId,
    },
    message: {
      text,
    },
  };
  FbBot.callSendAPI(message);
}

export function redirectToUserAssitance(socketio, event, user) {
  Object.keys(socketio.sockets.connected).forEach((key) => {
    socketio.sockets.connected[key].emit('new message', {
      text: event.message.text,
      user,
    });
  });
}

export async function exitSupportSession(socketio, user) {
  await User.setNormalState(user);
  sendTextMessage(user.fbId, 'Okay, you have terminated your customer support session.');
  sendClientStopSupport(socketio, user);
}

export async function startCustomerSupport(socketio, user) {
  sendTextMessage(user.fbId, 'Okay, a customer support representative will be with you shortly. Type \'exit\' to stop support session');
  await User.setHelpState(user);
  sendSupportClientNewUser(socketio, user);
}

/**
 * Send Need Help Quick Reply To FB User
 *
 * @export
 * @param {any} fbId
 * @param {any} text
 */
export function sendHelpQuickReply(socketio, fbId) {
  if (isClientConnected(socketio)) {
    const message = {
      recipient: {
        id: fbId,
      },
      message: {
        text: 'Do you need help from customer support?',
        quick_replies: [{
          content_type: 'text',
          title: 'Yes',
          payload: 'CUSTOMER_SUPPORT_YES',
        },
        {
          content_type: 'text',
          title: 'No',
          payload: 'CUSTOMER_SUPPORT_NO',
        }],
      },
    };
    FbBot.callSendAPI(message);
    return;
  }

  sendTextMessage(fbId, 'Sorry there isn\'t a support person available please try again later');
}
