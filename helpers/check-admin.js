const checkAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied! This operation is restricted to administrators." 
    });
  }
};

module.exports = checkAdmin;
