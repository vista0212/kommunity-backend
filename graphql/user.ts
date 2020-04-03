import { Repository, getRepository } from 'typeorm';
import { gql } from 'apollo-server-express';
import { pbkdf2Sync } from 'crypto';
import * as dotenv from 'dotenv';
import * as randomstring from 'randomstring';
import * as jwt from 'jsonwebtoken';
import s3 from '../lib/s3';

import { User, findByPk, findByEmail, findById } from '../database/entities/user.entity';
import { throwError, catchDBError } from '../lib/error';
import { verifyToken } from '../lib/utils';

dotenv.config();

export const typeDef = gql`
  type User {
    pk: String!
    id: String!
    email: String!
    name: String!
    image: String
    createdAt: Date!
    updatedAt: Date!
  }

  type UserWithToken {
    user: User!
    token: String!
  }

  extend type Query {
    getUser(token: String): User
  }

  extend type Mutation {
    register(id: String, email: String, password: String, signKey: String): Boolean!
    login(id: String, password: String): UserWithToken!
    image(file: Upload!): Boolean!
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
  Query: {
    getUser: async (
      _: any,
      {
        token
      }: {
        token: string;
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      if (!user) throwError('잘못된 요청입니다.');

      return user;
    }
  },
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
      const userRepository: Repository<User> = getRepository(User);

      await findById(userRepository, id).then((user: User) => {
        if (user) throwError('이미 존재하는 아이디입니다.');
      });
      await findByEmail(userRepository, email).then((user: User) => {
        if (user) throwError('이미 존재하는 이메일입니다.');
      });

      const user: User = await userRepository
        .findOne({
          where: {
            signKey
          }
        })
        .catch(catchDBError());

      if (!user) {
        throwError('일치하는 회원 키가 없습니다.');
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
    },
    login: async (
      _: any,
      {
        id,
        password
      }: {
        id: User['id'];
        password: User['password'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);

      const user: User = await findById(userRepository, id);

      if (!user) throwError('존재하지 않는 유저입니다.');

      const encryptionPassword: User['password'] = passwordEncryption(password, user.passwordKey);

      if (user.password !== encryptionPassword) throwError('비밀번호가 일치하지 않습니다.');

      const token: string = issueToken(user.pk);

      return {
        user,
        token
      };
    },
    image: async (_: any, args: any) => {
      try {
        const file = args.file.file;

        const { createReadStream, filename, mimetype } = file;
        const fileStream = createReadStream();

        const uploadParams = {
          Bucket: 'kommunity-s3',
          Key: Date.now().toString() + filename,
          Body: fileStream
        };

        await s3.upload(uploadParams).promise();

        return true;
      } catch (err) {
        console.log(err);
      }
    }
  }
};
