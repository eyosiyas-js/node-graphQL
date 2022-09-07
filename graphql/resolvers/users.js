const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");
const mongoose = require("mongoose");

const User = require("../../modals/User");
const Post = require("../../modals/Posts");
const {
  ValidateRegisterUser,
  ValidateLoginUser,
} = require("../../utils/validaters");
const { SECRET_KEY } = require("../../config");

module.exports = {
  Query: {
    async getUser(_, { body }) {
      const user = await User.findOne({ username: body });
      if (user) {
        const posts = await Post.find({ username: body });
        return {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
          email: user.email,
          posts: posts,
        };
      } else {
        throw new UserInputError("user not found",{
          errors:{
            body:"User not found"

            
          }
        })
      }
    },
  },
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = ValidateLoginUser(username, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "user not found";
        throw new UserInputError("user not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Credentials";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      return {
        ...user._doc,

        id: user._id,
        token: token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      //Validate the data

      const { errors, valid } = ValidateRegisterUser(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // check for account visibility

      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("This username is already taken", {
          errors: {
            username: "this username is already taken",
          },
        });
      }

      password = await bcrypt.hash(password, 12);
      const newUser = User({
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = jwt.sign(
        {
          id: res.id,
          email: res.email,
          username: res.username,
          password: res.password,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      return {
        ...res._doc,
        id: res._id,
        token: token,
      };
    },
  },
};
