import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import {connectToDb} from "./DB/db.js"

const app = express();
const port = process.env.PORT || 500;
connectToDb()
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))

app.get('/',(req,res) => {
    res.send('Hello World')
})

app.listen(port, () => console.log( `Server started on PORT:${port}`))