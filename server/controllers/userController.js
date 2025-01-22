const userModel = require('../model/userModels');

module.exports.getUserData = async (req, res) => {
    try {
        const { userId } = req.body; // Extract userId from request body

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified, // Fixed typo: isAccountVerified
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
