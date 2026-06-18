const jwt = require('jsonwebtoken')
require('dotenv').config();

const Pet = require('../model/Pet');

const getUserPets = async (userId) => {
    return await Pet.find({ 'user._id': userId })
        .populate('category')
        .select('-user')
        .sort('-createdAt');
}

const createUserToken = async (user, req, res) => {

    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.SECRET)

    const pets = await getUserPets(user._id)

    res.status(200).json({
        message: "You are authenticated",
        token,
        user: {
            userId: user._id,
            isAdmin: user.isAdmin,
            username: user.name,
            email: user.email
        },
        pets
    })
}

module.exports = createUserToken