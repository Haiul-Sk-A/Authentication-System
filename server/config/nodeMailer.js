const nodemailer = require('nodemailer');

const transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER || "your-email@gmail.com", // Your email address
        pass: process.env.SMTP_PASS || "your-app-password" // Your Google App Password
    }
});

module.exports = transpoter;
