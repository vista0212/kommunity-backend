import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as graphqlHTTP from 'express-graphql';
import { createConnection } from 'typeorm';
import * as cors from 'cors';

import schema from './graphql/schema';
import connectionOptions from './database/index';

const app: express.Application = express();

app.use(cors());

createConnection(connectionOptions)
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

export default app;
