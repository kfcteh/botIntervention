import Config from '../config/index';

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
        entry.messaging.forEach((event) => {
          console.log('EVENT================================>', event);
        });
      }
    });
  }
  res.sendStatus(200);
}
