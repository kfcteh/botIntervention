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
      metadata: 'DEVELOPER_DEFINED_METADATA',
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

function startUserAssitance(req, event, user) {
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
          if (event.message && event.message.text && event.message.text === 'help') {
            await User.setHelpState(updatedUser);
            startUserAssitance(req, event, updatedUser);
            return;
          }
          if (updatedUser.botState.state === states.HELP) {
            startUserAssitance(req, event, updatedUser);
            return;
          }
          sendTextMessage(updatedUser.fbId, '☺️');
        });
      }
    });
  }
  res.sendStatus(200);
}
