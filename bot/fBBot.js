import Config from '../config/index';
import * as User from '../services/User';
import states from './states';

const request = require('request');

/**
 * Sends fB formatted message to Messenger User
 *
 * @export
 * @param {any} message
 */
export function callSendAPI(message) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: Config.bot.pageAccessToken },
    method: 'POST',
    json: message,
  }, (error, response, body) => {
    if (response.statusCode === 200) {
      console.log('Successfully called Send API');
    } else {
      console.error('Failed calling Send API', body);
    }
  });
}

/**
 * Send Need Help Quick Reply To FB User
 *
 * @export
 * @param {any} fbId
 * @param {any} text
 */
function sendHelpQuickReply(fbId) {
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
  callSendAPI(message);
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
  callSendAPI(message);
}

/**
 * Retrieves FB user profile give fbId
 *
 * @export
 * @param {any} id
 * @returns promise
 */
export function getUserProfile(id) {
  return new Promise((resolve, reject) => {
    request({
      uri: `https://graph.facebook.com/v2.7/${id}`,
      qs: {
        access_token: Config.bot.pageAccessToken,
      },
      method: 'GET',
    }, (error, response, body) => {
      if (response.statusCode === 200) {
        resolve(JSON.parse(body));
      } else {
        reject(response.statusCode);
      }
    });
  });
}

/**
 * Validates Messenger WebHook
 *
 * @export
 * @param {any} req
 * @param {any} res
 */
export function validate(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === Config.bot.verifyToken) {
    console.log('========================>Validating webhook<============================');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('======================>Failed validation<==============================');
    res.sendStatus(403);
  }
}

function redirectToUserAssitance(req, event, user) {
  Object.keys(req.app.get('socketio').sockets.connected).forEach((key) => {
    req.app.get('socketio').sockets.connected[key].emit('new message', JSON.stringify({
      text: event.message.text,
      user,
    }));
  });
}

/**
 * Entry Point FB Messenger Posts
 *
 * @export
 * @param {any} req
 * @param {any} res
 */
export function handleMessage(req, res) {
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      if (entry.messaging) {
        entry.messaging.forEach(async (event) => {
          const updatedUser = await User.updateFromFbEvent(event);
          if (event.message && event.message.text && event.message.text.toLowerCase() === 'help') {
            sendHelpQuickReply(updatedUser.fbId);
            return;
          }
          if (event.message && event.message.text && event.message.text.toLowerCase() === 'exit') {
            await User.setNormalState(updatedUser);
            sendTextMessage(updatedUser.fbId, 'Okay, you have terminated your customer support session.');
            return;
          }
          if (event.message && event.message.quick_reply && event.message.quick_reply.payload === 'CUSTOMER_SUPPORT_YES') {
            sendTextMessage(updatedUser.fbId, 'Okay, a customer support representative will be with you shortly. Type \'exit\' to stop support session');
            await User.setHelpState(updatedUser);
            return;
          }
          if (updatedUser.botState.state === states.HELP) {
            redirectToUserAssitance(req, event, updatedUser);
            return;
          }
          sendTextMessage(updatedUser.fbId, '☺️');
        });
      }
    });
  }
  res.sendStatus(200);
}
