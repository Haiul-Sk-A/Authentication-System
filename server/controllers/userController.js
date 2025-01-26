const userModel = require("../model/userModels");

module.exports.getUserData = async (req, res) => {
    try {
        const { userId } = req.user; 
        
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
