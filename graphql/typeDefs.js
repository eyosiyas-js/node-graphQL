const gql = require("graphql-tag");

module.exports = gql`
  type post {
    id: ID!
    username: String!
    createdAt: String!
    body: String!
    comments: [Comment]!
    likes: [Like]!
  }
 
  type Comment {
    id: ID!
    username: String!
    body: String!
    createdAt: String!
    likes:[Like]
  }
  type Like {
    id: ID!
    username: String!
    createdAt: String!
  }
  type singleUser {
    id: ID!
    username: String!
    createdAt: String!
    email: String!
    posts: [post]
  }
  type Query {
    getPosts: [post]
    getPost(postId: ID!): post
    getUser(body: String!): singleUser
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    token: String!
    createdAt: String!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createPost(body: String!): post!
    deletePost(postId: ID!): String!
    editPost(postId: ID!, body: String!): post!
    createComment(postId: ID!, body: String!): post!
    deleteComment(postId: ID!, commentId: ID!): post!
    editComment(postId: ID!, commentId: ID!, body: String!): post!
    likePost(postId: ID!): post!
    likeComment(postId:ID!,commentId:ID!):post!
  }
`;
