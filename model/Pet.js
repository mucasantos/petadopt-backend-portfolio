const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Pet = mongoose.model(
  'Pet',
  new Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required']
      },
      breed: {
        type: String,
        required: [true, 'Breed is required']
      },
      gender: {
        type: String,
        enum: {
          values: ['male', 'female', 'other'],
          message: 'Gender must be male, female or other'
        },
        required: [true, 'Gender is required']
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
      },
      age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [0, 'Age must be a non-negative integer'],
        validate: {
          validator: Number.isInteger,
          message: 'Age must be an integer'
        }
      },
      weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [1, 'Weight must be a positive integer'],
        validate: {
          validator: Number.isInteger,
          message: 'Weight must be an integer'
        }
      },
      color: {
        type: String,
        required: [true, 'Color is required']
      },
      story: {
        type: String,
        required: [true, 'Story is required']
      },
      images: {
        type: [String],
        required: [true, 'Images are required']
      },
      available: {
        type: Boolean,
        default: true
      },
      isVerified: {
        type: Boolean,
        default: false
      },
      user: Object,
      adopter: Object
    },
    { timestamps: true }
  )
);

module.exports = Pet;