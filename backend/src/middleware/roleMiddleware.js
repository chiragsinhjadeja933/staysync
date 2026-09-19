/**
 * Middleware to restrict access based on user roles
 * @param {string[]} allowedRoles - Array of allowed roles: ['tenant', 'manager', 'admin']
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session missing.'
      });
    }

    const userRole = req.user.role;

    // Admin role automatically has access to everything
    if (userRole === 'admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Your role (${userRole}) does not have permission to access this resource. Required role(s): ${allowedRoles.join(', ')}`
    });
  };
}

module.exports = {
  requireRole
};
