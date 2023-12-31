const express = require("express");
const cors = require("cors");
const AppSchema = require("./graphql/appSchema");
const { createHandler } = require('graphql-http/lib/use/express');
const expressPlayground = require('graphql-playground-middleware-express').default;
require("dotenv").config();

if (!process.env.BACKEND_PORT) {console.info("BACKEND_PORT not specified in .env file, using default port 8080");}
const BACKEND_PORT = process.env.BACKEND_PORT || 8080;

if (!process.env.CORS_ORIGIN) {throw new Error("CORS_ORIGIN not specified in .env file");}
const CORS_OPTIONS = {
  origin: [process.env.CORS_ORIGIN],
  credentials: true,
};

const app = express();
app.use(cors(CORS_OPTIONS));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Phillip's Convergence Concepts Back-end API");
});

app.all("/graphql", createHandler({schema: AppSchema}));
app.get("/playground", expressPlayground({endpoint:"/graphql"}));

app.listen(BACKEND_PORT, () => {
  console.log(`Server started on port: ${BACKEND_PORT}`);
});
