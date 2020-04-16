import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { merge } from 'lodash';
import { gql } from 'apollo-server-express';

import * as User from './user';
import * as Board from './board';
import * as Comment from './comment';

const typeDef = gql`
  scalar Date
  scalar Upload

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {
  Query: {},
  Mutation: {},
};

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [typeDef, User.typeDef, Board.typeDef, Comment.typeDef],
  resolvers: merge(resolvers, User.resolvers, Board.resolvers, Comment.resolvers),
});

export default schema;
