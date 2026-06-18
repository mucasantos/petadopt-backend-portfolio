const Pet = require('../model/Pet');
const User = require('../model/User');

const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class AdminController {

    // Get all pets
    static async getAllPets(req, res) {
        // Retrieve all pets sorted by creation date
        const pets = await Pet.find().sort('-createdAt');
        res.status(200).json({ pets: pets });
    }

    // Get all users
    static async getAllUsers(req, res) {
        // Retrieve all users sorted by creation date
        const users = await User.find().sort('-createdAt');

        users.forEach((user) => {
            user.password = undefined;
            user.confirmpassword = undefined;
        });
        res.status(200).json({ users: users });
    }

    // Verify a pet listing
    static async verify(req, res) {
        const id = req.params.id;

        try {
            await Pet.findByIdAndUpdate(
                { _id: id },
                { $set: { isVerified: true } },
                { new: true }
            );
            res.status(200).json({ message: "Update successful!" });
        } catch (error) {
            res.status(500).json({ error });
        }
    }

    // Remove a pet by ID
    static async removePetById(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "Invalid ID!" });
            return;
        }

        const pet = await Pet.findById(id);
        if (!pet) {
            res.status(404).json({ message: "Pet not found." });
            return;
        }

        const deleted = await Pet.findByIdAndDelete(id);
        res.status(200).json({ pet: deleted, message: "Pet deleted successfully!" });
    }
};




