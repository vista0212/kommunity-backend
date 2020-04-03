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
            throwError('잘못된 토큰입니다.');
          case 'TokenExpiredError':
            throwError('토큰이 만료되었습니다.');
          case 'NotBeforeError':
            throwError('Not Before Error');
          default:
            throwError('알 수 없는 오류입니다.');
        }
      }

      return result;
    }
  );

  return decoded;
};
