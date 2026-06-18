const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkAdminCookie = (req, res, next) => {
    const token = req.cookies.adminToken;

    if (!token) {
        return res.redirect('/admin-panel/login');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET);
        req.user = verified;
        // Optional: check if verified user has admin role (if role exists in schema)
        next();
    } catch (err) {
        res.clearCookie('adminToken');
        res.redirect('/admin-panel/login');
    }
};

module.exports = checkAdminCookie;
