const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

if (!process.env.MONGODB_URI) {throw new Error("MONGODB_URI not specified in .env file");}
const MONGODB_URI = process.env.MONGODB_URI;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let connection;
const run = async () => {
  connection = await client.connect();
  console.log("Connected successfully to the mongoDB server");
}

run();

const db = client.db("convergence_concepts");
module.exports = db;