const User = require('../model/User');
const mongoose = require('../db/conn');
const bcrypt = require('bcrypt');
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const Pet = require('../model/Pet');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { uploadToCloudinary } = require('../helpers/cloudinary');

module.exports = class UserController {
  static async register(req, res) {
    try {
      const {
        name,
        email,
        phone,
        password,
        confirmpassword
      } = req.body;

      // Mandatory validation checks
      const requiredFields = [
        { field: name, message: 'Name is required.' },
        { field: email, message: 'Email is required.' },
        { field: phone, message: 'Phone is required.' },
        { field: password, message: 'Password is required.' },
        { field: confirmpassword, message: 'Password confirmation is required.' }
      ];

      const emailRegex = /^\S+@\S+\.\S+$/;

      if (!emailRegex.test(email)) {
        return res.status(422).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      for (const item of requiredFields) {
        if (!item.field) {
          return res.status(422).json({
            success: false,
            message: item.message
          });
        }
      }

      // Check password matching
      if (password !== confirmpassword) {
        return res.status(422).json({
          success: false,
          message: 'Passwords do not match.'
        });
      }

      // Check for existing user
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password: passwordHash,
        isAdmin: false
      });

      let newUser;
      try {
        newUser = await user.save();
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'A user with this email address already exists.'
          });
        }

        if (error.name === 'ValidationError') {
          const firstError = Object.values(error.errors)[0];
          return res.status(422).json({
            success: false,
            message: firstError.message
          });
        }

        throw error;
      }

      // Generate JWT token
      await createUserToken(newUser, req, res);

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }

  static async login(req, res) {
    const user = new User(req.body);

    if (!user.email) {
      res.status(422).json({ message: 'Email is required' });
      return;
    }

    if (!user.password) {
      res.status(422).json({ message: 'Password is required' });
      return;
    }

    const userExists = await User.findOne({ email: user.email });

    if (!userExists) {
      res.status(422).json({ message: 'User not found with this email!', success: false });
      return;
    }

    // Compare passwords
    const checkPassword = await bcrypt.compare(user.password, userExists.password);

    if (!checkPassword) {
      res.status(422).json({ message: 'Invalid credentials!', success: false });
      return;
    } else {
      await createUserToken(userExists, req, res);
    }
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, process.env.SECRET);

      currentUser = await User.findById(decoded.id);
      if (currentUser) {
        currentUser.password = undefined;
      }
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(422).json({ message: 'User not found!', success: false });
      return;
    }

    user.password = undefined;
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;
    const userFromDB = req.user;

    if (!userFromDB) {
      res.status(422).json({ message: 'User does not exist!', success: false });
      return;
    }

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, 'users');
        userFromDB.image = imageUrl;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary.',
          error: uploadError.message
        });
      }
    } else if (req.body.image) {
      userFromDB.image = req.body.image;
    }

    const userFromReq = new User(req.body);

    if (!userFromReq.name) {
      res.status(422).json({ message: 'Name is required' });
      return;
    }
    userFromDB.name = userFromReq.name;

    if (!userFromReq.email) {
      res.status(422).json({ message: 'Email is required' });
      return;
    }

    if (!userFromReq.phone) {
      res.status(422).json({ message: 'Phone is required' });
      return;
    }
    userFromDB.phone = userFromReq.phone;

    if (userFromReq.password != null && userFromReq.password !== '') {
      if (userFromReq.password !== userFromReq.confirmpassword) {
        res.status(422).json({ message: 'Passwords do not match!' });
        return;
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(userFromReq.password, salt);
      userFromDB.password = passwordHash;
    }

    const userExists = await User.findOne({ email: userFromReq.email });

    if (userFromDB.email !== userFromReq.email && userExists) {
      res.status(422).json({ message: 'Email address already in use.' });
      return;
    }
    userFromDB.email = userFromReq.email;

    try {
      await User.findByIdAndUpdate(
        { _id: userFromDB._id },
        { $set: userFromDB },
        { new: true }
      );
      res.status(200).json({ message: 'Update successful!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const userId = req.user._id;

      // Cascade delete: remove user's pets
      await Pet.deleteMany({ 'user._id': userId });

      // Remove the user
      await User.findByIdAndDelete(userId);

      return res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
};
