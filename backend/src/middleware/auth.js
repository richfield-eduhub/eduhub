// backend/src/middleware/auth.js
const { sessions, users, safeUser } = require('../models/store');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const userId = sessions[token];
  if (!userId) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }

  const user = users.find(u => u.id === userId);
  if (!user || user.status === 'inactive') {
    return res.status(401).json({ message: 'Account not found or deactivated.' });
  }

  req.user  = user;
  req.token = token;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}.` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
