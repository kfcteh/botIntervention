import Config from '../config/index';
import { updateUserFromFbEvent } from '../services/User';

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
      console.log('Successfully called Send API for recipient %s');
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
          const updatedUser = await updateUserFromFbEvent(event);
          Object.keys(req.app.get('socketio').sockets.connected).forEach((key) => {
            req.app.get('socketio').sockets.connected[key].emit('new message', JSON.stringify({
              text: event.message.text,
              user: updatedUser,
            }));
          });
          sendTextMessage(updatedUser.fbId, event.message.text);
        });
      }
    });
  }
  res.sendStatus(200);
}
