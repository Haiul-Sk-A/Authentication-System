import mongoose from "mongoose";

export function connectToDb() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to DB');
        })
        .catch((error) => {
            console.log("Error connecting to DB:", error.message);
        });
}
