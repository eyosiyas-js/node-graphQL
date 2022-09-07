const Post = require("../../modals/Posts");
const AuthCheck = require("../../utils/AuthCheck");
const { MONGODB } = require("../../config");
const { AuthenticationError, UserInputError } = require("apollo-server");
module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body, file }, context) {
      const user = AuthCheck(context);
      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }
      const newPost = new Post({
        body: body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      return post;
    },
    async deletePost(_, { postId }, context) {
      const currentuser = AuthCheck(context);
      try {
        const user = await Post.findById(postId);
        if (currentuser.username === user.username) {
          await Post.findByIdAndDelete(postId);
          return "post have been deleted";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async editPost(_, { postId, body }, context) {
      const user = AuthCheck(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.username === user.username) {
          post.body = body;

          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("post not found");
      }
    },
    async likePost(_, { postId }, context) {
      const user = AuthCheck(context);
      const post = await Post.findById(postId);

      if (post.likes.find((like) => like.username === user.username)) {
        // liked so unlikeit
        post.likes = post.likes.filter(
          (like) => like.username !== user.username
        );
      } else {
        //unliked so like it
        post.likes.push({
          username: user.username,
          createdAt: new Date().toISOString(),
        });
      }
      await post.save();
      return post;
    },
    createComment: async (_, { postId, body }, context) => {
      const { username } = AuthCheck(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.push({
          username: username,
          body: body,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async deleteComment(_, { postId, commentId }, context) {
      const post = await Post.findById(postId);
      const user = AuthCheck(context);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].username === user.username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async editComment(_, { postId, body, commentId }, context) {
      const post = await Post.findById(postId);
      const user = AuthCheck(context);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].username === user.username) {
          post.comments[commentIndex].body = body;
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async likeComment(_, { postId, commentId }, context) {
      const user = AuthCheck(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (
          post.comments[commentIndex].likes.find(
            (like) => like.username === user.username
          )
        ) {
          post.comments[commentIndex].likes = post.comments[commentIndex].likes.filter(
            (like) => like.username !== user.username
          );
        } else {
          post.comments[commentIndex].likes.push({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not Found");
      }
    },
  },
};
