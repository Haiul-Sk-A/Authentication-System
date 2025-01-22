const mongoose = require('mongoose');

function connectToDb () {
    mongoose.connect(process.env.MONGO_URI, )
    .then (() => {
        console.log('connected to db');
    })
    .catch((error) =>{
        console.log('error connecting to db',error.message);
    })
}

module.exports = connectToDb;