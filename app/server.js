import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';
import { sendTextMessage } from '../bot/botActions';
import * as User from '../services/User';

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
  socket.on('new message', (data) => {
    sendTextMessage(data.fbUser.fbId, data.message);
  });
  socket.on('stop support', async (data) => {
    const user = await User.findByFbId(data.fbId);
    await User.setNormalState(user);
    sendTextMessage(data.fbId, 'Support has ended your support session.');
  });
});
