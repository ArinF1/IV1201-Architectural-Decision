const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate users via JWT stored in an HTTP-only cookie.
 * Rationale: Protects routes from unauthorized access and prevents XSS token theft.
 */
const authenticateToken = (req, res, next) => {
    //Get token from the cookie 
    const token = req.cookies.auth_token;

    if (!token) {
        const error = new Error('Access denied. No session cookie found.');
        error.status = 401; // Unauthorized
        return next(error);
    }

    try {
        // Verify the token using JWT_SECRET from .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        //Attach user data (person_id, role) to the request object
        req.user = verified; 
        
        // Move to the next function (the Controller)
        next();
    } catch (err) {
        const error = new Error('Invalid or expired session.');
        error.status = 403;
        next(error);
    }
};

module.exports = { authenticateToken };