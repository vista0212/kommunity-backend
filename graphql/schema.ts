import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { merge } from 'lodash';

import * as User from './user';
import { gql } from 'apollo-server-express';

const typeDef = gql`
  scalar Date

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
