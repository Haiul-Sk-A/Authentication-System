const jwt = require('jsonwebtoken');
const userModel = require('../model/userModels'); // Path to your user model
const blackListTokenModel = require('../model/blacklistToken.model'); // Path to your blacklistToken model

// Middleware to check if the user is authenticated
const authMiddleware = async (req, res, next) => {
    try {
        // Retrieve the token from cookies or authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token is missing' });
        }

        // Check if the token is blacklisted
        const isBlacklisted = await blackListTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using async/await
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ message: 'Unauthorized: User not found' });
        }

        // Attach necessary user details to the request object
        req.user = { userId: user._id, email: user.email };

        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = authMiddleware;