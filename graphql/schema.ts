import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { merge } from 'lodash';
import { gql } from 'apollo-server-express';

import * as User from './user';

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
  Mutation: {}
};

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [typeDef, User.typeDef],
  resolvers: merge(resolvers, User.resolvers)
});

export default schema;
