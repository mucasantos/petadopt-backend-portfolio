const jwt = require('jsonwebtoken');
const User = require('../model/User');

require('dotenv').config();

const checkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({
        message: 'Access denied! Token not provided.'
      });
    }

    // Verify Bearer token format
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Malformed token.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Retrieve user
    const user = await User.findById(decoded.id)
      .select('-password -confirmpassword');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    // Attach user to request object
    req.user = user;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.'
      });
    }

    return res.status(500).json({
      message: 'Internal server error.'
    });
  }
};

module.exports = checkToken;