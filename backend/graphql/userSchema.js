const graphql = require("graphql");
const {GraphQLObjectType,  GraphQLString, GraphQLList} = graphql;
const {MongoInsertType} = require("./mongoTypes");
const db = require("../dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userCollection = db.collection("users");
require("dotenv").config();

const EXPIRY_TIME_OF_ACCESS_TOKEN = "1d";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    password_hash: { type: GraphQLString },
  })
});

const LoginType = new GraphQLObjectType({
  name: "LoginType",
  fields: () => ({
    access_token: { type: GraphQLString },
    error: { type: GraphQLString },
  })
});

const UserQueries = {
  getAllUsers: {
    type: new GraphQLList(UserType),
    args: {},
    resolve(_, args) {
      return userCollection.find({}).toArray();
    }
  }
}

const UserMutations = {
  signup: {
    type: MongoInsertType,
    args: {
      username: {type: GraphQLString},
      password: {type: GraphQLString},
    },
    resolve: async (parent, {username, password}) => {
      if (await userCollection.findOne({username: username})) {
        return {error: "Username already taken"};
      }
      try {
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = {
          username: username,
          password_hash: password_hash,
        };
        return await userCollection.insertOne(newUser);
      } catch (err) {
        return {error: err.message};
      }
    }
  },
  login: {
    type: LoginType,
    args: {
      username: {type: GraphQLString},
      password: {type: GraphQLString},
    },
    resolve: async (parent, {username, password}) => {
      const foundUser = await userCollection.findOne({ username: username });
      if (!foundUser) return {error: `Could not find user "${username}"`}
      const match = await bcrypt.compare(password, foundUser.password_hash);
      if (match) {
        const accessToken = jwt.sign(
          { username: foundUser.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: EXPIRY_TIME_OF_ACCESS_TOKEN }
        );
        await userCollection.updateOne(
          { username: foundUser.username },
          { $set: { access_token: accessToken } }
        );
        return { access_token: accessToken };
      } else {
        return { error: "Password is incorrect" };
      }
    }
  }
}

module.exports = {UserQueries, UserMutations}
