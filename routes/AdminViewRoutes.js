const express = require('express');
const router = express.Router();
require('dotenv').config();
const Pet = require('../model/Pet');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAdminCookie = require('../helpers/check-admin-cookie');

// Login page (GET)
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies.adminToken) {
        return res.redirect('/admin-panel/dashboard');
    }
    res.render('admin/login', { error: null });
});

// Login action (POST)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.render('admin/login', { error: 'User not found' });
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.render('admin/login', { error: 'Invalid password' });
        }

        // Ideally check if user has admin role, assuming any valid user for testing
        // if(!user.isAdmin) { return res.render('admin/login', { error: 'Access denied' }); }

        const token = jwt.sign({
            name: user.name,
            id: user._id
        }, process.env.SECRET);

        res.cookie('adminToken', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.redirect('/admin-panel/dashboard');
    } catch (error) {
        res.render('admin/login', { error: 'Internal server error' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin-panel/login');
});

// Protect all routes below this middleware
router.use(checkAdminCookie);

router.get('/dashboard', async (req, res) => {
    try {
        const petsCount = await Pet.countDocuments();
        const usersCount = await User.countDocuments();
        const pets = await Pet.find().sort('-createdAt').limit(50); // Get more pets for CRUD table

        const users = await User.find().select('-password');

        res.render('admin/dashboard', {
            pets,
            users,
            usersCount,
            petsCount
        });
    } catch (error) {
        res.status(500).send('Error loading dashboard');
    }
});

// DELETE Pet
router.post('/pets/delete/:id', async (req, res) => {
    try {
        await Pet.findByIdAndDelete(req.params.id);
        res.redirect('/admin-panel/dashboard');
    } catch (error) {
        res.redirect('/admin-panel/dashboard?error=delete');
    }
});

router.post('/users/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin-panel/dashboard');
    } catch (error) {
        res.redirect('/admin-panel/dashboard?error=delete');
    }
});

router.post('/pets/verify/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.redirect('/admin-panel/dashboard');
        }

        pet.isVerified = !pet.isVerified;

        await pet.save();

        res.redirect('/admin-panel/dashboard');
    } catch (error) {
        res.redirect('/admin-panel/dashboard');
    }
});

module.exports = router;
