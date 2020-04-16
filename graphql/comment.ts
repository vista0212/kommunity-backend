import { gql } from 'apollo-server-express';
import { Board } from '../database/entities/board.entity';
import { Comment } from '../database/entities/comment.entity';
import { Repository, getRepository } from 'typeorm';
import { User, findByPk } from '../database/entities/user.entity';
import { verifyToken } from '../lib/utils';
import { throwError, catchDBError } from '../lib/error';

export const typeDef = gql`
  type Comment {
    pk: Int!
    user_pk: String!
    board_pk: Int!
    content: String!
    createdAt: Date!
    updatedAt: Date!
    user: User
  }

  extend type Query {
    _comment_empty: String
  }

  extend type Mutation {
    postComment(token: String!, board_pk: Int!, content: String!): Boolean!
  }
`;

export const resolvers = {
  Query: {},
  Mutation: {
    postComment: async (
      _: any,
      {
        token,
        board_pk,
        content,
      }: {
        token: string;
        board_pk: Board['pk'];
        content: Comment['content'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);
      const boardRepository: Repository<Board> = getRepository(Board);
      const commentRepository: Repository<Comment> = getRepository(Comment);

      if (!content) {
        throwError('글을 입력해주세요!');
      }

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      const board: Board = await boardRepository
        .findOne({
          where: {
            pk: board_pk,
          },
        })
        .catch(catchDBError());

      if (!board || !user) {
        throwError('잘못된 요청입니다!');
      }

      await commentRepository
        .save({
          user_pk: user.pk,
          board_pk: board.pk,
          content,
        })
        .catch(catchDBError());

      return true;
    },
  },
};
