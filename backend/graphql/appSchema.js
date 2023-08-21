const {GraphQLSchema, GraphQLObjectType} = require('graphql');
const {UserMutations, UserQueries} = require('./userSchema');
const {TodoMutations, TodoQueries} = require('./todoSchema');

const QueryRootType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    ...UserQueries,
    ...TodoQueries,
  }),
});

const MutationRootType = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    ...UserMutations,
    ...TodoMutations,
  }),
});

const AppSchema = new GraphQLSchema({
  query: QueryRootType,
  mutation: MutationRootType,
});

module.exports = AppSchema;
