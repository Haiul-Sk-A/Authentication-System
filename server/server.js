const express = require("express");
const cors = require("cors");
require('dotenv/config');
const cookieParser = require("cookie-parser");
const connectToDb  = require("./config/db.js");
const authRouter = require("./routes/authRoutes.js");
const userRouter  = require("./routes/userRoutes.js");

const app = express();

const port = process.env.PORT || 5000;  // Default port should be higher like 5000 or 3000
connectToDb();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = 'http://localhost:5173';
app.use(cors({ 
    origin: allowedOrigins,
    credentials: true 
}));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));