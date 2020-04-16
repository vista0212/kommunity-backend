import * as gql from 'express-graphql';
import { Repository, getRepository } from 'typeorm';
import { Board } from '../database/entities/board.entity';
import { verifyToken } from '../lib/utils';
import { User, findByPk } from '../database/entities/user.entity';
import { throwError, catchDBError } from '../lib/error';
import { BoardImage } from '../database/entities/boardImage.entity';
import s3 from '../lib/s3';

export const typeDef = `
  type BoardImage {
    pk: Int!
    board_pk: Int!
    image: String!
  }

  type Board {
    pk: Int!
    user_pk: String!
    content: String!
    likes: Int!
    createdAt: Date!
    updatedAt: Date!
    comment: [Comment]
    user: User
    boardImage: [BoardImage]
  }

  extend type Query {
    boards(token: String!): [Board]!
  }

  extend type Mutation {
    postBoard(token: String!, content: String!): Board!
    postImage(token: String!, board_pk: Int, file: Upload): Boolean!
  }
`;

export const resolvers = {
  Query: {
    boards: async (
      _: any,
      {
        token,
      }: {
        token: string;
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);
      const boardRepository: Repository<Board> = getRepository(Board);

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      if (!user) {
        throwError('잘못된 요청입니다.');
      }

      const board: Board[] = await boardRepository
        .find({
          relations: ['user', 'comment', 'comment.user', 'boardImage'],
          order: {
            createdAt: 'DESC',
          },
        })
        .catch(catchDBError());

      return board;
    },
  },
  Mutation: {
    postBoard: async (
      _: any,
      {
        token,
        content,
      }: {
        token: string;
        content: Board['content'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);
      const boardRepository: Repository<Board> = getRepository(Board);

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      if (!user) {
        throwError('잘못된 요청입니다!');
      }

      const board: Board = await boardRepository.save({
        user_pk: user.pk,
        content,
      });

      return board;
    },
    postImage: async (
      _: any,
      {
        token,
        board_pk,
        file,
      }: {
        token: string;
        board_pk: Board['pk'];
        file: any;
      }
    ) => {
      const boardRepository: Repository<Board> = getRepository(Board);
      const boardImageRepository: Repository<BoardImage> = getRepository(BoardImage);

      const { filename, mimetype, createReadStream } = file.file;

      if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
        const board: Board = await boardRepository
          .findOne({ where: { pk: board_pk } })
          .catch(catchDBError());
        await board.remove().catch(catchDBError());
        throwError('잘못된 요청입니다.');
      }

      const Key = Date.now().toString() + filename;

      await boardImageRepository
        .save({
          board_pk,
          image: Key,
        })
        .catch(catchDBError());

      const fileStream = createReadStream();

      const uploadParam = {
        Bucket: 's3-kommunity/board-image',
        Key,
        Body: fileStream,
      };

      await s3
        .upload(uploadParam)
        .promise()
        .catch((err) => {
          console.log(err);
          throwError('알 수 없는 오류');
        });

      return true;
    },
  },
};
