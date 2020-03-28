import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

import { User } from '../database/entities/user.entity';
import { throwError } from './error';

dotenv.config();

export const verifyToken: (token: string) => User | void = token => {
  const secretKey: string = process.env.TOKEN_SECRET;

  const decoded: User | void = jwt.verify(
    token,
    secretKey,
    (err: jwt.JsonWebTokenError, result) => {
      if (err) {
        switch (err.name) {
          case 'JsonWebTokenError':
            console.log(1);
            throwError('Token Error');
          case 'TokenExpiredError':
            throwError('Token Expired');
          case 'NotBeforeError':
            throwError('Not Before Error');
          default:
            throwError('Undefined Error');
        }
      }

      return result;
    }
  );

  return decoded;
};
