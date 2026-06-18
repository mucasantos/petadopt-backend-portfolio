const mongoose = require('../db/conn');
const { Schema } = mongoose;

const User = mongoose.model(
  'User',
  new Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required.']
      },
      email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
      },
      password: {
        type: String,
        required: [true, 'Password is required.']
      },
      image: {
        type: String
      },
      phone: {
        type: String,
        required: [true, 'Phone is required.']
      },
      isAdmin: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: true
    }
  )
);

module.exports = User;