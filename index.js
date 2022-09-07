const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

//local imports
const { MONGODB } = require("./config.js");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("mongodb connected");
    return server.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`server is running on ${res.url}`);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});
