import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';

import { User } from './entities/user.entity';

dotenv.config();

const DB_CONFIG = {
  DB_NAME: process.env.DB_NAME || undefined,
  DB_HOST: process.env.DB_HOST || undefined,
  DB_USERNAME: process.env.DB_USERNAME || undefined,
  DB_PASSWORD: process.env.DB_PASSWORD || undefined
};

const connectionOptions: ConnectionOptions = {
  entities: [User],
  type: 'mysql',
  host: DB_CONFIG.DB_HOST,
  database: DB_CONFIG.DB_NAME,
  username: DB_CONFIG.DB_USERNAME,
  password: DB_CONFIG.DB_PASSWORD,
  port: 3306,
  synchronize: true,
  logging: true
};

export default connectionOptions;
