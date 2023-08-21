const graphql = require("graphql");
const { GraphQLObjectType,  GraphQLString, GraphQLSchema, GraphQLEnumType, GraphQLList, } = graphql;
const db = require("../dbConnection.js");
todoCollection = db.collection("todos");

const TodoStatusEnum = new GraphQLEnumType({
  name: "TodoStatus",
  values: {
    NOT_STARTED: { value: "NOT_STARTED" },
    IN_PROGRESS: { value: "IN_PROGRESS" },
    COMPLETED: { value: "COMPLETED" },
  }
});

const TodoType = new GraphQLObjectType({
  name: "Todo",
  fields: () => ({
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: TodoStatusEnum },
  })
});

const MongoInsertType = new GraphQLObjectType({
  name: "MongoInsert",
  fields: () => ({
    acknowledged: { type: GraphQLString },
    insertedId: { type: GraphQLString },
    error: { type: GraphQLString },
  })
})

RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllTodos: {
      type: new GraphQLList(TodoType),
      args: {},
      resolve(_, args) {
        return todoCollection.find({}).toArray();
      }
    }
  }
});

TodoMutations = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addTodo: {
      type: MongoInsertType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: TodoStatusEnum },
      },
      resolve: async (parent, args) => {
        try {
          const response = await todoCollection.insertOne(args)
          return {
            acknowledged: response.acknowledged,
            insertedId: response.insertedId
          }
        } catch (error) {
          console.log(error)
          return {error: error.message}
        }
      }
    }
  }
});

const AppSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: TodoMutations,
});

module.exports = AppSchema;
