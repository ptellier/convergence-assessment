const graphql = require("graphql");
const {GraphQLObjectType,  GraphQLString, GraphQLEnumType, GraphQLList} = graphql;
const db = require("../dbConnection.js");
const {ObjectId} = require("mongodb");
const {MongoUpdateType, MongoDeleteType, MongoInsertType} = require("./mongoTypes");
const checkAuthorized = require("../authorization");
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

const TodoQueries = {
  getAllTodos: {
    type: new GraphQLList(TodoType),
    args: {},
    resolve(_, args) {
      return todoCollection.find({}).toArray();
    }
  }
}

const TodoMutations = {
  addTodo: {
    type: MongoInsertType,
    args: {
      title: {type: GraphQLString},
      description: {type: GraphQLString},
      status: {type: TodoStatusEnum},
      access_token: {type: GraphQLString}
    },
    resolve: async (parent, {title, description, status, access_token}) => {
      try {
        const authCheck = await checkAuthorized(access_token);
        if (authCheck.error) {
          return {error: authCheck.error}
        }
        const username = authCheck.username;
        const response = await todoCollection.insertOne({title, description, status, username});
        return {
          acknowledged: response.acknowledged,
          insertedId: response.insertedId,
        }
      } catch (error) {
        console.log(error)
        return {error: error.message}
      }
    }
  },
  deleteTodo: {
    type: MongoDeleteType,
    args: {
      _id: {type: GraphQLString},
      access_token: {type: GraphQLString},
    },
    resolve: async (parent, {_id, access_token}) => {
      try {
        const authCheck = await checkAuthorized(access_token);
        if (authCheck.error) {
          return {error: authCheck.error}
        }
        const username = authCheck.username;
        const responseFind = await todoCollection.findOne({_id: new ObjectId(_id)});
        if (responseFind.username !== username) return {error: "Not authorized"}
        const responseDelete = await todoCollection.deleteOne({_id: new ObjectId(_id)});
        return {
          acknowledged: responseDelete.acknowledged,
          deletedCount: responseDelete.deletedCount
        }
      } catch (error) {
        console.log(error)
        return {error: error.message}
      }
    }
  },
  updateTodo: {
    type: MongoUpdateType,
    args: {
      _id: {type: GraphQLString},
      title: {type: GraphQLString},
      description: {type: GraphQLString},
      status: {type: TodoStatusEnum},
      access_token: {type: GraphQLString},
    },
    resolve: async (parent, {_id, title, description, status, access_token}) => {
      try {
        const authCheck = await checkAuthorized(access_token);
        if (authCheck.error) {
          return {error: authCheck.error}
        }
        const username = authCheck.username;
        const responseFind = await todoCollection.findOne({_id: new ObjectId(_id)});
        if (responseFind.username !== username) return {error: "Not authorized"}
        const setObj = {}
        if (title) setObj.title = title
        if (description) setObj.description = description
        if (status) setObj.status = status
        const response = await todoCollection.updateOne({_id: new ObjectId(_id)}, {$set: setObj})
        return {
          acknowledged: response.acknowledged,
          modifiedCount: response.modifiedCount,
        }
      } catch (error) {
        console.log(error)
        return {error: error.message}
      }
    }
  }
}

module.exports = {TodoQueries, TodoMutations};
