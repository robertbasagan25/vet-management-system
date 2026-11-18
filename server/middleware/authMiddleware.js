const jwt = require('jsonwebtoken');

// 1. Tinitingnan kung may valid JWT Token ang user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Naglalaman ng { id, role }
    next(); // Tuloy sa kasunod na function
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// 2. Tinitingnan kung allowed ang role ng user (RBAC)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission.' });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };