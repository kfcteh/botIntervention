import * as FbBot from './fBBot';
import * as User from '../services/User';

function sendSupportClientNewUser(req, user) {
  Object.keys(req.app.get('socketio').sockets.connected).forEach((key) => {
    req.app.get('socketio').sockets.connected[key].emit('add user', user);
  });
}

function sendClientStopSupport(req, user) {
  Object.keys(req.app.get('socketio').sockets.connected).forEach((key) => {
    req.app.get('socketio').sockets.connected[key].emit('stop support', user);
  });
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

export function redirectToUserAssitance(req, event, user) {
  Object.keys(req.app.get('socketio').sockets.connected).forEach((key) => {
    req.app.get('socketio').sockets.connected[key].emit('new message', {
      text: event.message.text,
      user,
    });
  });
}

export async function exitSupportSession(req, user) {
  await User.setNormalState(user);
  sendTextMessage(user.fbId, 'Okay, you have terminated your customer support session.');
  sendClientStopSupport(req, user);
}

export async function startCustomerSupport(req, user) {
  sendTextMessage(user.fbId, 'Okay, a customer support representative will be with you shortly. Type \'exit\' to stop support session');
  await User.setHelpState(user);
  sendSupportClientNewUser(req, user);
}

/**
 * Send Need Help Quick Reply To FB User
 *
 * @export
 * @param {any} fbId
 * @param {any} text
 */
export function sendHelpQuickReply(fbId) {
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
}
