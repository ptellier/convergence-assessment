const graphql = require("graphql");
const {GraphQLObjectType,  GraphQLString} = graphql;

const MongoInsertType = new GraphQLObjectType({
  name: "MongoInsert",
  fields: () => ({
    acknowledged: { type: GraphQLString },
    insertedId: { type: GraphQLString },
    error: { type: GraphQLString },
  })
})

const MongoDeleteType = new GraphQLObjectType({
  name: "MongoDelete",
  fields: () => ({
    acknowledged: { type: GraphQLString },
    deletedCount: { type: GraphQLString },
    error: { type: GraphQLString },
  })
})

const MongoUpdateType = new GraphQLObjectType({
  name: "MongoUpdate",
  fields: () => ({
    acknowledged: { type: GraphQLString },
    modifiedCount: { type: GraphQLString },
    error: { type: GraphQLString },
  })
})

module.exports = {MongoInsertType, MongoDeleteType, MongoUpdateType}