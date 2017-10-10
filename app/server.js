import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';
import { sendTextMessage } from '../bot/fBBot';

const port = process.env.PORT || 5000;
const env = process.env.ENV || 'development';
const app = express();

app.use(express.static(`${__dirname}/../public`));

app.use(bodyParser.json());
app.use('/bot', routes);

const io = require('socket.io')(app.listen(port, () => {
  console.log(env, port);
}));

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('new client connected');
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    console.log('message sent from client', data);
    const message = JSON.parse(data).message;
    const fbId = JSON.parse(data).fbUser.fbId;
    sendTextMessage(fbId, message);
  });
});
