import Config from '../config/index';
import { updateUserFromFbEvent } from '../services/User';

const request = require('request');

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

export function handleMessage(req, res) {
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      if (entry.messaging) {
        entry.messaging.forEach(async (event) => {
          updateUserFromFbEvent(event);
          console.log('EVENT================================>', event);
        });
      }
    });
  }
  res.sendStatus(200);
}
