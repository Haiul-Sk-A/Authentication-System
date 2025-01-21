const express = require("express");
const cors = require("cors");
require('dotenv/config');
const cookieParser = require("cookie-parser");
const connectToDb  = require("./DB/db.js");
const authRouter = require("./routes/authRoutes.js");

const app = express();

const port = process.env.PORT || 5000;  // Default port should be higher like 5000 or 3000
connectToDb();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', authRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
