const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_for_demo');
        req.user = verified; // Contains id and role
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

// Check for specific roles 
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Permission denied for this role" });
        }
        next();
    };
};