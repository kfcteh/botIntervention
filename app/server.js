import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';

const port = process.env.PORT || 5000;
const env = process.env.ENV || 'development';
const app = express();

app.use(bodyParser.json());
app.use('/bot', routes);

app.listen(port, () => {
  console.log(env, port);
});
