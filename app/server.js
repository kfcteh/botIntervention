import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';

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

io.on('connection', function (socket) {
  console.log('client connected!');
});
