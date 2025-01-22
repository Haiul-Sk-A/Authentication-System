const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    const { token } = req.cookies; // Ensure you have a middleware like `cookie-parser` for parsing cookies.

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, Login again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT

        if (decoded) {
            req.body.userId = decoded._id; // Attach the decoded user ID to the request
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(401).json({ message: 'Unauthorized, Login again' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized, Login again' });
    }
};

module.exports = userAuth;
