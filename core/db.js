const mongoose = require('mongoose');
const mongouri = process.env.MONGO_URI || 'mongodb://127.0.0.1/waifuseum';

mongoose.connect(mongouri).then(() => {
    console.log('Connected to database!');
});
