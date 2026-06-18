const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Category = mongoose.model(
  'Category',
  new Schema(
    {
      name: {
        type: String,
        required: true
      },

      image: {
        type: String
      }
    },
    { timestamps: true }
  )
);

module.exports = Category;
