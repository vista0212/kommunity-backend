import { Repository, getRepository } from 'typeorm';
import { gql } from 'apollo-server-express';
import { pbkdf2, pbkdf2Sync, verify } from 'crypto';
import * as dotenv from 'dotenv';
import * as randomstring from 'randomstring';
import * as jwt from 'jsonwebtoken';

import { User, findByPk, findByEmail, findById } from '../database/entities/user.entity';
import { throwError, catchDBError } from '../lib/error';

dotenv.config();

export const typeDef = gql`
  type User {
    pk: String!
    id: String!
    email: String!
    name: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type UserWithToken {
    user: User!
    token: String!
  }

  extend type Mutation {
    register(id: String, email: String, password: String, signKey: String): Boolean!
  }
`;

const PW_CONFIG: { ITERATION: number; KEY_LENGTH: number; DIGEST: string } = {
  ITERATION: parseInt(process.env.PASSWORD_ENCRYPTION_ITERATION, 10),
  KEY_LENGTH: parseInt(process.env.PASSWORD_ENCRYPTION_KEY_LENGTH, 10),
  DIGEST: process.env.PASSWORD_ENCRYPTION_DIGEST
};

const passwordEncryption: (
  password: User['password'],
  passwordKey: User['passwordKey']
) => User['password'] = (password, passwordKey) => {
  const encryptionPassword: User['password'] = pbkdf2Sync(
    password,
    passwordKey,
    PW_CONFIG.ITERATION,
    PW_CONFIG.KEY_LENGTH,
    PW_CONFIG.DIGEST
  ).toString('base64');

  return encryptionPassword;
};

const issueToken: (pk: User['pk']) => string = pk => {
  const secretKey: string = process.env.TOKEN_SECRET;

  const token: string = jwt.sign(
    {
      pk
    },
    secretKey,
    {
      expiresIn: '1h'
    }
  );

  return token;
};

export const resolvers = {
  Mutation: {
    register: async (
      _: any,
      {
        id,
        email,
        password,
        signKey
      }: {
        id: User['id'];
        email: User['email'];
        password: User['password'];
        signKey: User['signKey'];
      }
    ) => {
      if (!(id && email && password && signKey)) throwError('Invalid Data');

      const userRepository: Repository<User> = getRepository(User);

      await findById(userRepository, id).then((user: User) => {
        if (user) throwError('Exist id');
      });
      await findByEmail(userRepository, email).then((user: User) => {
        if (user) throwError('Exist email');
      });

      const user: User = await userRepository
        .findOne({
          where: {
            signKey
          }
        })
        .catch(catchDBError());

      if (!user) {
        throwError('Invalid Data');
      }

      const passwordKey: string = randomstring.generate(64);
      const encryptionPassword: User['password'] = passwordEncryption(password, passwordKey);

      Object.assign(user, {
        id,
        email,
        password: encryptionPassword,
        passwordKey,
        signKey: ''
      });

      await user.save().catch(catchDBError());

      return true;
    }
  }
};
