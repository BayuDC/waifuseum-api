const mongoose = require('mongoose');
const mongouri = process.env.MONGO_URI || 'mongodb://127.0.0.1/waifuseum';

module.exports = next => {
    mongoose.connect(mongouri).then(() => {
        console.log('Connected to database!');

        next();
    });
};
