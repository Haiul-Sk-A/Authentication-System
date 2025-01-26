const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    // Extract token from cookies
    const { token } = req.cookies;

    // Check if the token is missing
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, Login again' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user ID to the request object
        req.user = { id: decoded._id }; 

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors
        return res.status(401).json({ message: 'Unauthorized, Login again' });
    }
};

module.exports = userAuth;