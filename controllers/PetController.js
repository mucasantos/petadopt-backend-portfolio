const Pet = require('../model/Pet');
const ObjectId = require('mongoose').Types.ObjectId;
const Category = require('../model/Category');
const { uploadToCloudinary } = require('../helpers/cloudinary');

module.exports = class PetController {

  // Create a pet listing
  static async createPet(req, res) {
    try {
      const category = await Category.findById(req.body.category);

      if (!category) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      let images = [];
      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'pets'));
          images = await Promise.all(uploadPromises);
        } catch (uploadError) {
          return res.status(500).json({
            message: 'Error uploading images to Cloudinary.',
            error: uploadError.message
          });
        }
      } else if (req.body.images) {
        images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }

      if (images.length === 0) {
        images = [category.image];
      }

      const pet = new Pet({
        ...req.body,
        images,
        user: req.user,
        available: true,
        isVerified: false
      });

      const newPet = await pet.save();

      return res.status(201).json({
        message: 'Pet created successfully!',
        newPet
      });

    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = {};
        Object.keys(error.errors).forEach((field) => {
          messages[field] = error.errors[field].message;
        });
        return res.status(422).json({ messages });
      }

      return res.status(500).json({
        message: 'Error creating pet',
        error: error.message
      });
    }
  }

  // Get all verified pets (paginated)
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch verified pets with pagination and sorting
      const pets = await Pet.find({ isVerified: true })
        .populate('category')
        .sort('createdAt')
        .skip(skip)
        .limit(limitNumber);

      const total = await Pet.countDocuments({ isVerified: true });

      res.status(200).json({
        pagination: {
          total: total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        },
        pets: pets
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pets', error: error.message });
    }
  }

  // Get all pets belonging to the authenticated user
  static async getAllUserPets(req, res) {
    const user = req.user;

    const pets = await Pet.find({ 'user._id': user._id })
      .populate('category')
      .sort('-createdAt');
    res.status(200).json({ pets: pets });
  }

  // Get all pet categories
  static async getAllCategories(req, res) {
    const categories = await Category.find();
    res.status(200).json({ categories: categories });
  }

  // Get all pets adopted by the authenticated user
  static async getAllUserAdoptions(req, res) {
    const user = req.user;
    const pets = await Pet.find({ 'adopter._id': user._id })
      .populate('category')
      .sort('-createdAt');

    res.status(200).json({ pets: pets });
  }

  // Get a single pet by ID
  static async getPetById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID!' });
      return;
    }

    const pet = await Pet.findById(id).populate('category');
    if (!pet) {
      res.status(404).json({ message: 'Pet not found.' });
      return;
    }
    res.status(200).json({ pet: pet });
  }

  // Remove a pet by ID (only if owned by requester)
  static async removePetById(req, res) {
    const id = req.params.id;
    const user = req.user;

    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID!' });
      return;
    }

    const pet = await Pet.findById(id);
    if (!pet) {
      res.status(404).json({ message: 'Pet not found.' });
      return;
    }

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: 'Could not delete: unauthorized access.' });
      return;
    }

    const deleted = await Pet.findByIdAndDelete(id);
    res.status(200).json({ pet: deleted, message: 'Pet deleted successfully!' });
  }

  // Update an existing pet listing
  static async updatePet(req, res) {
    const id = req.params.id;
    const pet = new Pet(req.body);
    const updateData = {};

    const petExists = await Pet.findById(id);
    if (!petExists) {
      res.status(404).json({ message: 'Pet not found.' });
      return;
    }

    const user = req.user;

    if (petExists.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: 'You cannot edit a pet listing owned by another user.' });
      return;
    }

    // Validation checks
    if (!pet.name) {
      res.status(422).json({ message: 'Name is required' });
      return;
    } else {
      updateData.name = pet.name;
    }

    if (!pet.weight) {
      res.status(422).json({ message: 'Weight is required' });
      return;
    } else {
      updateData.weight = pet.weight;
    }

    if (!pet.color) {
      res.status(422).json({ message: 'Color is required' });
      return;
    } else {
      updateData.color = pet.color;
    }

    if (!pet.age) {
      res.status(422).json({ message: 'Age is required' });
      return;
    } else {
      updateData.age = pet.age;
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'pets'));
        images = await Promise.all(uploadPromises);
      } catch (uploadError) {
        return res.status(500).json({
          message: 'Error uploading images to Cloudinary.',
          error: uploadError.message
        });
      }
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (images.length > 0) {
      updateData.images = images;
    }

    await Pet.findByIdAndUpdate(id, updateData);
    res.status(200).json({ message: 'Pet updated successfully!' });
  }

  // Schedule a visit for adoption
  static async schedule(req, res) {
    const petId = req.params.id;

    const petExists = await Pet.findById(petId);
    if (!petExists) {
      res.status(404).json({ message: 'Pet not found.' });
      return;
    }

    const user = req.user;

    if (petExists.user._id.equals(user._id)) {
      res.status(422).json({ message: 'You cannot schedule a visit for your own pet.' });
      return;
    }

    if (petExists.adopter) {
      if (petExists.adopter._id.equals(user._id)) {
        res.status(422).json({ message: 'You have already scheduled a visit for this pet.' });
        return;
      }
    }

    petExists.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image
    };

    await Pet.findByIdAndUpdate(petId, petExists);
    res.status(200).json({
      message: `Visit scheduled successfully. Please contact ${petExists.user.name} at ${petExists.user.phone || ''}`
    });
  }

  // Conclude the adoption cycle
  static async concludeAdoption(req, res) {
    const petId = req.params.id;

    const petExists = await Pet.findById(petId);

    if (!petExists) {
      res.status(404).json({ message: 'Pet not found.' });
      return;
    }

    if (petExists.available === false) {
      res.status(404).json({ message: 'Pet already adopted.' });
      return;
    }

    petExists.available = false;

    await Pet.findByIdAndUpdate(petId, petExists);

    res.status(200).json({
      message: 'Congratulations! The adoption cycle was completed successfully!'
    });
  }

  // Administrative route to verify all unverified pets
  static async updateAllisVerified(req, res) {
    const data = req.body.data;

    if (data === undefined) {
      return res.status(400).json({
        message: 'Error updating documents: "data" key is required in the JSON request body. {data: true/false}'
      });
    }

    try {
      const result = await Pet.updateMany({ isVerified: false }, { $set: { isVerified: true } });

      res.status(200).json({
        message: 'Pets updated successfully',
        petsCount: result.modifiedCount
      });
      console.log(`Documents modified: ${result.modifiedCount}`);
    } catch (err) {
      res.status(500).json({ message: 'Error updating documents:', error: err.message });
    }
  }
};
